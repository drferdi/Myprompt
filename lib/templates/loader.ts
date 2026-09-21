// Drferdi Transformer Engine V2 — Template Loader
import { allTemplates, templatesByCategory } from '@/data/templates'
import type { TemplateDefinition, TemplateCategory } from '@/types'

export function getAllTemplates(): TemplateDefinition[] {
  return allTemplates
}

export function getTemplatesByCategory(category: TemplateCategory): TemplateDefinition[] {
  return templatesByCategory[category] ?? []
}

export function getTemplateBySlug(slug: string): TemplateDefinition | undefined {
  return allTemplates.find((t) => t.slug === slug)
}

export function getCategories(): TemplateCategory[] {
  return Object.keys(templatesByCategory) as TemplateCategory[]
}

export function getTemplateCount(): number {
  return allTemplates.length
}
