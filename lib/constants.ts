// Drferdi Transformer Engine V2 — App Constants

export const APP_NAME = 'CTE V2'
export const APP_DESCRIPTION = 'Prompt Transformer & Optimizer'
export const APP_VERSION = '0.1.0'

export const DEFAULT_PROVIDER = 'GROK' as const
export const DEFAULT_MODEL_MAP = {
  CLAUDE: 'claude-sonnet-4-20250514',
  OPENAI: 'gpt-4o',
  MISTRAL: 'mistral-large-latest',
  QWEN: 'qwen-plus',
  GROK: 'grok-3-fast',
  LOCAL: 'llama3',
} as const

export const PROVIDER_BASE_URLS = {
  QWEN: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
  GROK: 'https://api.x.ai/v1',
  LOCAL: 'http://localhost:11434',
} as const

export const MAX_PROMPT_LENGTH = 50_000
export const MAX_RAW_IDEA_LENGTH = 10_000
export const EMBEDDING_DIMENSIONS = 1536
export const EMBEDDING_MODEL = 'text-embedding-3-small'

export const EVALUATION_DIMENSIONS = [
  { key: 'structure', label: 'Structure', weight: 0.25 },
  { key: 'clarity', label: 'Clarity', weight: 0.25 },
  { key: 'completeness', label: 'Completeness', weight: 0.25 },
  { key: 'specificity', label: 'Specificity', weight: 0.25 },
] as const

// Re-exports for transform feature components
export { MODELS, MODES, PRESETS, CATEGORY_LABELS } from './transform/constants'
export { TRANSFORM_LIMITS as LIMITS } from './transform/constants'
export type { ModelInfo, ModeInfo, PromptPreset } from './transform/constants'
