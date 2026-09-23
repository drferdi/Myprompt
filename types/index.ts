// Drferdi Transformer Engine V2 — Zod Contracts & Types
import { z } from 'zod'

// ── Enums ────────────────────────────────────────────────────────────────

export const LLMProviderNameSchema = z.enum([
  'CLAUDE',
  'OPENAI',
  'MISTRAL',
  'QWEN',
  'GROK',
  'LOCAL',
])
export type LLMProviderName = z.infer<typeof LLMProviderNameSchema>

export const TaskTypeSchema = z.enum([
  'CODING',
  'EMAIL',
  'ANALYSIS',
  'CREATIVE',
  'RESEARCH',
  'BUSINESS',
  'EDUCATION',
  'MARKETING',
  'GENERAL',
])
export type TaskType = z.infer<typeof TaskTypeSchema>

export const PromptToneSchema = z.enum([
  'PROFESSIONAL',
  'CASUAL',
  'TECHNICAL',
  'ACADEMIC',
  'CREATIVE',
  'PERSUASIVE',
])
export type PromptTone = z.infer<typeof PromptToneSchema>

export const OutputFormatSchema = z.enum([
  'DETAILED',
  'CONCISE',
  'STRUCTURED',
  'STEP_BY_STEP',
  'CONVERSATIONAL',
])
export type OutputFormat = z.infer<typeof OutputFormatSchema>

export const OptimizeLaneSchema = z.enum(['INTERACTIVE', 'DEEP'])
export type OptimizeLane = z.infer<typeof OptimizeLaneSchema>

export const OutputKindSchema = z.enum(['SUPER_PROMPT', 'CODING_BRIEF'])
export type OutputKind = z.infer<typeof OutputKindSchema>

export const TemplateCategorySchema = z.enum([
  'CODING',
  'EMAIL',
  'ANALYSIS',
  'CREATIVE',
  'RESEARCH',
  'BUSINESS',
  'EDUCATION',
  'MARKETING',
])
export type TemplateCategory = z.infer<typeof TemplateCategorySchema>

// ── Request Schemas ──────────────────────────────────────────────────────

export const OptimizeRequestSchema = z.object({
  rawIdea: z.string().min(1, 'Raw idea is required').max(10_000, 'Raw idea too long'),
  taskType: TaskTypeSchema.default('GENERAL'),
  tone: PromptToneSchema.default('PROFESSIONAL'),
  format: OutputFormatSchema.default('STRUCTURED'),
  targetLlm: LLMProviderNameSchema.default('OPENAI'),
  provider: LLMProviderNameSchema.default('OPENAI'),
  optimizerLane: OptimizeLaneSchema.default('INTERACTIVE'),
  // No default: absence is resolved from taskType in the Optimizer engine.
  outputKind: OutputKindSchema.optional(),
  templateSlug: z.string().optional(),
  apiKey: z.string().optional(),
})
export type OptimizeRequest = z.infer<typeof OptimizeRequestSchema>

export const EvaluateRequestSchema = z.object({
  promptText: z.string().min(1, 'Prompt text is required').max(50_000, 'Prompt too long'),
  provider: LLMProviderNameSchema.default('OPENAI'),
  apiKey: z.string().optional(),
})
export type EvaluateRequest = z.infer<typeof EvaluateRequestSchema>

export const ProviderKeySourceSchema = z.enum(['USER', 'ENV', 'LOCAL', 'NONE'])
export type ProviderKeySource = z.infer<typeof ProviderKeySourceSchema>

export const ProviderKeyStatusSchema = z.object({
  provider: LLMProviderNameSchema,
  hasKey: z.boolean(),
  source: ProviderKeySourceSchema,
})
export type ProviderKeyStatus = z.infer<typeof ProviderKeyStatusSchema>

const NonLocalProviderSchema = LLMProviderNameSchema.refine(
  (provider) => provider !== 'LOCAL',
  'Local provider does not use API keys'
)

