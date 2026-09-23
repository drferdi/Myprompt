import { describe, expect, it } from 'vitest'

import {
  ASSUMPTIONS_CLOSING_LINE,
  MAX_CLARIFICATIONS,
  deriveClarificationQuestions,
} from '@/lib/prompt-quality/clarification'
import { CODING_BRIEF_REPORT_TEXT, validateCodingBrief } from '@/lib/prompt-quality/contract'
import type { CodingBrief } from '@/types'

// docs/CODING_BRIEF_STANDARD.md §6 P5: questions refine a brief that is already complete.

const REPORT_SECTION = `## REPORT
${CODING_BRIEF_REPORT_TEXT}`

/** §8.1 — greenfield, four proposals listed under ASSUMPTIONS. */
const EXAMPLE_8_1 = `## GOAL
Build a general practitioner clinic website with a sky-blue visual theme.

## CONTEXT
New project: ./clinic-website

## SCOPE
Home with clinic introduction, doctor profile, services, opening hours, location with map
link, and a contact page with a form that sends to an email address.

## STACK
Next.js (App Router), React, TypeScript, Tailwind CSS.

## OUT OF SCOPE
No patient records, no authentication, no online appointment booking, no payments.

## DONE WHEN
\`pnpm dev\` runs and every page listed in SCOPE opens in the browser with the sky-blue theme
applied and no console errors.

## ASSUMPTIONS
- Directory ./clinic-website; change it if the project lives elsewhere.
- Next.js and Tailwind chosen as the ordinary stack for this kind of site.
- Contact by form and email, no booking system.
- Indonesian-language content, single clinic, single doctor profile.
Change any line above and run again.

${REPORT_SECTION}`

/** §8.2 — brownfield, the user supplied everything. */
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

/** §8.3 — brownfield thin, with a SCOPE question and ASSUMPTIONS after the deferrals. */
const EXAMPLE_8_3 = `## GOAL
Make the application faster.

## CONTEXT
Explore first: the application, area not yet specified.

## SCOPE
[TODO: which screens or operations feel slow?]

## STACK
Explore first: the stack the repository already uses.

## OUT OF SCOPE
No new dependencies, no feature changes.

## DONE WHEN
Propose a check first: the slow operation completes noticeably faster.

## ASSUMPTIONS
- Faster means shorter load and response times on the most used screens.
Change any line above and run again.

${REPORT_SECTION}`

function briefOf(markdown: string): CodingBrief {
  const result = validateCodingBrief(markdown)
  expect(result.issues).toEqual([])
  return result.brief as CodingBrief
}

describe('deriveClarificationQuestions', () => {
  it('§8.2: a brief the user supplied in full yields no questions', () => {
    expect(deriveClarificationQuestions(briefOf(EXAMPLE_8_2))).toEqual([])
  })

  it('§8.1: yields the first three ASSUMPTIONS lines, never the closing line', () => {
    const questions = deriveClarificationQuestions(briefOf(EXAMPLE_8_1))

    expect(questions).toEqual([
      { element: 'ASSUMPTION', question: 'Directory ./clinic-website; change it if the project lives elsewhere.' },
      { element: 'ASSUMPTION', question: 'Next.js and Tailwind chosen as the ordinary stack for this kind of site.' },
      { element: 'ASSUMPTION', question: 'Contact by form and email, no booking system.' },
    ])
    expect(questions.map((item) => item.question)).not.toContain(ASSUMPTIONS_CLOSING_LINE)
  })

  it('§8.3: asks CONTEXT, DONE WHEN and the SCOPE [TODO: before any ASSUMPTIONS line, never STACK', () => {
    const questions = deriveClarificationQuestions(briefOf(EXAMPLE_8_3))

    expect(questions).toEqual([
      { element: 'CONTEXT', question: 'Explore first: the application, area not yet specified.' },
      { element: 'DONE_WHEN', question: 'Propose a check first: the slow operation completes noticeably faster.' },
      { element: 'SCOPE', question: 'which screens or operations feel slow?' },
    ])
    expect(questions.some((item) => item.question.includes('the stack the repository'))).toBe(false)
  })

  it('reaches ASSUMPTIONS lines once the deferrals are asked, still never the closing line', () => {
    const onlyContextDefers = EXAMPLE_8_3.replace(
      'Propose a check first: the slow operation completes noticeably faster.',
      '`pnpm run bench` reports the slow operation under 200 ms.'
    ).replace('[TODO: which screens or operations feel slow?]', 'Dashboard load, search results.')

    expect(deriveClarificationQuestions(briefOf(onlyContextDefers))).toEqual([
      { element: 'CONTEXT', question: 'Explore first: the application, area not yet specified.' },
      {
        element: 'ASSUMPTION',
        question: 'Faster means shorter load and response times on the most used screens.',
      },
    ])
  })

  it(`never returns more than ${MAX_CLARIFICATIONS} questions`, () => {
    const manyAssumptions = EXAMPLE_8_1.replace(
      'Change any line above and run again.',
      '- One.\n- Two.\n- Three.\n- Four.\nChange any line above and run again.'
    )

    expect(MAX_CLARIFICATIONS).toBe(3)
    expect(deriveClarificationQuestions(briefOf(manyAssumptions))).toHaveLength(3)
  })
})
