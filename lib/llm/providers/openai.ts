// Drferdi Transformer Engine V2 — OpenAI Provider
import OpenAI from 'openai'

import type { LLMProviderAdapter, ProviderConfig } from '../types'

import { DEFAULT_MODEL_MAP } from '@/lib/constants'
import type { LLMRequest, LLMResponse } from '@/types'

function extractStreamTextDelta(chunk: unknown): string {
  const delta = (
    chunk as {
      choices?: Array<{
        delta?: {
          content?: unknown
        }
      }>
    }
  )?.choices?.[0]?.delta

  if (!delta) {
    return ''
  }

  if (typeof delta.content === 'string') {
    return delta.content
  }

  if (!Array.isArray(delta.content)) {
    return ''
  }

  return delta.content
    .map((part) => {
      if (typeof part === 'string') {
        return part
      }

      if (
        part &&
        typeof part === 'object' &&
        'text' in part &&
        typeof (part as { text?: unknown }).text === 'string'
      ) {
        return (part as { text: string }).text
      }

      return ''
    })
    .join('')
}

export class OpenAIProvider implements LLMProviderAdapter {
  readonly name: string = 'OPENAI'
  readonly defaultModel: string = DEFAULT_MODEL_MAP.OPENAI
  private client: OpenAI
  private model: string

  get activeModel() {
    return this.model
  }

  constructor(config: ProviderConfig) {
    const baseUrl = config.baseUrl ?? process.env.OPENAI_BASE_URL
    const configuredModel = process.env.OPENAI_MODEL?.trim()
    const fallbackLocalModel =
      configuredModel ||
      process.env.LOCAL_MODEL?.trim() ||
      process.env.OLLAMA_MODEL?.trim() ||
      'qwen3.5:4b'
    const isLocalCompatBaseUrl =
      typeof baseUrl === 'string' && /localhost:11434|127\.0\.0\.1:11434/i.test(baseUrl)

    this.client = new OpenAI({
      apiKey: config.apiKey,
      ...(baseUrl && { baseURL: baseUrl }),
    })
    this.model =
      config.model ??
      configuredModel ??
      (isLocalCompatBaseUrl ? fallbackLocalModel : this.defaultModel)
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: request.maxTokens,
      temperature: request.temperature,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
    })

    const choice = response.choices[0]
    return {
      content: choice?.message?.content ?? '',
      model: response.model,
      tokensUsed: response.usage?.total_tokens,
      finishReason: choice?.finish_reason ?? undefined,
    }
  }

  async *generateStream(request: LLMRequest): AsyncGenerator<string, void, unknown> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: request.maxTokens,
      temperature: request.temperature,
      stream: true,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
    })

    for await (const chunk of stream) {
      const delta = extractStreamTextDelta(chunk)
      yield delta
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
