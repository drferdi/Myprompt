// Drferdi Transformer Engine V2 — Optimizer Engine
import { getStrategyHints } from './strategies'
import { applyCanonicalReport, parseCodingBriefSections } from './coding-brief-format'
import { collectProviderStream } from './provider-stream'
import { parseSuperPromptMarkdown } from './super-prompt-format'

import {
  buildCodingBriefSystemPrompt,
  buildCodingBriefUserPrompt,
  buildOptimizeSystemPrompt,
  buildOptimizeUserPrompt,
} from '@/lib/llm/prompt-builder'
import { getProvider, getScopedProviderOverrides } from '@/lib/llm/provider-registry'
import { logger } from '@/lib/logger'
import { validateCodingBrief } from '@/lib/prompt-quality/contract'
import { getTemplateBySlug } from '@/lib/templates/loader'
import { matchTemplateWithEmbeddings } from '@/lib/templates/matcher'
import { renderTemplate } from '@/lib/templates/renderer'
import type {
  OptimizeLane,
  OptimizeQuality,
  OptimizeRequest,
  OptimizeResponse,
  OutputKind,
  SuperPrompt,
} from '@/types'

export interface OptimizeStreamingOptions {
  /** Invoked immediately before the single Coding Brief repair call. */
  onRepair?: () => void
}

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

// ── Coding Brief route (docs/CODING_BRIEF_STANDARD.md) ───────────────────

const CODING_BRIEF_MAX_TOKENS = 1200
const CODING_BRIEF_TEMPERATURE = 0.3

function resolveOutputKind(request: OptimizeRequest): OutputKind {
  return request.outputKind ?? (request.taskType === 'CODING' ? 'CODING_BRIEF' : 'SUPER_PROMPT')
}

function buildCodingBriefRequest(systemPrompt: string, userPrompt: string) {
  return {
    systemPrompt,
    userPrompt,
    maxTokens: CODING_BRIEF_MAX_TOKENS,
    temperature: CODING_BRIEF_TEMPERATURE,
  }
}

function buildCodingBriefRepairUserPrompt(previous: string, issues: string[]): string {
  return `The Coding Brief below failed validation.

PREVIOUS BRIEF:
${previous}

VALIDATION ISSUES:
${issues.map((issue) => `- ${issue}`).join('\n')}

Fix every issue listed above and return only the corrected Coding Brief.`
}

/** True when the model output has no brief section at all (REPORT alone does not count). */
function isUnparseableBrief(raw: string): boolean {
  const { sections } = parseCodingBriefSections(raw)
  return sections.every((section) => section.heading === 'REPORT')
}

/** GOAL body of a brief, used as SuperPrompt.task so the renderer keeps a sensible title. */
function extractBriefGoal(markdown: string, fallback: string): string {
  const { sections } = parseCodingBriefSections(markdown)
  const goal = sections.find((section) => section.heading === 'GOAL')?.body
  return goal !== undefined && goal !== '' ? goal : fallback
}

/**
 * Generate a Coding Brief. Deliberately skips template/strategy resolution: the brief
 * standard fixes its own structure, so template hints would only add noise.
 *
 * `attempts` counts actual provider calls: 1 without repair, 2 with the single repair.
 */
