// Drferdi Transformer Engine V2 — Anthropic/Claude Provider
import Anthropic from '@anthropic-ai/sdk'

import type { LLMProviderAdapter, ProviderConfig } from '../types'

import { DEFAULT_MODEL_MAP } from '@/lib/constants'
import type { LLMRequest, LLMResponse } from '@/types'

export class AnthropicProvider implements LLMProviderAdapter {
  readonly name = 'CLAUDE'
  readonly defaultModel = DEFAULT_MODEL_MAP.CLAUDE
  private client: Anthropic
  private model: string

  get activeModel() {
    return this.model
  }

  constructor(config: ProviderConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey })
    this.model = config.model ?? this.defaultModel
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: request.maxTokens,
      temperature: request.temperature,
      system: request.systemPrompt,
      messages: [{ role: 'user', content: request.userPrompt }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    return {
      content: textBlock?.text ?? '',
      model: response.model,
      tokensUsed: (response.usage.input_tokens ?? 0) + (response.usage.output_tokens ?? 0),
      finishReason: response.stop_reason ?? undefined,
    }
  }

  async *generateStream(request: LLMRequest): AsyncGenerator<string, void, unknown> {
    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: request.maxTokens,
      temperature: request.temperature,
      system: request.systemPrompt,
      messages: [{ role: 'user', content: request.userPrompt }],
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text
      }
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      })
      return true
    } catch {
      return false
    }
  }
}
