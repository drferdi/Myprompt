// Drferdi CTE V2 — Zod Contracts for Transform Feature
// All types are derived from these schemas via z.infer<>

import { z } from 'zod'

/**
 * Transform feature model IDs (e.g. 'claude-sonnet') are NOT the same as
 * provider registry LLMProviderName values (e.g. 'CLAUDE'). Do not mix these
 * namespaces. Reconciliation is tracked in DECISIONS.md under P2 migration.
 */
export const ModelId = z.enum([
  'openai-gpt4o',
  'claude-sonnet',
  'claude-opus',
  'mistral-large',
  'deepseek-v3',
])

export const TransformMode = z.enum(['professional', 'creative', 'technical', 'academic', 'casual'])

export const TransformRequestSchema = z.object({
  prompt: z
    .string()
    .min(10, 'Prompt minimal 10 karakter')
    .max(5000, 'Prompt maksimal 5000 karakter')
    .trim(),
  model: ModelId.default('claude-sonnet'),
  mode: TransformMode.default('professional'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(100).max(4000).default(1024),
  locale: z.enum(['id', 'en']).default('id'),
})

export const TransformResponseSchema = z.object({
  id: z.string().uuid(),
  originalPrompt: z.string(),
  transformedPrompt: z.string(),
  model: ModelId,
  mode: TransformMode,
  metadata: z.object({
    tokensEstimate: z.number(),
    transformedAt: z.string().datetime(),
    processingTimeMs: z.number(),
  }),
})

export const TransformErrorSchema = z.object({
  error: z.string(),
  code: z.enum(['VALIDATION_ERROR', 'API_ERROR', 'RATE_LIMIT', 'QUOTA_EXCEEDED', 'INTERNAL']),
  details: z.record(z.string()).optional(),
})

export const HistoryItemSchema = z.object({
  id: z.string().uuid(),
  originalPrompt: z.string(),
  transformedPrompt: z.string(),
  model: ModelId,
  mode: TransformMode,
  createdAt: z.string().datetime(),
  starred: z.boolean().default(false),
})

export type ModelId = z.infer<typeof ModelId>
export type TransformMode = z.infer<typeof TransformMode>
export type TransformRequest = z.infer<typeof TransformRequestSchema>
export type TransformResponse = z.infer<typeof TransformResponseSchema>
export type TransformError = z.infer<typeof TransformErrorSchema>
export type HistoryItem = z.infer<typeof HistoryItemSchema>
