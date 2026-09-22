# Coding Brief Standard — Sentra Prompt

**Status:** v1.0 — validator implemented
**Authority:** `lib/prompt-quality/contract.ts` (`CodingBriefSchema`, runtime source of truth)
**Companion:** `docs/PROMPT_QUALITY_STANDARD.md` (Super Prompt format for non-coding tasks)
**Last updated:** 2026-09-23

---

## 1. Purpose

There is no perfect prompt. A coding agent such as Claude Code already knows how to
write code; what it cannot know is the information that exists only in the user's
head or repository. A Coding Brief exists to do two things:

1. **Supply what the agent cannot infer:** where to work, what situation to handle,
   which existing pattern to follow, and what counts as done.
2. **Make the result verifiable:** every brief ends in a check the agent can run and
   evidence it must show, so "looks done" is never the only signal.

This design follows Anthropic's analysis of roughly 400,000 Claude Code sessions
(*Agentic coding and persistent returns to expertise*, June 2026,
https://www.anthropic.com/research/claude-code-expertise). That study found that
session success tracks three user behaviors: how precisely directions are framed,
what the user asks the agent to verify, and who corrects whom. It also found that
most of the gain comes from moving users from novice to intermediate, not from
intermediate to expert. The Coding Brief is designed to move a user across that
first step.

## 2. When this standard applies

| Condition | Output |
| --- | --- |
| Optimizer request with `taskType = CODING` | Coding Brief (this standard) |
| Any other `taskType` | Super Prompt (`docs/PROMPT_QUALITY_STANDARD.md`) |

The brief is plain Markdown. It must remain usable in any coding agent and must not
depend on tool-specific commands.

## 3. Elements

A Coding Brief has exactly seven sections, in this order, with these exact headings.

| # | Heading | Required | Content rule |
| --- | --- | --- | --- |
| 1 | `## GOAL` | Yes | One sentence stating the change. No background, no rationale. |
| 2 | `## WHERE` | Yes | Either concrete locations (paths, directories, or `@path` references), **or** an `Explore first:` line (see §5). |
| 3 | `## SCENARIO` | Yes for bug fixes; otherwise optional | The triggering condition and the observed versus expected behavior. |
| 4 | `## FOLLOW PATTERN` | Optional | An existing file, function, or convention to imitate. |
| 5 | `## OUT OF SCOPE` | Optional, recommended | Files, modules, or behaviors that must not change. |
| 6 | `## DONE WHEN` | Yes | A runnable check with an expected result, **or** a `Propose a check first:` line (see §5). |
| 7 | `## REPORT` | Yes (fixed text) | The evidence rules in §6, inserted verbatim by the Optimizer. |

Optional sections that have no content are omitted entirely, not left empty.

## 4. Validation rules

The validator is deterministic and runs on every brief before it leaves the Optimizer.
A brief that fails any rule is invalid.

| ID | Rule |
| --- | --- |
| V1 | All required headings are present, in the order defined in §3, with no unknown `##` headings. |
| V2 | No present section is empty. |
| V3 | `GOAL` is a single sentence of at most 40 words. |
| V4 | `WHERE` contains at least one path-like token (contains `/` or a file extension, optionally prefixed with `@`) **or** begins with `Explore first:`. |
| V5 | `SCENARIO` is present when `GOAL` describes a fix (contains any of: fix, bug, error, crash, fails, broken, perbaiki, benahi, galat). |
| V6 | `DONE WHEN` contains at least one backticked command or test identifier **or** begins with `Propose a check first:`. |
| V7 | `DONE WHEN` is not made only of vague outcome phrases (for example: "works", "works well", "no errors", "looks good", "berjalan dengan baik", "tidak error", "sesuai harapan"). |
| V8 | `REPORT` matches the canonical text in §6 exactly. |
| V9 | No line begins with an Optimizer settings label (for example `Target LLM:`, `Domain:`, `Tone:`). Mentioning a label inside a sentence is allowed. |

Validator output is `{ valid: boolean, issues: string[] }`, where each issue names the
rule ID. Rules V4 and V6 are heuristics and will be recalibrated using evaluation data.

Rules V4, V6, and V7 are heuristics scheduled for calibration with Phase 4 evaluation data.

## 5. Missing information and clarification

The Optimizer must never invent file paths, function names, commands, or test names.
When critical information is missing, it asks the user instead.

| ID | Rule |
| --- | --- |
| C1 | Critical elements are `WHERE`, `DONE WHEN`, and, for fixes, `SCENARIO`. Only these trigger questions. |
| C2 | Ask at most three questions per brief, in plain, non-technical language. |
| C3 | Every question offers "I don't know" and "Skip". |
| C4 | If `WHERE` is unknown, write `Explore first:` followed by the area of the product in the user's own words. The agent must investigate read-only and present a plan before editing. |
| C5 | If `DONE WHEN` is unknown, write `Propose a check first:` followed by the intended outcome. The agent must propose a runnable check and wait for approval before editing. |
| C6 | Answers are used verbatim. Specifics are never embellished. |

Example of a plain-language question for `WHERE`:

> Which part of the app has the problem? For example: login screen, payment page,
> the result panel. If you are not sure, choose "Let Claude look first."

## 6. Evidence rules (canonical REPORT text)

The `REPORT` section always contains exactly this text:

```markdown
## REPORT
- Read every file you reference before changing or describing it.
- If a referenced file, function, or command does not exist, stop and ask.
- Show each command you ran and its actual output.
- Do not claim a result you did not execute.
- List every file you changed and anything you left undone.
```

## 7. Canonical format

```markdown
## GOAL
<one sentence>

## WHERE
<paths or @references, one per line> | Explore first: <area>

## SCENARIO
<trigger, observed behavior, expected behavior>

## FOLLOW PATTERN
<existing file or convention>

## OUT OF SCOPE
<what must not change>

## DONE WHEN
<runnable check and expected result> | Propose a check first: <intended outcome>

## REPORT
<canonical text from §6>
```

## 8. Examples

### 8.1 Valid: bug fix with known location

```markdown
## GOAL
Stop the optimizer from returning truncated Super Prompts as successful results.

## WHERE
@lib/optimizer/engine.ts
@lib/llm/types.ts

## SCENARIO
A streamed result that ends mid-list ("## OUTPUT FORMAT ... -") is accepted as complete.
Expected: the truncation is detected and either continued or flagged.

## FOLLOW PATTERN
The existing length-recovery logic in `optimizePrompt` (non-streaming path).

## OUT OF SCOPE
lib/transform/**, desktop/preload.ts

## DONE WHEN
`pnpm run test` passes, including a new test that feeds the truncated fixture and expects a truncation flag.

## REPORT
- Read every file you reference before changing or describing it.
- If a referenced file, function, or command does not exist, stop and ask.
- Show each command you ran and its actual output.
- Do not claim a result you did not execute.
- List every file you changed and anything you left undone.
```

### 8.2 Valid: user does not know the location or the check

```markdown
## GOAL
Show a clear warning when a generated prompt is incomplete.

## WHERE
Explore first: the screen that displays the optimized prompt result.

## DONE WHEN
Propose a check first: an incomplete result visibly shows a warning; a complete result shows none.

## REPORT
- Read every file you reference before changing or describing it.
- If a referenced file, function, or command does not exist, stop and ask.
- Show each command you ran and its actual output.
- Do not claim a result you did not execute.
- List every file you changed and anything you left undone.
```

### 8.3 Invalid

```markdown
## GOAL
Fix the login bug. Also make the app faster for all users.

## WHERE
The login part.

## DONE WHEN
Login works well.
```

Issues: V1 (missing `REPORT`), V3 (two sentences), V4 (no path and no
`Explore first:`), V5 (fix without `SCENARIO`), V6 and V7 (no runnable check; vague outcome).

## 9. Non-goals

- The brief does not assign a persona or role. Persona text does not tell the agent
  where to work or how to prove the result.
- The brief does not prescribe implementation steps. Execution decisions belong to
  the agent; the brief constrains outcome, scope, and evidence.
- The brief does not guarantee correctness. It makes failure visible and cheap to detect.