export const ProviderKeyListResponseSchema = z.object({
  providers: z.array(ProviderKeyStatusSchema),
})
export type ProviderKeyListResponse = z.infer<typeof ProviderKeyListResponseSchema>

export const SaveProviderKeyRequestSchema = z.object({
  provider: NonLocalProviderSchema,
  apiKey: z.string().trim().min(1, 'API key is required').max(4096),
})
export type SaveProviderKeyRequest = z.infer<typeof SaveProviderKeyRequestSchema>

export const DeleteProviderKeyRequestSchema = z.object({
  provider: NonLocalProviderSchema,
})
export type DeleteProviderKeyRequest = z.infer<typeof DeleteProviderKeyRequestSchema>

export const RegisterRequestSchema = z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi').max(120, 'Nama terlalu panjang'),
  email: z.string().trim().email('Email tidak valid').max(320, 'Email terlalu panjang'),
  password: z.string().min(8, 'Password minimal 8 karakter').max(256, 'Password terlalu panjang'),
})
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>

export const EmailActionRequestSchema = z.object({
  email: z.string().trim().email('Email tidak valid').max(320, 'Email terlalu panjang'),
})
export type EmailActionRequest = z.infer<typeof EmailActionRequestSchema>

export const CreatePromptSchema = z.object({
  rawInput: z.string().min(1),
  optimizedText: z.string().min(1),
  taskType: TaskTypeSchema,
  tone: PromptToneSchema,
  format: OutputFormatSchema,
  targetLlm: LLMProviderNameSchema,
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
})
export type CreatePrompt = z.infer<typeof CreatePromptSchema>

export const RecommendRequestSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  limit: z.number().int().min(1).max(20).default(5),
  includePublic: z.boolean().default(true),
})
export type RecommendRequest = z.infer<typeof RecommendRequestSchema>

// ── Response Types ───────────────────────────────────────────────────────

export const SuperPromptSchema = z.object({
  role: z.string(),
  task: z.string(),
  context: z.string(),
  chainOfThought: z.string(),
  constraints: z.array(z.string()),
  formatSpec: z.string(),
  fullPrompt: z.string(),
})
export type SuperPrompt = z.infer<typeof SuperPromptSchema>

// Shape only, mirroring SuperPromptSchema: lib/prompt-quality/contract.ts remains
// the documented source of truth for prompt quality (it re-exports this schema).
export const CodingBriefSchema = z.object({
  goal: z.string(),
  context: z.string(),
  scope: z.string(),
  stack: z.string().optional(),
  outOfScope: z.string().optional(),
  doneWhen: z.string(),
  report: z.string(),
})
export type CodingBrief = z.infer<typeof CodingBriefSchema>

export const OptimizeQualitySchema = z.object({
  complete: z.boolean(),
  degraded: z.boolean(),
  reason: z.enum(['parse_failed', 'invalid_brief']).optional(),
  // Coding Brief V11: valid, but CONTEXT and DONE WHEN both defer to the user. Never
  // presented as complete (C7).
  thin: z.boolean().optional(),
  attempts: z.number().int().min(1),
})
export type OptimizeQuality = z.infer<typeof OptimizeQualitySchema>

export const OptimizeResponseSchema = z.object({
  superPrompt: SuperPromptSchema,
  codingBrief: CodingBriefSchema.optional(),
  metadata: z.object({
    provider: LLMProviderNameSchema,
    model: z.string(),
    templateUsed: z.string().optional(),
    taskType: TaskTypeSchema,
    tone: PromptToneSchema,
    format: OutputFormatSchema,
    tokensUsed: z.number().optional(),
    latencyMs: z.number(),
    quality: OptimizeQualitySchema.optional(),
    outputKind: OutputKindSchema.optional(),
  }),
})
export type OptimizeResponse = z.infer<typeof OptimizeResponseSchema>

export const EvaluationDimensionSchema = z.object({
  key: z.string(),
  label: z.string(),
  score: z.number().min(0).max(10),
  feedback: z.string(),
  weight: z.number(),
})
export type EvaluationDimension = z.infer<typeof EvaluationDimensionSchema>

