// Drferdi Transformer Engine V2 — Qwen Provider (OpenAI-compatible)
import type { ProviderConfig } from '../types'

import { OpenAIProvider } from './openai'

import { DEFAULT_MODEL_MAP, PROVIDER_BASE_URLS } from '@/lib/constants'

export class QwenProvider extends OpenAIProvider {
  override readonly name = 'QWEN'
  override readonly defaultModel = DEFAULT_MODEL_MAP.QWEN

  constructor(config: ProviderConfig) {
    super({
      apiKey: config.apiKey,
      model: config.model ?? DEFAULT_MODEL_MAP.QWEN,
      baseUrl: config.baseUrl ?? PROVIDER_BASE_URLS.QWEN,
    })
  }
}
