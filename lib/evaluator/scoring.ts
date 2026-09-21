// Drferdi Transformer Engine V2 — Evaluation Scoring
import { DIMENSIONS } from './dimensions'

import type { EvaluationDimension } from '@/types'

export function calculateOverallScore(dimensions: EvaluationDimension[]): number {
  let totalWeight = 0
  let weightedSum = 0

  for (const dim of dimensions) {
    weightedSum += dim.score * dim.weight
    totalWeight += dim.weight
  }

  if (totalWeight === 0) return 0
  return Math.round((weightedSum / totalWeight) * 10) / 10
}

export function normalizeScores(
  raw: Record<string, { score: number; feedback: string }>
): EvaluationDimension[] {
  return DIMENSIONS.map((dim) => {
    const rawDim = raw[dim.key]
    const score = rawDim ? Math.max(0, Math.min(10, rawDim.score)) : 5
    const feedback = rawDim?.feedback ?? 'No feedback available'

    return {
      key: dim.key,
      label: dim.label,
      score,
      feedback,
      weight: dim.weight,
    }
  })
}

export function getScoreLabel(score: number): string {
  if (score >= 9) return 'Exceptional'
  if (score >= 7) return 'Good'
  if (score >= 5) return 'Adequate'
  if (score >= 3) return 'Below Average'
  return 'Poor'
}

export function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-400'
  if (score >= 6) return 'text-yellow-400'
  if (score >= 4) return 'text-orange-400'
  return 'text-red-400'
}
