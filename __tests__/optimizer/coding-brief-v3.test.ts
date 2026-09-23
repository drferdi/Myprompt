import { describe, expect, it } from 'vitest'

import { buildCodingBriefSystemPrompt } from '@/lib/llm/prompt-builder'
import {
  CODING_BRIEF_REPORT_TEXT,
  validateCodingBrief,
} from '@/lib/prompt-quality/contract'

// docs/CODING_BRIEF_STANDARD.md v3.0: fill by default, list proposals under ASSUMPTIONS.

const REPORT_SECTION = `## REPORT
${CODING_BRIEF_REPORT_TEXT}`

/** §8.2 — brownfield, the user supplied everything, so no ASSUMPTIONS. */
const RAW_REQUEST_8_2 =
  'the optimizer returns truncated prompts as successful results; fix it in lib/optimizer/engine.ts and lib/llm/types.ts, TypeScript with Vitest, follow the length-recovery logic in optimizePrompt'

const EXAMPLE_8_2 = `## GOAL
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
\`pnpm run test\` passes, including a new test that feeds the truncated fixture and expects a
truncation flag.

${REPORT_SECTION}`

function ruleIds(issues: string[]): string[] {
  const ids = issues.map((issue) => issue.slice(0, issue.indexOf(':')))
  return Array.from(new Set(ids)).sort()
}

/** A complete brownfield brief; each rule test below changes one element of it. */
function brownfield(parts: Partial<Record<'goal' | 'context' | 'scope' | 'stack' | 'outOfScope' | 'doneWhen' | 'assumptions', string | null>> = {}) {
  const value = {
    goal: 'Rename the truncation flag export.',
    context: 'lib/optimizer/engine.ts',
    scope: 'The export `truncationFlag` is renamed.\nEvery caller imports the new name.',
    stack: 'TypeScript, Vitest.',
    outOfScope: 'lib/transform/**',
    doneWhen: '`pnpm run test` passes.',
    assumptions: null,
    ...parts,
  }
  const sections: Array<[string, string | null]> = [
    ['GOAL', value.goal],
    ['CONTEXT', value.context],
    ['SCOPE', value.scope],
    ['STACK', value.stack],
    ['OUT OF SCOPE', value.outOfScope],
    ['DONE WHEN', value.doneWhen],
    ['ASSUMPTIONS', value.assumptions],
  ]
  return [
    ...sections.filter(([, body]) => body !== null).map(([heading, body]) => `## ${heading}\n${body}`),
    REPORT_SECTION,
  ].join('\n\n')
}

describe('Coding Brief v3.0 — rules', () => {
  it('V14: the §8.2 brownfield brief needs no ASSUMPTIONS against its own raw request', () => {
    const result = validateCodingBrief(EXAMPLE_8_2, { rawRequest: RAW_REQUEST_8_2 })

    expect(result.issues).toEqual([])
    expect(result.brief?.assumptions).toBeUndefined()
  })

  it('V1: STACK is required', () => {
    const result = validateCodingBrief(brownfield({ stack: null }))

    expect(result.issues).toEqual(['V1: missing required heading(s): STACK'])
  })

  it('V1: OUT OF SCOPE is required', () => {
    const result = validateCodingBrief(brownfield({ outOfScope: null }))

    expect(result.issues).toEqual(['V1: missing required heading(s): OUT OF SCOPE'])
  })

  it('V1: ASSUMPTIONS after REPORT is out of order', () => {
    const result = validateCodingBrief(`${brownfield()}\n\n## ASSUMPTIONS\n- One proposal.`)

    expect(ruleIds(result.issues)).toEqual(['V1'])
    expect(result.issues[0]).toContain('out of order')
  })

  it('V2: an empty ASSUMPTIONS section is flagged', () => {
    const result = validateCodingBrief(brownfield({ assumptions: '' }))

    expect(result.issues).toEqual(['V2: empty section(s): ASSUMPTIONS'])
  })

  it('V4: a bare "New project:" with no proposed directory is flagged', () => {
    const result = validateCodingBrief(brownfield({ context: 'New project:' }))

    expect(ruleIds(result.issues)).toEqual(['V4'])
  })

  it('V12: flags a placeholder that paraphrases the instruction', () => {
    const result = validateCodingBrief(
      brownfield({ doneWhen: 'Propose a check first: the intended outcome for the rename.' })
    )

    expect(result.issues).toEqual([
      'V12: placeholder paraphrases the instruction instead of stating it: "the intended outcome"',
    ])
  })

  it('V12: does not fire on a concrete placeholder or on "checkout"', () => {
    const result = validateCodingBrief(
      brownfield({ doneWhen: 'Propose a check first: the checkout page loads in under a second.' })
    )

    expect(result.issues).toEqual([])
  })

  it('V13: flags an unresolved [TODO: in a greenfield brief and names the elements', () => {
    const result = validateCodingBrief(
      brownfield({
        context: 'New project: ./portal',
        scope: 'Login page, dashboard.\n[TODO: what else belongs in scope?]',
      })
    )

    expect(result.issues).toEqual(['V13: unresolved [TODO: in a greenfield brief: SCOPE'])
  })

  it('V13: leaves a [TODO: in a brownfield brief alone', () => {
    const result = validateCodingBrief(
      brownfield({ scope: 'The rename.\n[TODO: which callers are affected?]' })
    )

    expect(result.issues).toEqual([])
  })

  it('V14: flags a greenfield brief whose directory the user never named and that has no ASSUMPTIONS', () => {
    const result = validateCodingBrief(brownfield({ context: 'New project: ./portal' }), {
      rawRequest: 'buat portal pasien',
    })

    expect(result.issues).toEqual([
      'V14: ASSUMPTIONS is missing although the brief proposes: directory ./portal, TypeScript, Vitest',
    ])
  })

  it('V14: flags a STACK technology the raw request did not name when ASSUMPTIONS is missing', () => {
    const result = validateCodingBrief(brownfield(), { rawRequest: 'rename the flag, keep TypeScript' })

    expect(result.issues).toEqual([
      'V14: ASSUMPTIONS is missing although the brief proposes: Vitest',
    ])
  })

  it('V14: accepts the same brief once ASSUMPTIONS lists the proposal', () => {
    const result = validateCodingBrief(
      brownfield({ assumptions: '- Vitest, the test runner already in the repository.' }),
      { rawRequest: 'rename the flag, keep TypeScript' }
    )

    expect(result.issues).toEqual([])
  })

  it('V14: accepts a greenfield directory the user named', () => {
    const result = validateCodingBrief(brownfield({ context: 'New project: ./portal' }), {
      rawRequest: 'buat portal pasien di ./portal pakai TypeScript dan Vitest',
    })

    expect(result.issues).toEqual([])
  })

  it('V14: is not evaluated without a raw request', () => {
    expect(validateCodingBrief(brownfield({ context: 'New project: ./portal' })).issues).toEqual([])
  })
})

describe('Coding Brief v3.0 — Optimizer system prompt', () => {
  it('teaches ASSUMPTIONS, proposing, and the §8.1 and §8.2 examples', () => {
    const systemPrompt = buildCodingBriefSystemPrompt()

    expect(systemPrompt).toContain('## ASSUMPTIONS')
    expect(systemPrompt).toContain('New project: ./clinic-website')
    expect(systemPrompt).toContain('Change any line above and run again.')
    expect(systemPrompt).toContain('@lib/optimizer/engine.ts')
  })

  it('no longer teaches a [TODO: placeholder for greenfield work', () => {
    expect(buildCodingBriefSystemPrompt()).not.toContain('New project: [TODO: target directory]')
  })
})
