import { z } from 'zod'

import { type TransformRequestSchema } from '@/lib/transform/schemas'
import {
  type EvaluateRequestSchema,
  type OptimizeRequestSchema,
  TemplateCategorySchema,
} from '@/types'

export const DesktopCommandIdSchema = z.enum([
  'transform:run',
  'optimize:run',
  'evaluate:run',
  'help:show',
  'library:list',
  'library:search',
  'library:save',
  'library:get',
  'draft:list',
  'draft:save',
  'draft:get',
  'recent:list',
  'benchmark:list',
  'benchmark:save',
  'benchmark:run',
  'templates:list',
  'provider:list',
  'provider:save',
  'provider:delete',
  'usage:summary',
  'subscription:upgrade',
  'auth:login',
  'auth:register',
  'auth:logout',
])

export const DesktopPromptQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  taskType: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  text: z.string().optional(),
})

export const DesktopTemplatesListPayloadSchema = z.object({
  category: TemplateCategorySchema.nullish(),
})

export const DesktopEmptyPayloadSchema = z.object({})

export const DesktopRecordLookupPayloadSchema = z.object({
  id: z.string().min(1),
})

export const DesktopLibrarySavePayloadSchema = z.object({
  rawInput: z.string().min(1),
  optimizedText: z.string().min(1),
  taskType: z.string().optional(),
  tone: z.string().optional(),
  format: z.string().optional(),
  targetLlm: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const DesktopDraftSavePayloadSchema = z
  .object({
    rawInput: z.string().optional(),
    optimizedText: z.string().optional(),
    outputText: z.string().optional(),
    sourceMode: z.string().optional(),
  })
  .passthrough()

export const DesktopBenchmarkSavePayloadSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().optional(),
    prompt: z.string().optional(),
  })
  .passthrough()

export const DesktopCommandEnvelopeSchema = z.object({
  command: DesktopCommandIdSchema,
  payload: z.unknown().optional(),
  accessToken: z.string().optional(),
})

export type DesktopCommandId = z.infer<typeof DesktopCommandIdSchema>
export type DesktopTransformPayload = z.infer<typeof TransformRequestSchema>
export type DesktopOptimizePayload = z.infer<typeof OptimizeRequestSchema>
export type DesktopEvaluatePayload = z.infer<typeof EvaluateRequestSchema>
export type DesktopPromptQuery = z.infer<typeof DesktopPromptQuerySchema>
export type DesktopTemplatesListPayload = z.infer<typeof DesktopTemplatesListPayloadSchema>
export type DesktopEmptyPayload = z.infer<typeof DesktopEmptyPayloadSchema>
export type DesktopRecordLookupPayload = z.infer<typeof DesktopRecordLookupPayloadSchema>
export type DesktopLibrarySavePayload = z.infer<typeof DesktopLibrarySavePayloadSchema>
export type DesktopDraftSavePayload = z.infer<typeof DesktopDraftSavePayloadSchema>
export type DesktopBenchmarkSavePayload = z.infer<typeof DesktopBenchmarkSavePayloadSchema>
export type DesktopCommandEnvelope = z.infer<typeof DesktopCommandEnvelopeSchema>

export interface DesktopCommandContext {
  accessToken?: string
}
