// Drferdi Transformer Engine V2 — Optimizer Engine
import { getStrategyHints } from './strategies'
import { collectProviderStream } from './provider-stream'
import { parseSuperPromptMarkdown } from './super-prompt-format'

import { buildOptimizeSystemPrompt, buildOptimizeUserPrompt } from '@/lib/llm/prompt-builder'
import { getProvider, getScopedProviderOverrides } from '@/lib/llm/provider-registry'
import { logger } from '@/lib/logger'
import { getTemplateBySlug } from '@/lib/templates/loader'
import { matchTemplateWithEmbeddings } from '@/lib/templates/matcher'
import { renderTemplate } from '@/lib/templates/renderer'
import type { OptimizeLane, OptimizeRequest, OptimizeResponse, SuperPrompt } from '@/types'

function buildStreamingRequest(
  systemPrompt: string,
  userPrompt: string,
  optimizerLane: OptimizeLane
) {
  return {
    systemPrompt,
    userPrompt,
    maxTokens: optimizerLane === 'INTERACTIVE' ? 900 : 2200,
    temperature: optimizerLane === 'INTERACTIVE' ? 0.4 : 0.7,
  }
}

const INTERACTIVE_RECOVERY_MAX_TOKENS = 2200

function resolveOptimizerLane(request: OptimizeRequest): OptimizeLane {
  return request.optimizerLane ?? 'INTERACTIVE'
}

async function resolveTemplateContext(request: OptimizeRequest, optimizerLane: OptimizeLane) {
  const template = request.templateSlug
    ? getTemplateBySlug(request.templateSlug)
    : optimizerLane === 'DEEP'
      ? await matchTemplateWithEmbeddings(request.rawIdea, request.taskType)
      : null

  const hints = template ? null : getStrategyHints(request.taskType, request.tone, request.format)

  let templateContext: string | undefined
  if (template) {
    const rendered = renderTemplate(template, {}, true)
    templateContext = `Template: ${template.name}\n\n${rendered}`
  } else if (hints) {
    templateContext = `Additional emphasis: ${hints.emphasisAreas.join(', ')}\nAdditional constraints: ${hints.additionalConstraints.join('; ')}`
  }

  return { template, templateContext }
}

/**
 * Transforms a raw, unstructured idea into a high-performance "Super Prompt".
 *
 * The optimization process includes:
 * 1. Semantic template matching based on the raw idea and task type.
 * 2. Injection of domain-specific strategy hints (Emphasis Areas, Constraints).
 * 3. Structural reinforcement using the proprietary Super-Prompt format.
 * 4. LLM-powered generation of the role, task, context, and chain-of-thought elements.
 *
 * @param request - The optimization request with raw idea, task type, tone, and format preferences.
 * @returns An optimized Super Prompt object includes role, task, constraints, and the full prompt string.
 *
 * @example
 * const optimized = await optimizePrompt({
 *   rawIdea: "Build a landing page",
 *   taskType: "CODING",
 *   tone: "TECHNICAL"
 * });
 */
export async function optimizePrompt(request: OptimizeRequest): Promise<OptimizeResponse> {
  const startTime = Date.now()
  const optimizerLane = resolveOptimizerLane(request)
  const { template, templateContext } = await resolveTemplateContext(request, optimizerLane)

  // 4. Build LLM prompts
  const systemPrompt = buildOptimizeSystemPrompt(optimizerLane)
  const userPrompt = buildOptimizeUserPrompt({
    rawIdea: request.rawIdea,
    taskType: request.taskType,
    tone: request.tone,
    format: request.format,
    targetLlm: request.targetLlm,
    optimizerLane,
    templateContext,
  })

  // 5. Call LLM provider
  const providerOverrides = getScopedProviderOverrides(request.provider, 'OPTIMIZER', optimizerLane)
  const provider = getProvider(
    request.provider,
    request.apiKey,
    providerOverrides.model,
    providerOverrides.baseUrl
  )
  const llmRequest = buildStreamingRequest(systemPrompt, userPrompt, optimizerLane)
  let llmResponse = await provider.generate({
    ...llmRequest,
  })

  if (optimizerLane === 'INTERACTIVE' && llmResponse.finishReason === 'length') {
    const recoveryResponse = await provider.generate({
      ...llmRequest,
      maxTokens: INTERACTIVE_RECOVERY_MAX_TOKENS,
    })

    if (recoveryResponse.content.trim().length > 0) {
      llmResponse = recoveryResponse
    }
  }

  // 6. Parse response into SuperPrompt
  let superPrompt: SuperPrompt
  try {
    superPrompt = parseSuperPromptMarkdown(llmResponse.content)
  } catch {
    logger.warn(
      { route: 'optimizePrompt', provider: request.provider, model: llmResponse.model },
      'optimizePrompt: markdown parse failed, using fallback'
    )
    // Fallback: wrap raw response as the full prompt
    superPrompt = {
      role: 'Expert assistant',
      task: request.rawIdea,
      context: '',
      chainOfThought: '',
      constraints: [],
      formatSpec: '',
      fullPrompt: llmResponse.content,
    }
  }

  const latencyMs = Date.now() - startTime

  return {
    superPrompt,
    metadata: {
      provider: request.provider,
      model: llmResponse.model,
      templateUsed: template?.slug,
      taskType: request.taskType,
      tone: request.tone,
      format: request.format,
      tokensUsed: llmResponse.tokensUsed,
      latencyMs,
    },
  }
}