async function runCodingBriefRoute(
  request: OptimizeRequest,
  startTime: number,
  onChunk?: (delta: string) => void,
  options?: OptimizeStreamingOptions
): Promise<OptimizeResponse> {
  const optimizerLane = resolveOptimizerLane(request)
  const systemPrompt = buildCodingBriefSystemPrompt()
  const userPrompt = buildCodingBriefUserPrompt({ rawIdea: request.rawIdea })

  const providerOverrides = getScopedProviderOverrides(request.provider, 'OPTIMIZER', optimizerLane)
  const provider = getProvider(
    request.provider,
    request.apiKey,
    providerOverrides.model,
    providerOverrides.baseUrl
  )
  const llmRequest = buildCodingBriefRequest(systemPrompt, userPrompt)

  const streaming = onChunk !== undefined
  let attempts = 0
  let raw: string
  let model: string
  let tokensUsed: number | undefined

  if (onChunk) {
    raw = await collectProviderStream(provider, llmRequest, onChunk)
    model = provider.activeModel
  } else {
    const response = await provider.generate(llmRequest)
    raw = response.content
    model = response.model
    tokensUsed = response.tokensUsed
  }
  attempts += 1

  let markdown = applyCanonicalReport(raw)
  let validation = validateCodingBrief(markdown)

  if (!validation.valid) {
    options?.onRepair?.()
    const repairResponse = await provider.generate({
      ...llmRequest,
      userPrompt: buildCodingBriefRepairUserPrompt(markdown, validation.issues),
    })
    attempts += 1
    if (!streaming) {
      model = repairResponse.model
      tokensUsed = repairResponse.tokensUsed
    }
    raw = repairResponse.content
    markdown = applyCanonicalReport(raw)
    validation = validateCodingBrief(markdown)
  }

  if (!validation.valid) {
    logger.warn(
      { route: 'codingBrief', provider: request.provider, model, issues: validation.issues },
      'coding brief failed validation after repair'
    )
  }

  // Two distinct failure reasons: 'parse_failed' when the (final) model output carries
  // no brief section at all; 'invalid_brief' when it parsed but still fails V1–V9.
  const quality: OptimizeQuality = validation.valid
    ? { complete: true, degraded: false, attempts }
    : {
        complete: false,
        degraded: true,
        reason: isUnparseableBrief(raw) ? 'parse_failed' : 'invalid_brief',
        attempts,
      }

  const superPrompt: SuperPrompt = {
    role: '',
    task: validation.brief?.goal ?? extractBriefGoal(markdown, request.rawIdea),
    context: '',
    chainOfThought: '',
    constraints: [],
    formatSpec: '',
    fullPrompt: markdown,
  }

  return {
    superPrompt,
    ...(validation.brief && { codingBrief: validation.brief }),
    metadata: {
      provider: request.provider,
      model,
      taskType: request.taskType,
      tone: request.tone,
      format: request.format,
      ...(tokensUsed !== undefined && { tokensUsed }),
      latencyMs: Date.now() - startTime,
      quality,
      outputKind: 'CODING_BRIEF',
    },
  }
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

  if (resolveOutputKind(request) === 'CODING_BRIEF') {
    return runCodingBriefRoute(request, startTime)
  }

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
  let attempts = 0
  let llmResponse = await provider.generate({
    ...llmRequest,
  })
  attempts += 1

  if (optimizerLane === 'INTERACTIVE' && llmResponse.finishReason === 'length') {
    const recoveryResponse = await provider.generate({
      ...llmRequest,
      maxTokens: INTERACTIVE_RECOVERY_MAX_TOKENS,
    })
    attempts += 1

    if (recoveryResponse.content.trim().length > 0) {
      llmResponse = recoveryResponse
    }
  }

  // 6. Parse response into SuperPrompt
  let superPrompt: SuperPrompt
  let quality: OptimizeQuality
  try {
    superPrompt = parseSuperPromptMarkdown(llmResponse.content)
    quality = { complete: true, degraded: false, attempts }
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
    quality = { complete: false, degraded: true, reason: 'parse_failed', attempts }
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
      quality,
      outputKind: 'SUPER_PROMPT',
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
  onChunk: (delta: string) => void,
  options?: OptimizeStreamingOptions
): Promise<OptimizeResponse> {
  const startTime = Date.now()

  if (resolveOutputKind(request) === 'CODING_BRIEF') {
    return runCodingBriefRoute(request, startTime, onChunk, options)
  }

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
  let attempts = 0
  let accumulated = await collectProviderStream(provider, llmRequest, onChunk)
  attempts += 1

  const visibleOutput = accumulated.trim()

  if (!visibleOutput) {
    const fallbackResponse = await provider.generate(llmRequest)
    attempts += 1
    if (
      optimizerLane === 'INTERACTIVE' &&
      fallbackResponse.finishReason === 'length' &&
      fallbackResponse.content.trim().length === 0
    ) {
      const recoveryResponse = await provider.generate({
        ...llmRequest,
        maxTokens: INTERACTIVE_RECOVERY_MAX_TOKENS,
      })
      attempts += 1
      accumulated = recoveryResponse.content
    } else {
      accumulated = fallbackResponse.content
    }
  }

  let superPrompt: SuperPrompt
  let quality: OptimizeQuality
  try {
    superPrompt = parseSuperPromptMarkdown(accumulated)
    quality = { complete: true, degraded: false, attempts }
  } catch {
    if (optimizerLane === 'INTERACTIVE') {
      const recoveryResponse = await provider.generate({
        ...llmRequest,
        maxTokens: INTERACTIVE_RECOVERY_MAX_TOKENS,
      })
      attempts += 1

      if (recoveryResponse.content.trim().length > 0) {
        accumulated = recoveryResponse.content

        try {
          superPrompt = parseSuperPromptMarkdown(accumulated)
          quality = { complete: true, degraded: false, attempts }

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
              quality,
              outputKind: 'SUPER_PROMPT',
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
    quality = { complete: false, degraded: true, reason: 'parse_failed', attempts }
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
      quality,
      latencyMs,
      outputKind: 'SUPER_PROMPT',
    },
  }
}
