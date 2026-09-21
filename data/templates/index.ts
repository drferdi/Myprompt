// Drferdi Transformer Engine V2 — Template Aggregator
import { analysisTemplates } from './analysis'
import { businessTemplates } from './business'
import { codingTemplates } from './coding'
import { creativeTemplates } from './creative'
import { educationTemplates } from './education'
import { emailTemplates } from './email'
import { marketingTemplates } from './marketing'
import { researchTemplates } from './research'

import type { TemplateDefinition } from '@/types'

export const allTemplates: TemplateDefinition[] = [
  ...codingTemplates,
  ...emailTemplates,
  ...analysisTemplates,
  ...creativeTemplates,
  ...researchTemplates,
  ...businessTemplates,
  ...educationTemplates,
  ...marketingTemplates,
]

export const templatesByCategory = {
  CODING: codingTemplates,
  EMAIL: emailTemplates,
  ANALYSIS: analysisTemplates,
  CREATIVE: creativeTemplates,
  RESEARCH: researchTemplates,
  BUSINESS: businessTemplates,
  EDUCATION: educationTemplates,
  MARKETING: marketingTemplates,
} as const

export {
  codingTemplates,
  emailTemplates,
  analysisTemplates,
  creativeTemplates,
  researchTemplates,
  businessTemplates,
  educationTemplates,
  marketingTemplates,
}
