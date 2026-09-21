// Drferdi Transformer Engine V2 — Optimization Strategies
import type { TaskType, PromptTone, OutputFormat } from '@/types'

interface StrategyHints {
  emphasisAreas: string[]
  additionalConstraints: string[]
  cotFocus: string
}

export function getStrategyHints(
  taskType: TaskType,
  tone: PromptTone,
  format: OutputFormat
): StrategyHints {
  const base = taskStrategies[taskType] ?? taskStrategies.GENERAL

  return {
    emphasisAreas: base.emphasisAreas,
    additionalConstraints: [
      ...base.additionalConstraints,
      ...getToneConstraints(tone),
      ...getFormatConstraints(format),
    ],
    cotFocus: base.cotFocus,
  }
}

const taskStrategies: Record<TaskType, StrategyHints> = {
  CODING: {
    emphasisAreas: [
      'code correctness',
      'edge case handling',
      'performance considerations',
      'security best practices',
    ],
    additionalConstraints: [
      'Include error handling patterns',
      'Consider type safety',
      'Follow SOLID principles where applicable',
    ],
    cotFocus: 'Think through the problem algorithmically, consider edge cases, then implement',
  },
  EMAIL: {
    emphasisAreas: [
      'subject line impact',
      'opening hook',
      'clear call-to-action',
      'appropriate length',
    ],
    additionalConstraints: [
      'Keep under 300 words unless specified',
      'Include a clear next step',
      'Match formality to relationship',
    ],
    cotFocus: 'Consider the recipient, purpose, desired outcome, then craft the message',
  },
  ANALYSIS: {
    emphasisAreas: [
      'data-driven conclusions',
      'methodology transparency',
      'actionable insights',
      'limitation acknowledgment',
    ],
    additionalConstraints: [
      'Cite data sources when possible',
      'Distinguish correlation from causation',
      'Include confidence levels',
    ],
    cotFocus: 'Gather evidence, analyze patterns, draw conclusions, validate against alternatives',
  },
  CREATIVE: {
    emphasisAreas: ['originality', 'engagement', 'emotional resonance', 'narrative structure'],
    additionalConstraints: [
      'Avoid clichés and overused tropes',
      "Show, don't tell",
      'Maintain consistent voice',
    ],
    cotFocus: 'Explore the creative concept, build the narrative arc, refine for impact',
  },
  RESEARCH: {
    emphasisAreas: [
      'source credibility',
      'methodology rigor',
      'comprehensive coverage',
      'balanced perspective',
    ],
    additionalConstraints: [
      'Use peer-reviewed sources when possible',
      'Acknowledge gaps in evidence',
      'Present opposing viewpoints fairly',
    ],
    cotFocus: 'Define scope, gather evidence systematically, synthesize findings, draw conclusions',
  },
  BUSINESS: {
    emphasisAreas: [
      'ROI clarity',
      'stakeholder alignment',
      'actionable recommendations',
      'risk assessment',
    ],
    additionalConstraints: [
      'Include quantifiable metrics',
      'Address implementation feasibility',
      'Consider resource constraints',
    ],
    cotFocus: 'Assess the business context, evaluate options, recommend with justification',
  },
  EDUCATION: {
    emphasisAreas: [
      'learning objectives',
      'progressive complexity',
      'engagement techniques',
      'assessment alignment',
    ],
    additionalConstraints: [
      'Adapt to specified audience level',
      'Include examples and analogies',
      'Build on prior knowledge',
    ],
    cotFocus: 'Identify learning goals, structure progression, design for understanding',
  },
  MARKETING: {
    emphasisAreas: [
      'audience targeting',
      'value proposition clarity',
      'conversion optimization',
      'brand consistency',
    ],
    additionalConstraints: [
      'Focus on benefits over features',
      'Include social proof elements',
      'Maintain brand voice',
    ],
    cotFocus: 'Understand the audience, craft the value proposition, optimize for conversion',
  },
  GENERAL: {
    emphasisAreas: ['clarity', 'completeness', 'actionability', 'relevance'],
    additionalConstraints: ['Be specific rather than generic', 'Include context for better output'],
    cotFocus: 'Understand the request, break it down, address each component thoroughly',
  },
}

function getToneConstraints(tone: PromptTone): string[] {
  const map: Record<PromptTone, string[]> = {
    PROFESSIONAL: ['Maintain formal register', 'Avoid colloquialisms'],
    CASUAL: ['Use conversational language', 'Be approachable'],
    TECHNICAL: ['Use domain-specific terminology', 'Be precise'],
    ACADEMIC: ['Follow academic conventions', 'Cite appropriately'],
    CREATIVE: ['Use vivid language', 'Be expressive'],
    PERSUASIVE: ['Use rhetorical techniques', 'Build compelling arguments'],
  }
  return map[tone] ?? []
}

function getFormatConstraints(format: OutputFormat): string[] {
  const map: Record<OutputFormat, string[]> = {
    DETAILED: ['Provide thorough explanations', 'Include supporting details'],
    CONCISE: ['Prioritize brevity', 'Eliminate redundancy'],
    STRUCTURED: ['Use headings and sections', 'Maintain logical hierarchy'],
    STEP_BY_STEP: ['Number each step', 'Include transitions between steps'],
    CONVERSATIONAL: ['Use natural language flow', 'Include rhetorical questions'],
  }
  return map[format] ?? []
}
