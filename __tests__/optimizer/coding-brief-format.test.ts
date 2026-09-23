import { describe, expect, it } from 'vitest'

import {
  countScopeItems,
  findNamedTechnologies,
  TECHNOLOGY_LEXICON_SIZE,
} from '@/lib/optimizer/coding-brief-format'
import {
  CODING_BRIEF_REPORT_TEXT,
  validateCodingBrief,
} from '@/lib/prompt-quality/contract'

const REPORT_SECTION = `## REPORT
${CODING_BRIEF_REPORT_TEXT}`

/** docs/CODING_BRIEF_STANDARD.md §9.1 — greenfield, the case v1.0 could not express. */
const RAW_REQUEST_9_1 = 'buatkan website dokter umum pakai React dan Next.js'

const EXAMPLE_9_1 = `## GOAL
Build a general practitioner clinic website.

## CONTEXT
New project: [TODO: target directory]

## SCOPE
Home, services, doctor profile, opening hours, location, contact.
[TODO: appointment booking, or contact details only?]

## STACK
React with Next.js (App Router), TypeScript.

## OUT OF SCOPE
No patient data storage, no authentication, no medical records.

## DONE WHEN
\`pnpm dev\` runs and every page listed in SCOPE renders without console errors.

${REPORT_SECTION}`

/** docs/CODING_BRIEF_STANDARD.md §9.2 — brownfield, a fix in existing code. */
const EXAMPLE_9_2 = `## GOAL
Stop the optimizer from returning truncated prompts as successful results.

## CONTEXT
@lib/optimizer/engine.ts
@lib/llm/types.ts

## SCOPE
A streamed result ending mid-list is accepted as complete.
Expected: the truncation is detected and either continued or flagged.

## STACK
TypeScript, Vitest. Follow the length-recovery logic in \`optimizePrompt\`.

## OUT OF SCOPE
lib/transform/**, desktop/preload.ts

## DONE WHEN
\`pnpm run test\` passes, including a new test that feeds the truncated fixture and expects a truncation flag.

${REPORT_SECTION}`

/** docs/CODING_BRIEF_STANDARD.md §9.3 — thin: valid but warned (V11). */
const EXAMPLE_9_3 = `## GOAL
Make the application faster.

## CONTEXT
Explore first: the application, area not yet specified.

## SCOPE
[TODO: which screens or operations feel slow?]

## DONE WHEN
Propose a check first: the slow operation completes noticeably faster.

${REPORT_SECTION}`

/** docs/CODING_BRIEF_STANDARD.md §9.4 — invalid. */
const EXAMPLE_9_4 = `## GOAL
Fix the login bug. Also make the app faster for all users.

## CONTEXT
The login part.

## DONE WHEN
Login works well.`

/** A SCOPE with two concrete items, shared by the single-rule fixtures below. */
const SCOPE_SECTION = `## SCOPE
The export \`truncationFlag\` is renamed.
Every caller imports the new name.`

/** docs/CODING_BRIEF_STANDARD.md §9.2 written with the v1.0 headings (deprecated, accepted). */
const EXAMPLE_9_2_V1_HEADINGS = EXAMPLE_9_2.replace('## CONTEXT', '## WHERE')
  .replace('## SCOPE', '## SCENARIO')
  .replace('## STACK', '## FOLLOW PATTERN')

function ruleIds(issues: string[]): string[] {
  const ids = issues.map((issue) => issue.slice(0, issue.indexOf(':')))
  return Array.from(new Set(ids)).sort()
}

function hasRule(issues: string[], id: string): boolean {
  return issues.some((issue) => issue.startsWith(`${id}: `))
}

