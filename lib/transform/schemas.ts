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

export const CompilerProfile = z.enum([
  'claude-fable-5',
  'claude-mythos-5',
])

export const EffortLevel = z.enum(['low', 'medium', 'high', 'xhigh', 'max'])

export const TransformTarget = z.enum(['general', 'agent'])

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
  profile: CompilerProfile.optional(),
  effort: EffortLevel.optional().default('high'),
  target: TransformTarget.optional().default('general'),
})

export const TransformResponseSchema = z.object({
  id: z.string().uuid(),
  originalPrompt: z.string(),
  transformedPrompt: z.string(),
  model: ModelId,
  mode: TransformMode,
  profile: CompilerProfile.optional(),
  effort: EffortLevel.optional(),
  target: TransformTarget.optional(),
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
  profile: CompilerProfile.optional(),
  effort: EffortLevel.optional(),
  target: TransformTarget.optional(),
  createdAt: z.string().datetime(),
  starred: z.boolean().default(false),
})

export type ModelId = z.infer<typeof ModelId>
export type TransformMode = z.infer<typeof TransformMode>
export type CompilerProfile = z.infer<typeof CompilerProfile>
export type EffortLevel = z.infer<typeof EffortLevel>
export type TransformTarget = z.infer<typeof TransformTarget>
export type TransformRequest = z.input<typeof TransformRequestSchema>
export type TransformResponse = z.infer<typeof TransformResponseSchema>
export type TransformError = z.infer<typeof TransformErrorSchema>
export type HistoryItem = z.infer<typeof HistoryItemSchema>
