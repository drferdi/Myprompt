// Drferdi Transformer Engine V2 — LLM Provider Interface
import type { LLMRequest, LLMResponse } from '@/types'

export interface LLMProviderAdapter {
  readonly name: string
  readonly defaultModel: string
  readonly activeModel: string
  generate(request: LLMRequest): Promise<LLMResponse>
  generateStream(request: LLMRequest): AsyncGenerator<string, void, unknown>
  validateApiKey(): Promise<boolean>
}

export interface ProviderConfig {
  apiKey: string
  model?: string
  baseUrl?: string
}
