// Drferdi Transformer Engine V2 — Grok/xAI Provider (OpenAI-compatible)
import type { ProviderConfig } from '../types'

import { OpenAIProvider } from './openai'

import { DEFAULT_MODEL_MAP, PROVIDER_BASE_URLS } from '@/lib/constants'

export class GrokProvider extends OpenAIProvider {
  override readonly name = 'GROK'
  override readonly defaultModel = DEFAULT_MODEL_MAP.GROK

  constructor(config: ProviderConfig) {
    super({
      apiKey: config.apiKey,
      model: config.model ?? DEFAULT_MODEL_MAP.GROK,
      baseUrl: config.baseUrl ?? PROVIDER_BASE_URLS.GROK,
    })
  }
}