export const EvaluateResponseSchema = z.object({
  status: z.enum(['SUCCESS', 'FAILED']).default('SUCCESS'),
  overallScore: z.number().min(0).max(10).optional(),
  dimensions: z.array(EvaluationDimensionSchema).default([]),
  suggestions: z.array(z.string()).default([]),
  failure: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
  metadata: z.object({
    provider: LLMProviderNameSchema,
    model: z.string(),
    tokensUsed: z.number().optional(),
    latencyMs: z.number(),
  }),
})
export type EvaluateResponse = z.infer<typeof EvaluateResponseSchema>

export const PromptRecordSchema = z.object({
  id: z.string(),
  rawInput: z.string(),
  optimizedText: z.string(),
  taskType: TaskTypeSchema,
  tone: PromptToneSchema,
  format: OutputFormatSchema,
  targetLlm: LLMProviderNameSchema,
  tags: z.array(z.string()),
  isPublic: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type PromptRecord = z.infer<typeof PromptRecordSchema>

export const RecommendResponseSchema = z.object({
  recommendations: z.array(
    z.object({
      prompt: PromptRecordSchema,
      similarity: z.number(),
    })
  ),
})
export type RecommendResponse = z.infer<typeof RecommendResponseSchema>

// ── Template Types ───────────────────────────────────────────────────────

export const TemplateVariableSchema = z.object({
  name: z.string(),
  description: z.string(),
  required: z.boolean().default(true),
  defaultValue: z.string().optional(),
})
export type TemplateVariable = z.infer<typeof TemplateVariableSchema>

export const TemplateDefinitionSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  category: TemplateCategorySchema,
  template: z.object({
    role: z.string(),
    taskStructure: z.string(),
    cotGuidance: z.string(),
    constraints: z.array(z.string()),
    formatSpec: z.string(),
    qualityChecklist: z.array(z.string()),
  }),
  variables: z.array(TemplateVariableSchema).default([]),
})
export type TemplateDefinition = z.infer<typeof TemplateDefinitionSchema>

// ── LLM Provider Types ──────────────────────────────────────────────────

export const LLMRequestSchema = z.object({
  systemPrompt: z.string(),
  userPrompt: z.string(),
  maxTokens: z.number().int().default(4096),
  temperature: z.number().min(0).max(2).default(0.7),
})
export type LLMRequest = z.infer<typeof LLMRequestSchema>

export const LLMResponseSchema = z.object({
  content: z.string(),
  model: z.string(),
  tokensUsed: z.number().optional(),
  finishReason: z.string().optional(),
})
export type LLMResponse = z.infer<typeof LLMResponseSchema>

// ── Desktop Workspace Types ─────────────────────────────────────────────

export const DesktopWorkspaceSourceModeSchema = z.enum(['transform', 'optimize', 'evaluate'])
export type DesktopWorkspaceSourceMode = z.infer<typeof DesktopWorkspaceSourceModeSchema>

export const DesktopDraftInputSchema = z.object({
  id: z.string().trim().min(1),
  rawInput: z.string().trim().min(1),
  optimizedText: z.string().trim().min(1),
  sourceMode: DesktopWorkspaceSourceModeSchema,
})
export type DesktopDraftInput = z.infer<typeof DesktopDraftInputSchema>

