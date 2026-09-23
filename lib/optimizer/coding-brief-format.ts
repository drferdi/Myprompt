// Sentra Prompt — Coding Brief Markdown parser (docs/CODING_BRIEF_STANDARD.md §4)
//
// Pure lexical layer: it splits a brief into its `## HEADING` sections and exposes
// the small heuristics the validator needs. It deliberately imports nothing from
// `@/lib/prompt-quality/*` — `contract.ts` imports this module, and the reverse
// edge would close a cycle through `super-prompt-format.ts`.

/** The seven headings of §4, in the order the standard fixes (v2.0). */
export const CODING_BRIEF_HEADINGS = [
  'GOAL',
  'CONTEXT',
  'SCOPE',
  'STACK',
  'OUT OF SCOPE',
  'DONE WHEN',
  'REPORT',
] as const

export type CodingBriefHeading = (typeof CODING_BRIEF_HEADINGS)[number]

/**
 * v1.0 headings, accepted for one release and mapped to their v2.0 heading ("What
 * changed in v2.0"). A mapped section takes the v2.0 position for the order check.
 */
export const DEPRECATED_HEADINGS: Readonly<Record<string, CodingBriefHeading>> = {
  WHERE: 'CONTEXT',
  SCENARIO: 'SCOPE',
  'FOLLOW PATTERN': 'STACK',
}

/** Canonical `## REPORT` body from §7, without the heading line. */
export const CODING_BRIEF_REPORT_TEXT = [
  '- Read every file you reference before changing or describing it.',
  '- If a referenced file, function, or command does not exist, stop and ask.',
  '- Show each command you ran and its actual output.',
  '- Do not claim a result you did not execute.',
  '- List every file you changed and anything you left undone.',
].join('\n')

export interface CodingBriefSection {
  heading: CodingBriefHeading
  /** Section body, trimmed. Empty when the heading has no content (V2). */
  body: string
  /** The v1.0 heading this section was written under, when it was mapped. */
  deprecatedHeading?: string
}

