// Sentra Prompt — Coding Brief clarification questions (docs/CODING_BRIEF_STANDARD.md §6 P5)
//
// Questions refine a brief that is already complete; they are never a precondition for
// producing one. Each question names a line of the delivered brief: a brownfield deferral
// first (a real gap only the user or the repository can close), then each ASSUMPTIONS line
// (a usable proposal the user may correct). STACK is never asked: `Explore first:` there
// defers to the repository's stack, which a non-programmer cannot be expected to know.
//
// Runs in the main process: the desktop renderer cannot import this module, so the engine
// derives the questions and sends them with the response.

import type { ClarificationItem, CodingBrief } from '@/types'

export const MAX_CLARIFICATIONS = 3

/** The line that closes ASSUMPTIONS (§4 row 7); an instruction, never a proposal. */
export const ASSUMPTIONS_CLOSING_LINE = 'Change any line above and run again.'

const EXPLORE_FIRST = 'Explore first:'
const PROPOSE_CHECK_FIRST = 'Propose a check first:'

function firstLine(body: string): string {
  return body.split('\n')[0].trim()
}

function bulletless(line: string): string {
  return line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim()
}

/** At most three questions about the delivered brief, deferrals before ASSUMPTIONS lines. */
export function deriveClarificationQuestions(brief: CodingBrief): ClarificationItem[] {
  const questions: ClarificationItem[] = []

  if (brief.context.startsWith(EXPLORE_FIRST)) {
    questions.push({ element: 'CONTEXT', question: firstLine(brief.context) })
  }
  if (brief.doneWhen.startsWith(PROPOSE_CHECK_FIRST)) {
    questions.push({ element: 'DONE_WHEN', question: brief.doneWhen.replace(/\s+/g, ' ').trim() })
  }
  // A valid greenfield brief carries no [TODO: (V13), so any left here is brownfield.
  for (const match of brief.scope.matchAll(/\[TODO:([^\]]*)\]/g)) {
    questions.push({ element: 'SCOPE', question: match[1].trim() })
  }

  for (const line of (brief.assumptions ?? '').split('\n')) {
    const text = bulletless(line)
    if (text !== '' && text !== ASSUMPTIONS_CLOSING_LINE) {
      questions.push({ element: 'ASSUMPTION', question: text })
    }
  }

  return questions.slice(0, MAX_CLARIFICATIONS)
}
