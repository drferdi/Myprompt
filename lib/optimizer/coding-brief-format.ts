// Sentra Prompt — Coding Brief Markdown parser (docs/CODING_BRIEF_STANDARD.md §3)
//
// Pure lexical layer: it splits a brief into its `## HEADING` sections and exposes
// the small heuristics the validator needs. It deliberately imports nothing from
// `@/lib/prompt-quality/*` — `contract.ts` imports this module, and the reverse
// edge would close a cycle through `super-prompt-format.ts`.

/** The seven headings of §3, in the order the standard fixes. */
export const CODING_BRIEF_HEADINGS = [
  'GOAL',
  'WHERE',
  'SCENARIO',
  'FOLLOW PATTERN',
  'OUT OF SCOPE',
  'DONE WHEN',
  'REPORT',
] as const

export type CodingBriefHeading = (typeof CODING_BRIEF_HEADINGS)[number]

export interface CodingBriefSection {
  heading: CodingBriefHeading
  /** Section body, trimmed. Empty when the heading has no content (V2). */
  body: string
}

export interface ParsedCodingBrief {
  /** Normalised source: CRLF folded, trimmed, outer fence removed. */
  text: string
  /** Known sections in document order (duplicates preserved, so V1 can see them). */
  sections: CodingBriefSection[]
  /** `## ...` headings that are not one of the seven (V1). */
  unknownHeadings: string[]
}

function isKnownHeading(heading: string): heading is CodingBriefHeading {
  return (CODING_BRIEF_HEADINGS as readonly string[]).includes(heading)
}

/** Fold CRLF, trim, and strip a single outer ``` fence (mirrors super-prompt-format). */
export function normaliseCodingBrief(raw: string): string {
  let text = raw.replace(/\r\n/g, '\n').trim()

  if (!/^```/.test(text)) {
    return text
  }

  const firstNewline = text.indexOf('\n')
  text = firstNewline !== -1 ? text.slice(firstNewline + 1).trim() : text.slice(3).trim()

  if (text.endsWith('```')) {
    const closing = text.lastIndexOf('\n```')
    text = closing !== -1 ? text.slice(0, closing).trim() : text.slice(0, -3).trim()
  }

  return text
}

/**
 * Split a Coding Brief into its sections. Any `##` heading is detected (not only
 * the known seven) so the validator can report unknown headings under V1.
 */
export function parseCodingBriefSections(markdown: string): ParsedCodingBrief {
  const text = normaliseCodingBrief(markdown)

  const headingRe = /^##\s+(.+)$/gm
  const found: { heading: string; matchStart: number; contentStart: number }[] = []
  let match: RegExpExecArray | null
  while ((match = headingRe.exec(text)) !== null) {
    found.push({
      heading: match[1].trim(),
      matchStart: match.index,
      contentStart: match.index + match[0].length,
    })
  }

  const sections: CodingBriefSection[] = []
  const unknownHeadings: string[] = []

  for (let i = 0; i < found.length; i++) {
    const { heading, contentStart } = found[i]
    const end = i + 1 < found.length ? found[i + 1].matchStart : text.length
    if (isKnownHeading(heading)) {
      sections.push({ heading, body: text.slice(contentStart, end).trim() })
    } else {
      unknownHeadings.push(heading)
    }
  }

  return { text, sections, unknownHeadings }
}

/** A token is path-like when it contains `/` or a plausible file extension (`@` prefix allowed). */
export function isPathLikeToken(token: string): boolean {
  const bare = token.replace(/^@/, '')
  if (bare.includes('/')) {
    return true
  }
  // Requires at least one alphanumeric after the dot, so a sentence-ending
  // period ("The login part.") is not mistaken for an extension.
  return /\S+\.[A-Za-z0-9]{1,6}\b/.test(bare)
}

/** Sentences split on a terminator followed by whitespace or end of input (so `foo.ts` is safe). */
export function splitSentences(body: string): string[] {
  return body
    .split(/[.!?](?=\s|$)/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function countWords(body: string): number {
  const trimmed = body.trim()
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length
}

/** True when the body contains a `backticked` token with content. */
export function hasBacktickToken(body: string): boolean {
  return /`[^`\n]+`/.test(body)
}

/**
 * A "test identifier" for V6 is kept deliberately narrow: a token that looks like a
 * test or spec file (contains `.test.` or `.spec.`). Anything else must be backticked.
 */
export function hasTestIdentifier(body: string): boolean {
  return /\S*\.(?:test|spec)\.\S+/.test(body)
}
