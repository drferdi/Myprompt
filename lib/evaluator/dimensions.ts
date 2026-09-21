// Drferdi Transformer Engine V2 — Evaluation Dimensions
export interface DimensionDefinition {
  key: string
  label: string
  weight: number
  description: string
  rubric: Record<string, string>
}

function getDimensionWeights(): Record<string, number> {
  const raw = {
    structure: parseFloat(process.env.EVAL_WEIGHT_STRUCTURE ?? '0.25'),
    clarity: parseFloat(process.env.EVAL_WEIGHT_CLARITY ?? '0.25'),
    completeness: parseFloat(process.env.EVAL_WEIGHT_COMPLETENESS ?? '0.25'),
    specificity: parseFloat(process.env.EVAL_WEIGHT_SPECIFICITY ?? '0.25'),
  }
  const total = raw.structure + raw.clarity + raw.completeness + raw.specificity
  return total > 0
    ? {
        structure: raw.structure / total,
        clarity: raw.clarity / total,
        completeness: raw.completeness / total,
        specificity: raw.specificity / total,
      }
    : { structure: 0.25, clarity: 0.25, completeness: 0.25, specificity: 0.25 }
}

const weights = getDimensionWeights()

export const DIMENSIONS: DimensionDefinition[] = [
  {
    key: 'structure',
    label: 'Structure',
    weight: weights.structure,
    description: 'Organization, logical flow, and clear sections',
    rubric: {
      '9-10': 'Perfectly organized with clear sections, logical flow, and hierarchy',
      '7-8': 'Well-structured with minor organization improvements possible',
      '5-6': 'Basic structure present but could be better organized',
      '3-4': 'Poor organization, hard to follow',
      '1-2': 'No discernible structure',
    },
  },
  {
    key: 'clarity',
    label: 'Clarity',
    weight: weights.clarity,
    description: 'Language precision, absence of ambiguity',
    rubric: {
      '9-10': 'Crystal clear, no ambiguity, precise language throughout',
      '7-8': 'Mostly clear with minor ambiguous phrases',
      '5-6': 'Some unclear sections that could confuse the AI',
      '3-4': 'Significant ambiguity, multiple interpretations possible',
      '1-2': 'Very unclear, AI would likely misinterpret',
    },
  },
  {
    key: 'completeness',
    label: 'Completeness',
    weight: weights.completeness,
    description: 'All necessary context, constraints, and specifications included',
    rubric: {
      '9-10': 'All context, constraints, examples, and edge cases covered',
      '7-8': 'Most important elements present, minor gaps',
      '5-6': 'Key information present but missing useful context',
      '3-4': 'Significant missing information',
      '1-2': 'Severely incomplete, AI would need to guess most details',
    },
  },
  {
    key: 'specificity',
    label: 'Specificity',
    weight: weights.specificity,
    description: 'Concrete instructions vs vague generalities',
    rubric: {
      '9-10': 'Highly specific with exact parameters, examples, and expectations',
      '7-8': 'Good specificity with minor areas that could be more precise',
      '5-6': 'Mix of specific and vague instructions',
      '3-4': 'Mostly vague, few concrete details',
      '1-2': 'Entirely generic, no specific guidance',
    },
  },
]
