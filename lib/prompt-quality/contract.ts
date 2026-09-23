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

import {
  CODING_BRIEF_HEADINGS,
  CODING_BRIEF_REPORT_TEXT,
  countScopeItems,
  countWords,
  findNamedTechnologies,
  hasBacktickToken,
  hasTestIdentifier,
  isPathLikeToken,
  mentionsTechnology,
  parseCodingBriefSections,
  splitSentences,
  type CodingBriefHeading,
} from '@/lib/optimizer/coding-brief-format'
import { CodingBriefSchema, SuperPromptSchema, type CodingBrief, type SuperPrompt } from '@/types'

/** Canonical schema for structured prompt quality (SSOT). */
export const PromptQualitySchema = SuperPromptSchema

/** Canonical type for structured prompt quality (SSOT). */
export type PromptQuality = SuperPrompt

// ── Coding Brief (docs/CODING_BRIEF_STANDARD.md v3.0) ─────────────────────
//
// This module is the runtime source of truth for the Coding Brief contract:
// the canonical REPORT text (§7), the parsed shape (§4), and the deterministic
// validator implementing V1–V14 (§5). v1.0 headings (WHERE, SCENARIO, FOLLOW
// PATTERN) are still accepted and reported as deprecated.

/**
 * Canonical `## REPORT` body from §7, without the heading line. Defined in the
 * lexical layer so the engine can append it without importing this module.
 */
export { CODING_BRIEF_REPORT_TEXT }

/** Parsed Coding Brief (§4). ASSUMPTIONS is absent when omitted, never an empty string. */
export { CodingBriefSchema, type CodingBrief }

export interface CodingBriefValidation {
  valid: boolean
  issues: string[]
  /** V11: valid, but CONTEXT and DONE WHEN both defer to the user (§8.3). */
  thin: boolean
  /** v1.0 headings found and mapped, as `WHERE (use CONTEXT)`. Accepted, never an issue. */
  deprecated: string[]
  brief?: CodingBrief
}

export interface CodingBriefValidationOptions {
  /**
   * The user's raw request; enables V10 (named technologies must appear in STACK) and
   * V14 (proposals the request did not state must be listed under ASSUMPTIONS).
   */
  rawRequest?: string
}

const REQUIRED_HEADINGS: CodingBriefHeading[] = [
  'GOAL',
  'CONTEXT',
  'SCOPE',
  'STACK',
  'OUT OF SCOPE',
  'DONE WHEN',
  'REPORT',
]

/** The required elements the Optimizer writes (V13); REPORT is fixed text. */
const CONTENT_HEADINGS: CodingBriefHeading[] = REQUIRED_HEADINGS.filter(
  (heading) => heading !== 'REPORT'
)

/** Placeholder markers: the CONTEXT and DONE WHEN openers and the greenfield opener (§4). */
const EXPLORE_FIRST = 'Explore first:'
const NEW_PROJECT = 'New project:'
const PROPOSE_CHECK_FIRST = 'Propose a check first:'
/**
 * A `[TODO: …]` line in SCOPE is the engine admitting it lacks information. V5 does not
 * fire on such a SCOPE: failing it would teach the model to invent a second item. In a
 * greenfield brief the placeholder itself is the defect, and V13 reports it.
 */
const TODO_PLACEHOLDER = '[TODO:'

/**
 * Placeholder text that restates the instruction instead of the content (§5 V12).
 * Matched on word boundaries, so "the checkout page" is not "the check".
 */
const PARAPHRASE_PHRASES = ['the intended outcome', 'the check', 'to be determined']

/** The text each placeholder carries: after a line opener, or inside `[TODO: …]`. */
function placeholderTexts(text: string): string[] {
  const found: string[] = []
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    for (const opener of [EXPLORE_FIRST, PROPOSE_CHECK_FIRST, NEW_PROJECT]) {
      if (line.startsWith(opener)) {
        found.push(line.slice(opener.length))
      }
    }
  }
  for (const match of text.matchAll(/\[TODO:([^\]]*)\]/g)) {
    found.push(match[1])
  }
  return found
}

function hasTodoLine(body: string): boolean {
  return body.split('\n').some((line) => line.trim().startsWith(TODO_PLACEHOLDER))
}

/** Outcome phrases that carry no runnable evidence (§5 V7). */
const VAGUE_PHRASES = [
  'works well',
  'works',
  'no errors',
  'looks good',
  'berjalan dengan baik',
  'tidak error',
  'sesuai harapan',
]

/** Optimizer settings labels that must never open a line (§5 V9). */
const SETTINGS_LABELS = ['Target LLM:', 'Domain:', 'Tone:']

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function containsWord(haystack: string, word: string): boolean {
  return new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i').test(haystack)
}

/**
 * Validate a Coding Brief against docs/CODING_BRIEF_STANDARD.md §5 (V1–V14).
 *
 * Each issue is formatted `V<n>: <message>`. V1 is emitted at most once and lists
 * every structural problem it found. Content rules (V3–V8) are evaluated only for
 * sections that are present and non-empty, so an empty section reports V2 alone.
 * V10 and V14 run only when `options.rawRequest` is given. V11 (`thin`) is a warning, not
 * an issue: the brief stays valid.
 */