/**
 * Streaming variant of the Optimizer. Calls provider.generateStream and invokes
 * onChunk for each delta as it arrives. After streaming completes the accumulated
 * markdown is post-parsed into a SuperPrompt.
 *
 * Note: metadata.model is sourced from provider.activeModel because generateStream
 * does not return a response envelope. This keeps OpenAI-compatible providers aligned
 * with the configured runtime model instead of their transport default label.
 */
export async function optimizePromptStreaming(
  request: OptimizeRequest,
  onChunk: (delta: string) => void
): Promise<OptimizeResponse> {
  const startTime = Date.now()
  const optimizerLane = resolveOptimizerLane(request)
  const { template, templateContext } = await resolveTemplateContext(request, optimizerLane)

  const systemPrompt = buildOptimizeSystemPrompt(optimizerLane)
  const userPrompt = buildOptimizeUserPrompt({
    rawIdea: request.rawIdea,
    taskType: request.taskType,
    tone: request.tone,
    format: request.format,
    targetLlm: request.targetLlm,
    optimizerLane,
    templateContext,
  })

  const providerOverrides = getScopedProviderOverrides(request.provider, 'OPTIMIZER', optimizerLane)
  const provider = getProvider(
    request.provider,
    request.apiKey,
    providerOverrides.model,
    providerOverrides.baseUrl
  )
  const llmRequest = buildStreamingRequest(systemPrompt, userPrompt, optimizerLane)
  let accumulated = await collectProviderStream(provider, llmRequest, onChunk)

  const visibleOutput = accumulated.trim()

  if (!visibleOutput) {
    const fallbackResponse = await provider.generate(llmRequest)
    if (
      optimizerLane === 'INTERACTIVE' &&
      fallbackResponse.finishReason === 'length' &&
      fallbackResponse.content.trim().length === 0
    ) {
      const recoveryResponse = await provider.generate({
        ...llmRequest,
        maxTokens: INTERACTIVE_RECOVERY_MAX_TOKENS,
      })
      accumulated = recoveryResponse.content
    } else {
      accumulated = fallbackResponse.content
    }
  }

  let superPrompt: SuperPrompt
  try {
    superPrompt = parseSuperPromptMarkdown(accumulated)
  } catch {
    if (optimizerLane === 'INTERACTIVE') {
      const recoveryResponse = await provider.generate({
        ...llmRequest,
        maxTokens: INTERACTIVE_RECOVERY_MAX_TOKENS,
      })

      if (recoveryResponse.content.trim().length > 0) {
        accumulated = recoveryResponse.content

        try {
          superPrompt = parseSuperPromptMarkdown(accumulated)

          const latencyMs = Date.now() - startTime

          return {
            superPrompt,
            metadata: {
              provider: request.provider,
              model: provider.activeModel,
              templateUsed: template?.slug,
              taskType: request.taskType,
              tone: request.tone,
              format: request.format,
              latencyMs,
            },
          }
        } catch {
          // Fall through to the existing raw fallback below.
        }
      }
    }

    superPrompt = {
      role: 'Expert assistant',
      task: request.rawIdea,
      context: '',
      chainOfThought: '',
      constraints: [],
      formatSpec: '',
      fullPrompt: accumulated,
    }
  }

  const latencyMs = Date.now() - startTime

  return {
    superPrompt,
    metadata: {
      provider: request.provider,
      model: provider.activeModel,
      templateUsed: template?.slug,
      taskType: request.taskType,
      tone: request.tone,
      format: request.format,
      latencyMs,
    },
  }
}
