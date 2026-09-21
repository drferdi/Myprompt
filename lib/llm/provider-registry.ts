// Drferdi Transformer Engine V2 — Provider Registry
import { OPENROUTER_LANE_MODEL_FALLBACKS } from './constants'
import { AnthropicProvider } from './providers/anthropic'
import { GrokProvider } from './providers/grok'
import { LocalProvider } from './providers/local'
import { MistralProvider } from './providers/mistral'
import { OpenAIProvider } from './providers/openai'
import { QwenProvider } from './providers/qwen'
import type { LLMProviderAdapter, ProviderConfig } from './types'

import type { LLMProviderName, OptimizeLane } from '@/types'

const providerConstructors: Record<
  LLMProviderName,
  new (config: ProviderConfig) => LLMProviderAdapter
> = {
  CLAUDE: AnthropicProvider,
  OPENAI: OpenAIProvider,
  MISTRAL: MistralProvider,
  QWEN: QwenProvider,
  GROK: GrokProvider,
  LOCAL: LocalProvider,
}

const envKeyMap: Record<LLMProviderName, string> = {
  CLAUDE: 'ANTHROPIC_API_KEY',
  OPENAI: 'OPENAI_API_KEY',
  MISTRAL: 'MISTRAL_API_KEY',
  QWEN: 'QWEN_API_KEY',
  GROK: 'XAI_API_KEY',
  LOCAL: '',
}

type ProviderRuntimeScope = 'OPTIMIZER' | 'EVALUATOR'

const scopedOpenAiModelEnvMap: Record<ProviderRuntimeScope, string> = {
  OPTIMIZER: 'OPTIMIZER_OPENAI_MODEL',
  EVALUATOR: 'EVALUATOR_OPENAI_MODEL',
}

const scopedOpenAiBaseUrlEnvMap: Record<ProviderRuntimeScope, string> = {
  OPTIMIZER: 'OPTIMIZER_OPENAI_BASE_URL',
  EVALUATOR: 'EVALUATOR_OPENAI_BASE_URL',
}

const optimizerLaneOpenAiModelEnvMap: Record<OptimizeLane, string> = {
  INTERACTIVE: 'OPTIMIZER_INTERACTIVE_OPENAI_MODEL',
  DEEP: 'OPTIMIZER_DEEP_OPENAI_MODEL',
}

const optimizerLaneOpenAiBaseUrlEnvMap: Record<OptimizeLane, string> = {
  INTERACTIVE: 'OPTIMIZER_INTERACTIVE_OPENAI_BASE_URL',
  DEEP: 'OPTIMIZER_DEEP_OPENAI_BASE_URL',
}

const OPENROUTER_BASE_URL_PATTERN = /^https:\/\/openrouter\.ai\/api\/v\d+\/?$/i

export function getProvider(
  name: LLMProviderName,
  apiKey?: string,
  model?: string,
  baseUrl?: string
): LLMProviderAdapter {
  const Constructor = providerConstructors[name]
  if (!Constructor) {
    throw new Error(`Unknown LLM provider: ${name}`)
  }

  const resolvedKey = apiKey || process.env[envKeyMap[name]] || ''

  if (!resolvedKey && name !== 'LOCAL') {
    throw new Error(
      `No API key provided for ${name}. Set ${envKeyMap[name]} or provide an API key.`
    )
  }

  return new Constructor({ apiKey: resolvedKey, model, baseUrl })
}

export function getAvailableProviders(): LLMProviderName[] {
  const available: LLMProviderName[] = []
  for (const [name, envKey] of Object.entries(envKeyMap)) {
    if (name === 'LOCAL' || process.env[envKey]) {
      available.push(name as LLMProviderName)
    }
  }
  return available
}

export function getScopedProviderOverrides(
  provider: LLMProviderName,
  scope: ProviderRuntimeScope,
  optimizerLane?: OptimizeLane
): Pick<ProviderConfig, 'model' | 'baseUrl'> {
  if (provider !== 'OPENAI') {
    return {}
  }

  const laneScopedModel =
    scope === 'OPTIMIZER' && optimizerLane
      ? process.env[optimizerLaneOpenAiModelEnvMap[optimizerLane]]?.trim()
      : ''
  const laneScopedBaseUrl =
    scope === 'OPTIMIZER' && optimizerLane
      ? process.env[optimizerLaneOpenAiBaseUrlEnvMap[optimizerLane]]?.trim()
      : ''
  const scopedModel = process.env[scopedOpenAiModelEnvMap[scope]]?.trim()
  const sharedModel = process.env.OPENAI_MODEL?.trim()
  const scopedBaseUrl = process.env[scopedOpenAiBaseUrlEnvMap[scope]]?.trim()
  const sharedBaseUrl = process.env.OPENAI_BASE_URL?.trim()
  const resolvedBaseUrl = laneScopedBaseUrl || scopedBaseUrl || sharedBaseUrl || ''
  const laneSharedFallbackModel =
    scope === 'OPTIMIZER' &&
    optimizerLane &&
    !laneScopedModel &&
    !scopedModel &&
    OPENROUTER_BASE_URL_PATTERN.test(resolvedBaseUrl) &&
    sharedModel
      ? OPENROUTER_LANE_MODEL_FALLBACKS[optimizerLane][sharedModel] || ''
      : ''

  return {
    ...(laneScopedModel || scopedModel || laneSharedFallbackModel || sharedModel
      ? {
          model: laneScopedModel || scopedModel || laneSharedFallbackModel || sharedModel,
        }
      : {}),
    ...(resolvedBaseUrl ? { baseUrl: resolvedBaseUrl } : {}),
  }
}