export function validateCodingBrief(
  markdown: string,
  options: CodingBriefValidationOptions = {}
): CodingBriefValidation {
  const { text, sections, unknownHeadings, deprecatedHeadings } = parseCodingBriefSections(markdown)
  const issues: string[] = []
  const deprecated = deprecatedHeadings

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

  // V1 — required headings, no duplicates, no unknown headings, §4 order. A mapped
  // v1.0 heading counts as its current heading here, so WHERE beside CONTEXT is a duplicate.
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
  const context = bodies.get('CONTEXT') ?? ''
  const scope = bodies.get('SCOPE') ?? ''
  const stack = bodies.get('STACK')
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

  // V4 — CONTEXT names a location, opens a new project with a proposed directory, or
  // defers with `Explore first:`.
  const contextDefers = context.startsWith(EXPLORE_FIRST)
  const greenfield = context.startsWith(NEW_PROJECT)
  const proposedDirectory = greenfield
    ? context.slice(NEW_PROJECT.length).split('\n')[0].trim()
    : ''
  if (greenfield && proposedDirectory === '') {
    issues.push(`V4: "${NEW_PROJECT}" must be followed by a proposed directory`)
  } else if (context !== '') {
    const hasPath = context.split(/\s+/).some(isPathLikeToken)
    if (!hasPath && !context.startsWith(NEW_PROJECT) && !contextDefers) {
      issues.push(
        `V4: CONTEXT needs a path-like token or must begin with "${NEW_PROJECT}" or "${EXPLORE_FIRST}"`
      )
    }
  }

  // V5 — SCOPE names at least two concrete items, unless any line is a `[TODO: …]`
  // question to the user: the placeholder already marks what is missing.
  if (scope !== '' && !hasTodoLine(scope)) {
    const items = countScopeItems(scope)
    if (items < 2) {
      issues.push(`V5: SCOPE must name at least two concrete items (found ${items})`)
    }
  }

  const doneWhenDefers = doneWhen.startsWith(PROPOSE_CHECK_FIRST)
  if (doneWhen !== '') {
    const backticked = hasBacktickToken(doneWhen)

    // V6 — DONE WHEN carries a runnable check or defers with `Propose a check first:`.
    if (!backticked && !hasTestIdentifier(doneWhen) && !doneWhenDefers) {
      issues.push(
        `V6: DONE WHEN needs a backticked command or test identifier, or must begin with "${PROPOSE_CHECK_FIRST}"`
      )
    }

    // V7 — vague outcome phrase with nothing runnable beside it.
    const vague = VAGUE_PHRASES.filter((phrase) => containsWord(doneWhen, phrase))
    if (vague.length > 0 && !backticked) {
      issues.push(`V7: DONE WHEN is only a vague outcome: ${vague.join(', ')}`)
    }
  }

  // V8 — REPORT matches §7 verbatim (line-level trimming absorbs stray indentation).
  if (report !== undefined) {
    const normalised = report
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .trim()
    if (normalised !== CODING_BRIEF_REPORT_TEXT) {
      issues.push('V8: REPORT does not match the canonical text in §7')
    }
  }

  // V10 — every technology named in the raw request appears in STACK.
  if (options.rawRequest !== undefined) {
    const named = findNamedTechnologies(options.rawRequest)
    const missingTech = named.filter((name) => !mentionsTechnology(stack ?? '', name))
    if (missingTech.length > 0) {
      issues.push(
        `V10: STACK is missing technology named in the request: ${missingTech.join(', ')}`
      )
    }
  }

  // V12 — a placeholder states content, never a paraphrase of the instruction.
  const placeholders = placeholderTexts(text)
  const paraphrases = PARAPHRASE_PHRASES.filter((phrase) =>
    placeholders.some((placeholder) => containsWord(placeholder, phrase))
  )
  if (paraphrases.length > 0) {
    issues.push(
      `V12: placeholder paraphrases the instruction instead of stating it: ${paraphrases
        .map((phrase) => `"${phrase}"`)
        .join(', ')}`
    )
  }

  // V13 — a greenfield brief proposes instead of leaving `[TODO:` in a required element.
  if (greenfield) {
    const unresolved = CONTENT_HEADINGS.filter((heading) =>
      (bodies.get(heading) ?? '').includes(TODO_PLACEHOLDER)
    )
    if (unresolved.length > 0) {
      issues.push(
        `V13: unresolved ${TODO_PLACEHOLDER} in a greenfield brief: ${unresolved.join(', ')}`
      )
    }
  }

  // V14 — whatever the raw request did not state is listed under ASSUMPTIONS. Heuristic:
  // it sees a greenfield directory and STACK technologies, not every proposal; pending
  // Phase 4 calibration like V4–V7.
  const assumptions = bodies.get('ASSUMPTIONS')
  if (options.rawRequest !== undefined && assumptions === undefined) {
    const rawRequest = options.rawRequest
    const proposals: string[] = []
    if (greenfield && proposedDirectory !== '' && !rawRequest.includes(proposedDirectory)) {
      proposals.push(`directory ${proposedDirectory}`)
    }
    const requested = findNamedTechnologies(rawRequest)
    proposals.push(
      ...findNamedTechnologies(stack ?? '').filter((name) => !requested.includes(name))
    )
    if (proposals.length > 0) {
      issues.push(
        `V14: ASSUMPTIONS is missing although the brief proposes: ${proposals.join(', ')}`
      )
    }
  }

  if (issues.length > 0) {
    return { valid: false, issues, thin: false, deprecated }
  }

  // V11 — brownfield thin: both openers defer, because only the repository can close the gap (§8.3).
  const thin = contextDefers && doneWhenDefers

  // V1 has passed, so every required section is present.
  const brief = CodingBriefSchema.parse({
    goal,
    context,
    scope,
    stack: stack ?? '',
    outOfScope: bodies.get('OUT OF SCOPE') ?? '',
    doneWhen,
    ...(assumptions !== undefined && { assumptions }),
    report: report ?? '',
  })

  return { valid: true, issues: [], thin, deprecated, brief }
}
