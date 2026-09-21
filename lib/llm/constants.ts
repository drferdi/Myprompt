import type { OptimizeLane } from '@/types'

/**
 * Fallback model slugs for the Optimizer OpenAI-compatible path when:
 *   1. No lane-specific or Optimizer-scoped model override is set, AND
 *   2. The effective base URL resolves to OpenRouter, AND
 *   3. The inherited shared model matches a key in this map.
 *
 * Override via OPTIMIZER_INTERACTIVE_OPENAI_MODEL or OPTIMIZER_DEEP_OPENAI_MODEL
 * env vars to bypass this fallback for a specific lane.
 *
 * Note: model slugs here are OpenRouter route identifiers, not provider SDK calls.
 */
export const OPENROUTER_LANE_MODEL_FALLBACKS: Record<OptimizeLane, Record<string, string>> = {
  INTERACTIVE: {
    'deepseek/deepseek-v4-pro': 'google/gemini-3.1-flash-lite',
  },
  DEEP: {
    'deepseek/deepseek-v4-pro': 'deepseek/deepseek-v4-flash',
  },
}
