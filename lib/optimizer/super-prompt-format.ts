// Drferdi Transformer Engine V2 — Super Prompt Formatter
import { z } from 'zod'

import { PromptQualitySchema } from '@/lib/prompt-quality/contract'
import type { SuperPrompt } from '@/types'

// Wire shape the LLM actually emits: every field nullish (tolerant of missing
// AND explicitly-null fields, matching the previous `?? ''` / `Array.isArray`
// defaults) but strictly typed (a wrong-typed field, e.g. `constraints: "x"` or
// `role: 5`, fails validation and throws). Tolerance comes only from `.nullish()`
// + defaulting after the map — never from coercion — so malformed output still
// routes to the engine fallback.
const SuperPromptWireSchema = z.object({
  role: z.string().nullish(),
  task: z.string().nullish(),
  context: z.string().nullish(),
  reasoningApproach: z.string().nullish(),
  chainOfThought: z.string().nullish(),
  constraints: z.array(z.string()).nullish(),
  formatSpec: z.string().nullish(),
  fullPrompt: z.string().nullish(),
})

export function formatSuperPrompt(parsed: SuperPrompt): string {
  return parsed.fullPrompt
}

export function parseSuperPromptJson(raw: string): SuperPrompt {
  // Try to extract JSON from the response (handles markdown fences)
  let jsonStr = raw.trim()

  // Remove markdown code fences if present
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim()
  }

  const parsed = JSON.parse(jsonStr)

  const wire = SuperPromptWireSchema.safeParse(parsed)
  if (!wire.success) {
    throw new Error(`Invalid Super Prompt shape: ${wire.error.message}`)
  }
  const data = wire.data

  const candidate = {
    role: data.role ?? '',
    task: data.task ?? '',
    context: data.context ?? '',
    chainOfThought: data.reasoningApproach ?? data.chainOfThought ?? '',
    constraints: data.constraints ?? [],
    formatSpec: data.formatSpec ?? '',
    fullPrompt: data.fullPrompt ?? buildFullPrompt(data),
  }

  // Final guard against the canonical contract (SSOT). Conforms or throws.
  return PromptQualitySchema.parse(candidate)
}

export function parseSuperPromptMarkdown(raw: string): SuperPrompt {
  let text = raw.trim()

  // Strip outer ``` fence (defensive; only the outermost wrapper, not internal fences)
  if (/^```/.test(text)) {
    const firstNewline = text.indexOf('\n')
    text = firstNewline !== -1 ? text.slice(firstNewline + 1).trim() : text.slice(3).trim()
  }
  if (text.endsWith('```')) {
    text = text.slice(0, text.lastIndexOf('\n```')).trim()
  }

  // Locate all `## HEADING` lines (uppercase only)
  const headingRe = /^## ([A-Z ]+)$/gm
  const found: { heading: string; matchStart: number; contentStart: number }[] = []
  let m: RegExpExecArray | null
  while ((m = headingRe.exec(text)) !== null) {
    const afterHeading = m.index + m[0].length
    const contentStart =
      afterHeading < text.length && text[afterHeading] === '\n' ? afterHeading + 1 : afterHeading
    found.push({ heading: m[1].trim(), matchStart: m.index, contentStart })
  }

  const sections = new Map<string, string>()
  for (let i = 0; i < found.length; i++) {
    const { heading, contentStart } = found[i]
    const end = i + 1 < found.length ? found[i + 1].matchStart : text.length
    sections.set(heading, text.slice(contentStart, end).trim())
  }

  // Required headings (APPROACH is optional)
  for (const req of ['ROLE', 'TASK', 'CONTEXT', 'CONSTRAINTS', 'OUTPUT FORMAT']) {
    if (!sections.has(req)) {
      throw new Error(`Missing required Super Prompt section: ## ${req}`)
    }
  }

  const constraintsRaw = sections.get('CONSTRAINTS') ?? ''
  const constraints = constraintsRaw
    .split('\n')
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim())
    .filter(Boolean)

  const candidate = {
    role: sections.get('ROLE') ?? '',
    task: sections.get('TASK') ?? '',
    context: sections.get('CONTEXT') ?? '',
    chainOfThought: sections.get('APPROACH') ?? '',
    constraints,
    formatSpec: sections.get('OUTPUT FORMAT') ?? '',
    fullPrompt: text,
  }

  return PromptQualitySchema.parse(candidate)
}

function buildFullPrompt(parsed: z.infer<typeof SuperPromptWireSchema>): string {
  const parts: string[] = []
  const approach = parsed.reasoningApproach ?? parsed.chainOfThought

  if (parsed.role) {
    parts.push(`You are ${parsed.role}.`)
  }
  if (parsed.task) {
    parts.push(`\n## Task\n${parsed.task}`)
  }
  if (parsed.context) {
    parts.push(`\n## Context\n${parsed.context}`)
  }
  if (approach) {
    parts.push(`\n## Approach\n${approach}`)
  }
  if (parsed.constraints && parsed.constraints.length > 0) {
    parts.push(`\n## Constraints\n${parsed.constraints.map((c) => `- ${c}`).join('\n')}`)
  }
  if (parsed.formatSpec) {
    parts.push(`\n## Output Format\n${parsed.formatSpec}`)
  }

  return parts.join('\n')
}
