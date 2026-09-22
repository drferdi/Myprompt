// Sentra Prompt — Canonical prompt-quality contract (Single Source of Truth)
//
// This module is the SSOT for "structured prompt quality" in this codebase. It
// canonicalizes the existing SuperPromptSchema rather than inventing a new shape,
// so adoption is zero-risk and no public type changes.
//
// Canonical field set: role, task, context, reasoning, constraints, format
// (plus the assembled fullPrompt).
//
// Vocabulary mapping across the three prompt skeletons (documented, NOT enforced
// here — converting Transform + templates to this contract is deferred to P2):
//
//   Canonical    | Optimizer (SuperPrompt) | Transform skeleton | Template renderer
//   -------------|-------------------------|--------------------|------------------
//   role         | role                    | # Role             | role
//   task         | task                    | # Task             | taskStructure
//   context      | context                 | # Context          | (context)
//   reasoning    | chainOfThought          | (implicit)         | cotGuidance
//   constraints  | constraints[]           | # Constraints      | constraints
//   format       | formatSpec              | (output section)   | formatSpec
//
// See DECISIONS.md (2026-06-04): SSOT prompt-quality contract established;
// Transform + template migration deferred to P2.

import { z } from 'zod'

import {
  CODING_BRIEF_HEADINGS,
  countWords,
  hasBacktickToken,
  hasTestIdentifier,
  isPathLikeToken,
  parseCodingBriefSections,
  splitSentences,
  type CodingBriefHeading,
} from '@/lib/optimizer/coding-brief-format'
import { SuperPromptSchema, type SuperPrompt } from '@/types'

/** Canonical schema for structured prompt quality (SSOT). */
export const PromptQualitySchema = SuperPromptSchema

/** Canonical type for structured prompt quality (SSOT). */
export type PromptQuality = SuperPrompt

// ── Coding Brief (docs/CODING_BRIEF_STANDARD.md) ─────────────────────────
//
// This module is the runtime source of truth for the Coding Brief contract:
// the canonical REPORT text (§6), the parsed shape (§3), and the deterministic
// validator implementing V1–V9 (§4).

/** Canonical `## REPORT` body from §6, without the heading line. */
export const CODING_BRIEF_REPORT_TEXT = [
  '- Read every file you reference before changing or describing it.',
  '- If a referenced file, function, or command does not exist, stop and ask.',
  '- Show each command you ran and its actual output.',
  '- Do not claim a result you did not execute.',
  '- List every file you changed and anything you left undone.',
].join('\n')

/** Parsed Coding Brief (§3). Optional sections are absent, never empty strings. */
export const CodingBriefSchema = z.object({
  goal: z.string(),
  where: z.string(),
  scenario: z.string().optional(),
  followPattern: z.string().optional(),
  outOfScope: z.string().optional(),
  doneWhen: z.string(),
  report: z.string(),
})

export type CodingBrief = z.infer<typeof CodingBriefSchema>

export interface CodingBriefValidation {
  valid: boolean
  issues: string[]
  brief?: CodingBrief
}

const REQUIRED_HEADINGS: CodingBriefHeading[] = ['GOAL', 'WHERE', 'DONE WHEN', 'REPORT']

/** Words that make a GOAL a fix, so §4 V5 requires a SCENARIO. */
const FIX_WORDS = [
  'fix',
  'bug',
  'error',
  'crash',
  'fails',
  'broken',
  'perbaiki',
  'benahi',
  'galat',
]

/** Outcome phrases that carry no runnable evidence (§4 V7). */
const VAGUE_PHRASES = [
  'works well',
  'works',
  'no errors',
  'looks good',
  'berjalan dengan baik',
  'tidak error',
  'sesuai harapan',
]

/** Optimizer settings labels that must never open a line (§4 V9). */
const SETTINGS_LABELS = ['Target LLM:', 'Domain:', 'Tone:']

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function containsWord(haystack: string, word: string): boolean {
  return new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i').test(haystack)
}

/**
 * Validate a Coding Brief against docs/CODING_BRIEF_STANDARD.md §4 (V1–V9).
 *
 * Each issue is formatted `V<n>: <message>`. V1 is emitted at most once and lists
 * every structural problem it found. Content rules (V3–V8) are evaluated only for
 * sections that are present and non-empty, so an empty section reports V2 alone.
 */