export const DesktopDraftRecordSchema = DesktopDraftInputSchema.extend({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type DesktopDraftRecord = z.infer<typeof DesktopDraftRecordSchema>

export const DesktopRecentRunInputSchema = z.object({
  id: z.string().trim().min(1),
  sourceMode: DesktopWorkspaceSourceModeSchema,
  rawInput: z.string().trim().min(1),
  outputText: z.string().trim().min(1),
  // Optional, additive: lets the console count today's briefs by outcome. Older
  // records without these fields still parse and are simply not counted.
  outputKind: z.enum(['SUPER_PROMPT', 'CODING_BRIEF']).optional(),
  quality: z
    .object({
      complete: z.boolean(),
      degraded: z.boolean(),
      thin: z.boolean().optional(),
    })
    .optional(),
})
export type DesktopRecentRunInput = z.infer<typeof DesktopRecentRunInputSchema>

export const DesktopRecentRunSchema = DesktopRecentRunInputSchema.extend({
  createdAt: z.string().datetime(),
})
export type DesktopRecentRun = z.infer<typeof DesktopRecentRunSchema>

export const DesktopBenchmarkBudgetSchema = z.object({
  maxFirstVisibleMs: z.number().int().positive().optional(),
  maxTotalLatencyMs: z.number().int().positive().optional(),
  minPromptChars: z.number().int().positive().optional(),
  maxPromptChars: z.number().int().positive().optional(),
})
export type DesktopBenchmarkBudget = z.infer<typeof DesktopBenchmarkBudgetSchema>

export const DesktopBenchmarkBudgetsSchema = z
  .object({
    INTERACTIVE: DesktopBenchmarkBudgetSchema.optional(),
    DEEP: DesktopBenchmarkBudgetSchema.optional(),
  })
  .refine(
    (value) => Boolean(value.INTERACTIVE || value.DEEP),
    'At least one benchmark budget is required'
  )
export type DesktopBenchmarkBudgets = z.infer<typeof DesktopBenchmarkBudgetsSchema>

const DesktopBenchmarkCaseInputBaseSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  prompt: z.string().trim().min(1),
  taskType: TaskTypeSchema,
  tone: PromptToneSchema,
  format: OutputFormatSchema,
  lanes: z.array(OptimizeLaneSchema).min(1),
  budgets: DesktopBenchmarkBudgetsSchema,
})

function validateDesktopBenchmarkLaneBudgets(
  value: z.infer<typeof DesktopBenchmarkCaseInputBaseSchema>,
  ctx: z.RefinementCtx
) {
  const declaredLanes = new Set(value.lanes)

  for (const lane of value.lanes) {
    if (!value.budgets[lane]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['budgets', lane],
        message: `Missing budget for declared lane ${lane}`,
      })
    }
  }

  for (const lane of ['INTERACTIVE', 'DEEP'] as const) {
    if (value.budgets[lane] && !declaredLanes.has(lane)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['budgets', lane],
        message: `Unexpected budget for undeclared lane ${lane}`,
      })
    }
  }
}

export const DesktopBenchmarkCaseInputSchema = DesktopBenchmarkCaseInputBaseSchema.superRefine(
  validateDesktopBenchmarkLaneBudgets
)
export type DesktopBenchmarkCaseInput = z.infer<typeof DesktopBenchmarkCaseInputSchema>

export const DesktopBenchmarkCaseSchema = DesktopBenchmarkCaseInputBaseSchema.extend({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).superRefine(validateDesktopBenchmarkLaneBudgets)
export type DesktopBenchmarkCase = z.infer<typeof DesktopBenchmarkCaseSchema>

export const DesktopWorkspaceSnapshotSchema = z.object({
  drafts: z.array(DesktopDraftRecordSchema).default([]),
  recentRuns: z.array(DesktopRecentRunSchema).default([]),
  benchmarks: z.array(DesktopBenchmarkCaseSchema).default([]),
})
export type DesktopWorkspaceSnapshot = z.infer<typeof DesktopWorkspaceSnapshotSchema>

// ── Transform Feature Re-exports ─────────────────────────────────────────

export {
  CompilerProfile,
  EffortLevel,
  TransformTarget,
  TransformRequestSchema,
  TransformResponseSchema,
  TransformErrorSchema,
  HistoryItemSchema,
  type CompilerProfile as CompilerProfileType,
  type EffortLevel as EffortLevelType,
  type TransformTarget as TransformTargetType,
  type TransformRequest,
  type TransformResponse,
} from '../lib/transform/schemas'
