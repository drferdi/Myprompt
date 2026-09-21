// Drferdi Transformer Engine V2 — Local/Ollama Provider
import type { LLMProviderAdapter, ProviderConfig } from '../types'

import { DEFAULT_MODEL_MAP, PROVIDER_BASE_URLS } from '@/lib/constants'
import type { LLMRequest, LLMResponse } from '@/types'

export class LocalProvider implements LLMProviderAdapter {
  readonly name = 'LOCAL'
  readonly defaultModel = DEFAULT_MODEL_MAP.LOCAL
  private baseUrl: string
  private model: string

  get activeModel() {
    return this.model
  }

  constructor(config: ProviderConfig) {
    this.baseUrl = config.baseUrl ?? PROVIDER_BASE_URLS.LOCAL
    this.model = config.model ?? this.defaultModel
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.userPrompt },
        ],
        options: {
          num_predict: request.maxTokens,
          temperature: request.temperature,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.message?.content ?? '',
      model: data.model ?? this.model,
      tokensUsed: data.eval_count,
      finishReason: data.done ? 'stop' : undefined,
    }
  }

  async *generateStream(request: LLMRequest): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        stream: true,
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.userPrompt },
        ],
        options: {
          num_predict: request.maxTokens,
          temperature: request.temperature,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const lines = decoder.decode(value, { stream: true }).split('\n')
      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const parsed = JSON.parse(line)
          if (parsed.message?.content) {
            yield parsed.message.content
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      return response.ok
    } catch {
      return false
    }
  }
}