describe('validateCodingBrief — standard examples', () => {
  it('pins CODING_BRIEF_REPORT_TEXT to the canonical §7 text', () => {
    expect(CODING_BRIEF_REPORT_TEXT).toBe(
      [
        '- Read every file you reference before changing or describing it.',
        '- If a referenced file, function, or command does not exist, stop and ask.',
        '- Show each command you ran and its actual output.',
        '- Do not claim a result you did not execute.',
        '- List every file you changed and anything you left undone.',
      ].join('\n')
    )
  })

  it('accepts the §9.1 greenfield example against its raw request and exposes every section', () => {
    const result = validateCodingBrief(EXAMPLE_9_1, { rawRequest: RAW_REQUEST_9_1 })

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
    expect(result.thin).toBe(false)
    expect(result.deprecated).toEqual([])
    expect(result.brief?.goal).toBe('Build a general practitioner clinic website.')
    expect(result.brief?.context).toBe('New project: [TODO: target directory]')
    expect(result.brief?.scope).toContain('Home, services, doctor profile')
    expect(result.brief?.stack).toBe('React with Next.js (App Router), TypeScript.')
    expect(result.brief?.outOfScope).toBe(
      'No patient data storage, no authentication, no medical records.'
    )
    expect(result.brief?.doneWhen).toContain('`pnpm dev`')
    expect(result.brief?.report).toBe(CODING_BRIEF_REPORT_TEXT)
  })

  it('accepts the §9.2 brownfield example and exposes every section', () => {
    const result = validateCodingBrief(EXAMPLE_9_2)

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
    expect(result.thin).toBe(false)
    expect(result.brief?.goal).toBe(
      'Stop the optimizer from returning truncated prompts as successful results.'
    )
    expect(result.brief?.context).toContain('@lib/optimizer/engine.ts')
    expect(result.brief?.scope).toContain('Expected: the truncation is detected')
    expect(result.brief?.stack).toContain('length-recovery logic')
    expect(result.brief?.outOfScope).toBe('lib/transform/**, desktop/preload.ts')
    expect(result.brief?.doneWhen).toContain('`pnpm run test`')
    expect(result.brief?.report).toBe(CODING_BRIEF_REPORT_TEXT)
  })

  it('accepts the §9.3 thin example as valid, flags it thin, and omits absent optional sections', () => {
    const result = validateCodingBrief(EXAMPLE_9_3)

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
    expect(result.thin).toBe(true)
    expect(result.brief?.stack).toBeUndefined()
    expect(result.brief?.outOfScope).toBeUndefined()
  })

  it('rejects the §9.4 example with exactly V1, V3, V4, V6 and V7', () => {
    const result = validateCodingBrief(EXAMPLE_9_4)

    expect(result.valid).toBe(false)
    expect(result.thin).toBe(false)
    expect(result.brief).toBeUndefined()
    expect(ruleIds(result.issues)).toEqual(['V1', 'V3', 'V4', 'V6', 'V7'])
  })
})

describe('validateCodingBrief — rules', () => {
  it('V1: flags a missing required heading', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## CONTEXT
lib/optimizer/engine.ts

## DONE WHEN
\`pnpm run test\` passes.`)

    expect(hasRule(result.issues, 'V1')).toBe(true)
    expect(result.issues[0]).toContain('missing required heading(s): SCOPE, REPORT')
  })

  it('V1: flags an unknown heading', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## CONTEXT
lib/optimizer/engine.ts

${SCOPE_SECTION}

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}

## Notes
Anything extra.`)

    expect(hasRule(result.issues, 'V1')).toBe(true)
  })

  it('V1: flags sections that are out of order', () => {
    const result = validateCodingBrief(`## CONTEXT
lib/optimizer/engine.ts

## GOAL
Rename the export.

