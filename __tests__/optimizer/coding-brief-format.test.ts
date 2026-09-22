import { describe, expect, it } from 'vitest'

import {
  CODING_BRIEF_REPORT_TEXT,
  validateCodingBrief,
} from '@/lib/prompt-quality/contract'

const REPORT_SECTION = `## REPORT
${CODING_BRIEF_REPORT_TEXT}`

/** docs/CODING_BRIEF_STANDARD.md §8.1 — valid bug fix with known location. */
const EXAMPLE_8_1 = `## GOAL
Stop the optimizer from returning truncated Super Prompts as successful results.

## WHERE
@lib/optimizer/engine.ts
@lib/llm/types.ts

## SCENARIO
A streamed result that ends mid-list ("## OUTPUT FORMAT ... -") is accepted as complete.
Expected: the truncation is detected and either continued or flagged.

## FOLLOW PATTERN
The existing length-recovery logic in \`optimizePrompt\` (non-streaming path).

## OUT OF SCOPE
lib/transform/**, desktop/preload.ts

## DONE WHEN
\`pnpm run test\` passes, including a new test that feeds the truncated fixture and expects a truncation flag.

${REPORT_SECTION}`

/** docs/CODING_BRIEF_STANDARD.md §8.2 — valid without known location or check. */
const EXAMPLE_8_2 = `## GOAL
Show a clear warning when a generated prompt is incomplete.

## WHERE
Explore first: the screen that displays the optimized prompt result.

## DONE WHEN
Propose a check first: an incomplete result visibly shows a warning; a complete result shows none.

${REPORT_SECTION}`

/** docs/CODING_BRIEF_STANDARD.md §8.3 — invalid. */
const EXAMPLE_8_3 = `## GOAL
Fix the login bug. Also make the app faster for all users.

## WHERE
The login part.

## DONE WHEN
Login works well.`

function ruleIds(issues: string[]): string[] {
  const ids = issues.map((issue) => issue.slice(0, issue.indexOf(':')))
  return Array.from(new Set(ids)).sort()
}

function hasRule(issues: string[], id: string): boolean {
  return issues.some((issue) => issue.startsWith(`${id}: `))
}

describe('validateCodingBrief — standard examples', () => {
  it('pins CODING_BRIEF_REPORT_TEXT to the canonical §6 text', () => {
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

  it('accepts the §8.1 example and exposes every section', () => {
    const result = validateCodingBrief(EXAMPLE_8_1)

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
    expect(result.brief?.goal).toBe(
      'Stop the optimizer from returning truncated Super Prompts as successful results.'
    )
    expect(result.brief?.where).toContain('@lib/optimizer/engine.ts')
    expect(result.brief?.scenario).toContain('Expected: the truncation is detected')
    expect(result.brief?.followPattern).toContain('length-recovery logic')
    expect(result.brief?.outOfScope).toBe('lib/transform/**, desktop/preload.ts')
    expect(result.brief?.doneWhen).toContain('`pnpm run test`')
    expect(result.brief?.report).toBe(CODING_BRIEF_REPORT_TEXT)
  })

  it('accepts the §8.2 example and omits absent optional sections', () => {
    const result = validateCodingBrief(EXAMPLE_8_2)

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
    expect(result.brief?.scenario).toBeUndefined()
    expect(result.brief?.followPattern).toBeUndefined()
    expect(result.brief?.outOfScope).toBeUndefined()
  })

  it('rejects the §8.3 example with exactly V1, V3, V4, V5, V6 and V7', () => {
    const result = validateCodingBrief(EXAMPLE_8_3)

    expect(result.valid).toBe(false)
    expect(result.brief).toBeUndefined()
    expect(ruleIds(result.issues)).toEqual(['V1', 'V3', 'V4', 'V5', 'V6', 'V7'])
  })
})

describe('validateCodingBrief — rules', () => {
  it('V1: flags a missing required heading', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## WHERE
lib/optimizer/engine.ts

## DONE WHEN
\`pnpm run test\` passes.`)

    expect(hasRule(result.issues, 'V1')).toBe(true)
  })

  it('V1: flags an unknown heading', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## WHERE
lib/optimizer/engine.ts

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}

## Notes
Anything extra.`)

    expect(hasRule(result.issues, 'V1')).toBe(true)
  })

  it('V1: flags sections that are out of order', () => {
    const result = validateCodingBrief(`## WHERE
lib/optimizer/engine.ts

## GOAL
Rename the export.

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

## WHERE
lib/optimizer/engine.ts

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(hasRule(result.issues, 'V1')).toBe(true)
  })

  it('V2: flags a present optional section with an empty body', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## WHERE
lib/optimizer/engine.ts

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

## WHERE
lib/optimizer/engine.ts

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(hasRule(result.issues, 'V3')).toBe(true)
  })

  it('V3: flags a GOAL made of two sentences', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export. Then update the callers.

## WHERE
lib/optimizer/engine.ts

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(hasRule(result.issues, 'V3')).toBe(true)
  })

  it('V4: flags a WHERE without a path-like token', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## WHERE
The login part.

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(hasRule(result.issues, 'V4')).toBe(true)
  })

  it('V5: flags a fix GOAL without SCENARIO', () => {
    const result = validateCodingBrief(`## GOAL
Fix the truncated result banner.

## WHERE
lib/optimizer/engine.ts

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(hasRule(result.issues, 'V5')).toBe(true)
  })

  it('V6: flags a DONE WHEN without a command or test identifier', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## WHERE
lib/optimizer/engine.ts

## DONE WHEN
The renamed export is used everywhere it is needed.

${REPORT_SECTION}`)

    expect(hasRule(result.issues, 'V6')).toBe(true)
  })

  it('V7: flags a vague DONE WHEN with no backticked token', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## WHERE
lib/optimizer/engine.ts

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

## WHERE
lib/optimizer/engine.ts

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

## WHERE
lib/optimizer/engine.ts

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(hasRule(result.issues, 'V9')).toBe(true)
  })
})

describe('validateCodingBrief — positive edges', () => {
  it('does not flag V3 for a filename mid-sentence', () => {
    const result = validateCodingBrief(`## GOAL
Rename the truncation flag exported from lib/optimizer/foo.ts so callers read it consistently.

## WHERE
lib/optimizer/foo.ts

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
  })

  it('does not flag V9 for a Read first: line in WHERE', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## WHERE
lib/optimizer/engine.ts
Read first: lib/optimizer/super-prompt-format.ts

## DONE WHEN
\`pnpm run test\` passes.

${REPORT_SECTION}`)

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
  })

  it('accepts CRLF input', () => {
    const result = validateCodingBrief(EXAMPLE_8_1.replace(/\n/g, '\r\n'))

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
  })

  it('accepts a brief wrapped in a markdown fence', () => {
    const result = validateCodingBrief(`\`\`\`markdown\n${EXAMPLE_8_2}\n\`\`\``)

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
  })

  it('accepts a DONE WHEN that names a test file instead of a command', () => {
    const result = validateCodingBrief(`## GOAL
Rename the export.

## WHERE
lib/optimizer/engine.ts

## DONE WHEN
The suite in __tests__/optimizer/engine.test.ts passes with the renamed export.

${REPORT_SECTION}`)

    expect(result.issues).toEqual([])
    expect(result.valid).toBe(true)
  })
})