export interface ParsedCodingBrief {
  /** Normalised source: CRLF folded, trimmed, outer fence removed. */
  text: string
  /** Known sections in document order (duplicates preserved, so V1 can see them). */
  sections: CodingBriefSection[]
  /** `## ...` headings that are neither one of the seven nor a v1.0 alias (V1). */
  unknownHeadings: string[]
  /** v1.0 headings found and mapped, as `WHERE (use CONTEXT)`. */
  deprecatedHeadings: string[]
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
interface HeadingMatch {
  heading: string
  matchStart: number
  contentStart: number
}

/** Scan `## ` headings. `[ \t]+` (not `\s+`) so a bare `##` line never swallows the next line. */
function scanHeadings(text: string): HeadingMatch[] {
  const headingRe = /^##[ \t]+(.+)$/gm
  const found: HeadingMatch[] = []
  let match: RegExpExecArray | null
  while ((match = headingRe.exec(text)) !== null) {
    found.push({
      heading: match[1].trim(),
      matchStart: match.index,
      contentStart: match.index + match[0].length,
    })
  }
  return found
}

/**
 * Replace whatever `## REPORT` the model emitted with the canonical §6 text.
 *
 * Invariant: the result carries exactly one REPORT section, so V8 can only fail on an
 * engine bug and never on model output. Normalisation runs first, otherwise a fenced
 * response would get the canonical REPORT appended outside its own fence.
 */
export function applyCanonicalReport(markdown: string): string {
  const text = normaliseCodingBrief(markdown)
  const found = scanHeadings(text)

  let stripped = text
  for (let i = found.length - 1; i >= 0; i--) {
    if (found[i].heading !== 'REPORT') {
      continue
    }
    const end = i + 1 < found.length ? found[i + 1].matchStart : stripped.length
    stripped = stripped.slice(0, found[i].matchStart) + stripped.slice(end)
  }

  return `${stripped.trim()}\n\n## REPORT\n${CODING_BRIEF_REPORT_TEXT}`
}

export function parseCodingBriefSections(markdown: string): ParsedCodingBrief {
  const text = normaliseCodingBrief(markdown)
  const found = scanHeadings(text)

  const sections: CodingBriefSection[] = []
  const unknownHeadings: string[] = []
  const deprecatedHeadings: string[] = []

  for (let i = 0; i < found.length; i++) {
    const { heading, contentStart } = found[i]
    const end = i + 1 < found.length ? found[i + 1].matchStart : text.length
    const body = text.slice(contentStart, end).trim()
    if (isKnownHeading(heading)) {
      sections.push({ heading, body })
    } else if (Object.prototype.hasOwnProperty.call(DEPRECATED_HEADINGS, heading)) {
      const mapped = DEPRECATED_HEADINGS[heading]
      sections.push({ heading: mapped, body, deprecatedHeading: heading })
      deprecatedHeadings.push(`${heading} (use ${mapped})`)
    } else {
      unknownHeadings.push(heading)
    }
  }

  return { text, sections, unknownHeadings, deprecatedHeadings }
}

/**
 * SCOPE items for V5: non-empty pieces after splitting on line breaks, commas and
 * semicolons, with bullet markers removed. `[TODO: …]` placeholders are questions to
 * the user, not items, so they are removed before counting.
 */
export function countScopeItems(body: string): number {
  return body
    .replace(/\[TODO:[^\]]*\]/g, '')
    .split(/\n|,|;/)
    .map((piece) => piece.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter((piece) => piece !== '' && !/^[.?!]+$/.test(piece)).length
}

/**
 * Technology names V10 recognises in a raw request. Each entry is a canonical name
 * followed by the spellings that count as the same technology. Matching ignores case
 * and requires a word boundary on both sides, so `Next` alone or `go` never match.
 *
 * Heuristic: a deterministic list misses any name it does not hold. Pending Phase 4
 * calibration (§5); extend it from evaluation data rather than by guesswork.
 */
const TECHNOLOGY_LEXICON: ReadonlyArray<readonly string[]> = [
  // Languages
  ['TypeScript'],
  ['JavaScript'],
  ['Python'],
  ['Java'],
  ['Kotlin'],
  ['Swift'],
  ['Dart'],
  ['Golang'],
  ['Rust'],
  ['Ruby'],
  ['PHP'],
  ['C#'],
  ['C++'],
  ['HTML'],
  ['CSS'],
  ['SQL'],
  // Runtimes and package managers
  ['Node.js', 'NodeJS'],
  ['Bun'],
  ['Deno'],
  ['pnpm'],
  ['npm'],
  // Web frameworks
  ['React'],
  ['Next.js', 'NextJS'],
  ['Vue', 'Vue.js', 'VueJS'],
  ['Nuxt', 'Nuxt.js'],
  ['Angular'],
  ['Svelte'],
  ['SvelteKit'],
  ['SolidJS', 'Solid.js'],
  ['Astro'],
  ['Remix'],
  ['Express.js', 'ExpressJS'],
  ['NestJS', 'Nest.js'],
  ['Fastify'],
  ['Hono'],
  ['Django'],
  ['Flask'],
  ['FastAPI'],
  ['Laravel'],
  ['Ruby on Rails', 'Rails'],
  ['Spring Boot', 'Spring'],
  ['ASP.NET', '.NET'],
  ['WordPress'],
  // Mobile and desktop
  ['React Native'],
  ['Flutter'],
  ['Expo'],
  ['Electron'],
  ['Tauri'],
  ['SwiftUI'],
  ['Jetpack Compose'],
  // Data
  ['PostgreSQL', 'Postgres'],
  ['MySQL'],
  ['MariaDB'],
  ['SQLite'],
  ['MongoDB', 'Mongo'],
  ['Redis'],
  ['Prisma'],
  ['Drizzle'],
  ['TypeORM'],
  ['Sequelize'],
  ['Supabase'],
  ['Firebase'],
  ['GraphQL'],
  ['tRPC'],
  // UI and styling
  ['Tailwind', 'Tailwind CSS', 'TailwindCSS'],
  ['Bootstrap'],
  ['Sass', 'SCSS'],
  ['shadcn', 'shadcn/ui'],
  ['Material UI', 'MUI'],
  ['Chakra UI'],
  // State and data fetching
  ['Redux'],
  ['Zustand'],
  ['TanStack Query', 'React Query'],
  ['Zod'],
  // Build and test
  ['Vite'],
  ['Webpack'],
  ['esbuild'],
  ['Vitest'],
  ['Jest'],
  ['Playwright'],
  ['Cypress'],
  ['pytest'],
  ['Storybook'],
  // Infrastructure
  ['Docker'],
  ['Kubernetes'],
  ['Terraform'],
  ['Nginx'],
  ['AWS'],
  ['Vercel'],
  ['Netlify'],
  ['Cloudflare'],
  // Payments and services
  ['Stripe'],
  ['Midtrans'],
  // Data science
  ['pandas'],
  ['NumPy'],
  ['PyTorch'],
  ['TensorFlow'],
]

/** Number of technologies the V10 lexicon holds (for reports and tests). */
export const TECHNOLOGY_LEXICON_SIZE = TECHNOLOGY_LEXICON.length

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function spellingPattern(spelling: string): RegExp {
  // Not preceded by a word character or a dot (so `vue.js` counts as `Vue` but
  // `foo.React` does not), not followed by a word character.
  return new RegExp(`(?<![\\w.])${escapeRegExp(spelling)}(?!\\w)`, 'i')
}

/** Technologies named in `text`, as canonical names in lexicon order. */
export function findNamedTechnologies(text: string): string[] {
  return TECHNOLOGY_LEXICON.filter((spellings) =>
    spellings.some((spelling) => spellingPattern(spelling).test(text))
  ).map((spellings) => spellings[0])
}

/** True when `body` names the technology `canonical` under any of its spellings. */
export function mentionsTechnology(body: string, canonical: string): boolean {
  const spellings = TECHNOLOGY_LEXICON.find((entry) => entry[0] === canonical) ?? [canonical]
  return spellings.some((spelling) => spellingPattern(spelling).test(body))
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