export function validateCodingBrief(markdown: string): CodingBriefValidation {
  const { text, sections, unknownHeadings } = parseCodingBriefSections(markdown)
  const issues: string[] = []

  // V9 — settings labels anywhere in the brief (checked before structure, so it
  // still fires on a brief that has no headings at all).
  const labelled = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => SETTINGS_LABELS.some((label) => line.startsWith(label)))
  if (labelled.length > 0) {
    issues.push(
      `V9: line begins with an Optimizer settings label: ${labelled.join(' | ')}`
    )
  }

  // V1 — required headings, no duplicates, no unknown headings, §3 order.
  const structural: string[] = []
  const seen = new Set<CodingBriefHeading>()
  const duplicates: CodingBriefHeading[] = []
  for (const section of sections) {
    if (seen.has(section.heading)) {
      duplicates.push(section.heading)
    }
    seen.add(section.heading)
  }

  const missing = REQUIRED_HEADINGS.filter((heading) => !seen.has(heading))
  if (missing.length > 0) {
    structural.push(`missing required heading(s): ${missing.join(', ')}`)
  }
  if (duplicates.length > 0) {
    structural.push(`duplicate heading(s): ${duplicates.join(', ')}`)
  }
  if (unknownHeadings.length > 0) {
    structural.push(`unknown heading(s): ${unknownHeadings.join(', ')}`)
  }

  const order = sections.map((section) => CODING_BRIEF_HEADINGS.indexOf(section.heading))
  const outOfOrder = order.some((index, i) => i > 0 && index <= order[i - 1])
  if (outOfOrder) {
    structural.push(
      `sections are out of order: ${sections.map((s) => s.heading).join(' -> ')}`
    )
  }

  if (structural.length > 0) {
    issues.push(`V1: ${structural.join('; ')}`)
  }

  // Body lookup uses the first occurrence of each heading (duplicates already reported).
  const bodies = new Map<CodingBriefHeading, string>()
  for (const section of sections) {
    if (!bodies.has(section.heading)) {
      bodies.set(section.heading, section.body)
    }
  }

  // V2 — present sections must have a body.
  const empty = Array.from(bodies.entries())
    .filter(([, body]) => body === '')
    .map(([heading]) => heading)
  if (empty.length > 0) {
    issues.push(`V2: empty section(s): ${empty.join(', ')}`)
  }

  const goal = bodies.get('GOAL') ?? ''
  const where = bodies.get('WHERE') ?? ''
  const scenario = bodies.get('SCENARIO')
  const doneWhen = bodies.get('DONE WHEN') ?? ''
  const report = bodies.get('REPORT')

  // V3 — GOAL is one sentence of at most 40 words.
  if (goal !== '') {
    const sentences = splitSentences(goal)
    if (sentences.length > 1) {
      issues.push(`V3: GOAL must be a single sentence (found ${sentences.length})`)
    }
    const words = countWords(goal)
    if (words > 40) {
      issues.push(`V3: GOAL must be at most 40 words (found ${words})`)
    }
  }

  // V4 — WHERE names a location or defers with `Explore first:`.
  if (where !== '') {
    const hasPath = where.split(/\s+/).some(isPathLikeToken)
    if (!hasPath && !where.startsWith('Explore first:')) {
      issues.push(
        'V4: WHERE needs a path-like token or must begin with "Explore first:"'
      )
    }
  }

  // V5 — a fix GOAL requires a SCENARIO.
  if (goal !== '' && FIX_WORDS.some((word) => containsWord(goal, word))) {
    if (scenario === undefined || scenario === '') {
      issues.push('V5: GOAL describes a fix, so SCENARIO is required')
    }
  }

  if (doneWhen !== '') {
    const backticked = hasBacktickToken(doneWhen)

    // V6 — DONE WHEN carries a runnable check or defers with `Propose a check first:`.
    if (
      !backticked &&
      !hasTestIdentifier(doneWhen) &&
      !doneWhen.startsWith('Propose a check first:')
    ) {
      issues.push(
        'V6: DONE WHEN needs a backticked command or test identifier, or must begin with "Propose a check first:"'
      )
    }

    // V7 — vague outcome phrase with nothing runnable beside it.
    const vague = VAGUE_PHRASES.filter((phrase) => containsWord(doneWhen, phrase))
    if (vague.length > 0 && !backticked) {
      issues.push(`V7: DONE WHEN is only a vague outcome: ${vague.join(', ')}`)
    }
  }

  // V8 — REPORT matches §6 verbatim (line-level trimming absorbs stray indentation).
  if (report !== undefined) {
    const normalised = report
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .trim()
    if (normalised !== CODING_BRIEF_REPORT_TEXT) {
      issues.push('V8: REPORT does not match the canonical text in §6')
    }
  }

  if (issues.length > 0) {
    return { valid: false, issues }
  }

  const followPattern = bodies.get('FOLLOW PATTERN')
  const outOfScope = bodies.get('OUT OF SCOPE')

  const brief = CodingBriefSchema.parse({
    goal,
    where,
    ...(scenario !== undefined && { scenario }),
    ...(followPattern !== undefined && { followPattern }),
    ...(outOfScope !== undefined && { outOfScope }),
    doneWhen,
    report: report ?? '',
  })

  return { valid: true, issues: [], brief }
}
