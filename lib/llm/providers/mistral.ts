// Drferdi Transformer Engine V2 — Mistral Provider
import { Mistral } from '@mistralai/mistralai'

import type { LLMProviderAdapter, ProviderConfig } from '../types'

import { DEFAULT_MODEL_MAP } from '@/lib/constants'
import type { LLMRequest, LLMResponse } from '@/types'

export class MistralProvider implements LLMProviderAdapter {
  readonly name = 'MISTRAL'
  readonly defaultModel = DEFAULT_MODEL_MAP.MISTRAL
  private client: Mistral
  private model: string

  get activeModel() {
    return this.model
  }

  constructor(config: ProviderConfig) {
    this.client = new Mistral({ apiKey: config.apiKey })
    this.model = config.model ?? this.defaultModel
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const response = await this.client.chat.complete({
      model: this.model,
      maxTokens: request.maxTokens,
      temperature: request.temperature,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
    })

    const choice = response.choices?.[0]
    return {
      content: typeof choice?.message?.content === 'string' ? choice.message.content : '',
      model: response.model ?? this.model,
      tokensUsed: response.usage
        ? (response.usage.promptTokens ?? 0) + (response.usage.completionTokens ?? 0)
        : undefined,
      finishReason: choice?.finishReason ?? undefined,
    }
  }

  async *generateStream(request: LLMRequest): AsyncGenerator<string, void, unknown> {
    const stream = await this.client.chat.stream({
      model: this.model,
      maxTokens: request.maxTokens,
      temperature: request.temperature,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
    })

    for await (const event of stream) {
      const delta = event.data?.choices?.[0]?.delta?.content
      if (typeof delta === 'string') yield delta
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.models.list()
      return true
    } catch {
      return false
    }
  }
}