${SCOPE_SECTION}

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(hasRule(result.issues, 'V1')).toBe(true)
  })

  it('V1: flags a duplicate heading', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## GOAL
Rename the export again.

## CONTEXT
lib/optimizer/engine.ts

${SCOPE_SECTION}

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(hasRule(result.issues, 'V1')).toBe(true)
  })

  it('V2: flags a present optional section with an empty body', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## CONTEXT
lib/optimizer/engine.ts

${SCOPE_SECTION}

## OUT OF SCOPE

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(hasRule(result.issues, 'V2')).toBe(true)
  })

  it('V3: flags a GOAL longer than 40 words', () => {
    const goal = `Rename ${Array.from({ length: 45 }, (_, i) => `word${i}`).join(' ')}.`
    const result = validateCodingBrief(`## GOAL
${goal}

## CONTEXT
lib/optimizer/engine.ts

${SCOPE_SECTION}

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(hasRule(result.issues, 'V3')).toBe(true)
  })

  it('V3: flags a GOAL made of two sentences', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export. Then update the callers.

## CONTEXT
lib/optimizer/engine.ts

${SCOPE_SECTION}

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(hasRule(result.issues, 'V3')).toBe(true)
  })

  it('V4: flags a CONTEXT without a path-like token, New project: or Explore first:', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## CONTEXT
The login part.

${SCOPE_SECTION}

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(hasRule(result.issues, 'V4')).toBe(true)
  })

  it('V4: accepts a CONTEXT that begins with New project:', () => {
    const result = validateCodingBrief(`## GOAL
Build a clinic website.

## CONTEXT
New project: apps/clinic

${SCOPE_SECTION}

## DONE WHEN
\`pnpm dev\` runs and every page renders.

${REPORT_SECTION}`)

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
  })

  it('V5: flags a SCOPE that is a single vague noun phrase', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## CONTEXT
lib/optimizer/engine.ts

## SCOPE
The renaming.

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(hasRule(result.issues, 'V5')).toBe(true)
    expect(result.issues.find((issue) => issue.startsWith('V5: '))).toContain('(found 1)')
  })

  it('V5: accepts a SCOPE with two items on one line', () => {
    const result = validateCodingBrief(`## GOAL
Build a clinic website.

## CONTEXT
New project: apps/clinic

## SCOPE
Home page, contact page.

## DONE WHEN
\`pnpm dev\` runs and every page renders.

${REPORT_SECTION}`)

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
  })

  it('V5: accepts a single item followed by a [TODO: question on a later line', () => {
    const result = validateCodingBrief(`## GOAL
Build a login page.

## CONTEXT
New project: apps/portal

## SCOPE
Halaman login.
[TODO: what else belongs in scope?]

## DONE WHEN
\`pnpm dev\` runs and the login page renders.

${REPORT_SECTION}`)

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
  })

  it('V5: accepts a SCOPE that is only a [TODO: question and leaves it to V11', () => {
    const result = validateCodingBrief(`## GOAL
Make the application faster.

## CONTEXT
lib/optimizer/engine.ts

## SCOPE
[TODO: which screens or operations feel slow?]

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
    expect(result.thin).toBe(false)
  })

  it('V6: flags a DONE WHEN without a command or test identifier', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## CONTEXT
lib/optimizer/engine.ts

${SCOPE_SECTION}

## DONE WHEN
The renamed export is used everywhere it is needed.

${REPORT_SECTION}`)

    expect(hasRule(result.issues, 'V6')).toBe(true)
  })

  it('V7: flags a vague DONE WHEN with no backticked token', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## CONTEXT
lib/optimizer/engine.ts

${SCOPE_SECTION}

## DONE WHEN
Login works well.

${REPORT_SECTION}`)

    expect(hasRule(result.issues, 'V7')).toBe(true)
  })

  it('V8: flags an altered REPORT line', () => {
    const altered = CODING_BRIEF_REPORT_TEXT.replace(
      '- Show each command you ran and its actual output.',
      '- Show the commands.'
    )
    const result = validateCodingBrief(`## GOAL
Rename the export.

## CONTEXT
lib/optimizer/engine.ts

${SCOPE_SECTION}

## DONE WHEN
\`pnpm run test\` passes.

## REPORT
${altered}`)

    expect(hasRule(result.issues, 'V8')).toBe(true)
  })

  it('V9: flags a line that begins with an Optimizer settings label', () => {
    const result = validateCodingBrief(`Tone: TECHNICAL

## GOAL
Rename the export.

## CONTEXT
lib/optimizer/engine.ts

${SCOPE_SECTION}

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(hasRule(result.issues, 'V9')).toBe(true)
  })
})

describe('validateCodingBrief — V10 named technologies', () => {
  const briefWithStack = (stack: string | null) => `## GOAL
Build a general practitioner clinic website.

## CONTEXT
New project: [TODO: target directory]

## SCOPE
Home, services, doctor profile, opening hours, location, contact.
${stack === null ? '' : `\n## STACK\n${stack}\n`}
## DONE WHEN
\`pnpm dev\` runs and every page listed in SCOPE renders without console errors.

${REPORT_SECTION}`

  it('detects React and Next.js in the §9.1 raw request', () => {
    expect(findNamedTechnologies(RAW_REQUEST_9_1)).toEqual(['React', 'Next.js'])
  })

  it('V10: flags a brief with no STACK when the raw request names React and Next.js', () => {
    const result = validateCodingBrief(briefWithStack(null), { rawRequest: RAW_REQUEST_9_1 })

    expect(result.valid).toBe(false)
    expect(ruleIds(result.issues)).toEqual(['V10'])
    expect(result.issues[0]).toBe(
      'V10: STACK is missing technology named in the request: React, Next.js'
    )
  })

  it('V10: names only the technology STACK dropped', () => {
    const result = validateCodingBrief(briefWithStack('React, TypeScript.'), {
      rawRequest: RAW_REQUEST_9_1,
    })

    expect(ruleIds(result.issues)).toEqual(['V10'])
    expect(result.issues[0]).toBe(
      'V10: STACK is missing technology named in the request: Next.js'
    )
  })

  it('V10: accepts the §9.1 STACK and matches spellings without regard to case', () => {
    expect(
      validateCodingBrief(briefWithStack('React with Next.js (App Router), TypeScript.'), {
        rawRequest: RAW_REQUEST_9_1,
      }).issues
    ).toEqual([])
    expect(
      validateCodingBrief(briefWithStack('react + nextjs'), { rawRequest: RAW_REQUEST_9_1 })
        .issues
    ).toEqual([])
  })

  it('V10: is not evaluated when no raw request is given', () => {
    const result = validateCodingBrief(briefWithStack(null))

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
  })

  it('V10: does not fire when the raw request names no known technology', () => {
    const result = validateCodingBrief(briefWithStack(null), {
      rawRequest: 'buatkan website dokter umum, go live next week',
    })

    expect(findNamedTechnologies('buatkan website dokter umum, go live next week')).toEqual([])
    expect(result.issues).toEqual([])
  })

  it('the lexicon is a fixed list of known names', () => {
    expect(TECHNOLOGY_LEXICON_SIZE).toBeGreaterThan(50)
    expect(findNamedTechnologies('Vue.js dan Tailwind CSS, database Postgres')).toEqual([
      'CSS',
      'Vue',
      'PostgreSQL',
      'Tailwind',
    ])
  })
})

describe('validateCodingBrief — V11 thin brief', () => {
  it('is thin only when CONTEXT and DONE WHEN both defer', () => {
    expect(validateCodingBrief(EXAMPLE_9_3).thin).toBe(true)
    expect(validateCodingBrief(EXAMPLE_9_2).thin).toBe(false)

    const onlyContextDefers = EXAMPLE_9_3.replace(
      'Propose a check first: the slow operation completes noticeably faster.',
      '`pnpm run bench` reports the slow operation under 200 ms.'
    )
    expect(validateCodingBrief(onlyContextDefers).valid).toBe(true)
    expect(validateCodingBrief(onlyContextDefers).thin).toBe(false)

    const onlyDoneWhenDefers = EXAMPLE_9_3.replace(
      'Explore first: the application, area not yet specified.',
      'lib/optimizer/engine.ts'
    )
    expect(validateCodingBrief(onlyDoneWhenDefers).valid).toBe(true)
    expect(validateCodingBrief(onlyDoneWhenDefers).thin).toBe(false)
  })

  it('an invalid brief is never reported thin', () => {
    const result = validateCodingBrief(EXAMPLE_9_3.replace('## SCOPE\n', '## SCOPE\n\n## STACK\n'))

    expect(result.valid).toBe(false)
    expect(result.thin).toBe(false)
  })
})

describe('validateCodingBrief — deprecated v1.0 headings', () => {
  it('accepts WHERE, SCENARIO and FOLLOW PATTERN, maps them, and reports them as deprecated', () => {
    const result = validateCodingBrief(EXAMPLE_9_2_V1_HEADINGS)

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
    expect(result.deprecated).toEqual([
      'WHERE (use CONTEXT)',
      'SCENARIO (use SCOPE)',
      'FOLLOW PATTERN (use STACK)',
    ])
    expect(result.brief?.context).toContain('@lib/optimizer/engine.ts')
    expect(result.brief?.scope).toContain('Expected: the truncation is detected')
    expect(result.brief?.stack).toContain('length-recovery logic')
  })

  it('V1: treats WHERE beside CONTEXT as a duplicate heading', () => {
    const result = validateCodingBrief(
      EXAMPLE_9_2.replace('## CONTEXT\n', '## WHERE\nlib/llm/types.ts\n\n## CONTEXT\n')
    )

    expect(hasRule(result.issues, 'V1')).toBe(true)
    expect(result.issues[0]).toContain('duplicate heading(s): CONTEXT')
    expect(result.deprecated).toEqual(['WHERE (use CONTEXT)'])
  })

  it('a v2.0 brief reports no deprecated headings', () => {
    expect(validateCodingBrief(EXAMPLE_9_1).deprecated).toEqual([])
  })
})

describe('countScopeItems — the V5 splitter', () => {
  it('counts the standard examples', () => {
    expect(countScopeItems('Home, services, doctor profile, opening hours, location, contact.\n[TODO: appointment booking, or contact details only?]')).toBe(6)
    expect(countScopeItems('A streamed result ending mid-list is accepted as complete.\nExpected: the truncation is detected and either continued or flagged.')).toBe(2)
    expect(countScopeItems('[TODO: which screens or operations feel slow?]')).toBe(0)
  })

  it('counts bullet items and ignores empty pieces', () => {
    expect(countScopeItems('- Home page\n- Contact page\n\n')).toBe(2)
    expect(countScopeItems('1. Login form; 2. Password reset')).toBe(2)
    expect(countScopeItems('The renaming.')).toBe(1)
  })
})

describe('validateCodingBrief — positive edges', () => {
  it('does not flag V3 for a filename mid-sentence', () => {
    const result = validateCodingBrief(`## GOAL
Rename the truncation flag exported from lib/optimizer/foo.ts so callers read it consistently.

## CONTEXT
lib/optimizer/foo.ts

${SCOPE_SECTION}

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
  })

  it('does not flag V9 for a Read first: line in CONTEXT', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## CONTEXT
lib/optimizer/engine.ts
Read first: lib/optimizer/super-prompt-format.ts

${SCOPE_SECTION}

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
  })

  it('accepts CRLF input', () => {
    const result = validateCodingBrief(EXAMPLE_9_2.replace(/\n/g, '\r\n'))

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
  })

  it('accepts a brief wrapped in a markdown fence', () => {
    const result = validateCodingBrief(`\`\`\`markdown\n${EXAMPLE_9_3}\n\`\`\``)

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
  })

  it('does not treat a bare ## line followed by text as a heading', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## CONTEXT
lib/optimizer/engine.ts
##
Notes about the location.

${SCOPE_SECTION}

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
    expect(result.brief?.context).toContain('Notes about the location.')
  })

  it('accepts a DONE WHEN that names a test file instead of a command', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## CONTEXT
lib/optimizer/engine.ts

${SCOPE_SECTION}

## DONE WHEN
The suite in __tests__/optimizer/engine.test.ts passes with the renamed export.

${REPORT_SECTION}`)

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
  })
})
