// Drferdi Transformer Engine V2 — Token Counter (estimation)
import type { LLMProviderName } from '@/types'

// Approximate chars-per-token ratios by provider family
const CHARS_PER_TOKEN: Record<LLMProviderName, number> = {
  CLAUDE: 3.5,
  OPENAI: 4.0,
  MISTRAL: 3.8,
  QWEN: 3.5,
  GROK: 4.0,
  LOCAL: 3.5,
}

export function estimateTokens(text: string, provider: LLMProviderName = 'CLAUDE'): number {
  const ratio = CHARS_PER_TOKEN[provider] ?? 4.0
  return Math.ceil(text.length / ratio)
}

export function estimatePromptTokens(
  systemPrompt: string,
  userPrompt: string,
  provider: LLMProviderName = 'CLAUDE'
): { inputTokens: number; estimatedOutputTokens: number; total: number } {
  const inputTokens = estimateTokens(systemPrompt + userPrompt, provider)
  // Estimate output as roughly 2x input for generation tasks
  const estimatedOutputTokens = Math.min(inputTokens * 2, 4096)
  return {
    inputTokens,
    estimatedOutputTokens,
    total: inputTokens + estimatedOutputTokens,
  }
}
