# Coding Brief Standard — Sentra Prompt

**Status:** v2.0 — draft. Greenfield and brownfield work share one element set.
**Authority:** `lib/prompt-quality/contract.ts` (runtime source of truth: `validateCodingBrief`; re-exports `CodingBriefSchema` from `types/index.ts` and `CODING_BRIEF_REPORT_TEXT` from `lib/optimizer/coding-brief-format.ts`)
**Companion:** `docs/PROMPT_QUALITY_STANDARD.md` (Super Prompt format for non-coding tasks)
**Last updated:** 2026-09-23

> **What changed in v2.0 and why.** v1.0 assumed every coding task happens inside an
> existing repository: `WHERE` asked which files, `SCENARIO` asked which bug. A request to
> build something new therefore produced an empty brief — both fallbacks fired at once and
> the user's stated stack ("React and Next.js") had nowhere to live. A prompt tool must not
> require a repository. v2.0 replaces `WHERE` with `CONTEXT`, `SCENARIO` with `SCOPE`, and
> adds `STACK`, so the same seven elements serve new projects and existing code alike.
> Migration: v1.0 briefs remain readable; the validator accepts the v1.0 headings for one
> release and reports them as deprecated.

---

## 1. Purpose

There is no perfect prompt. A coding agent already knows how to write code; what it cannot
know is the information that exists only in the user's head or repository. A Coding Brief
does two things:

1. **Supply what the agent cannot infer:** what exists already, what is in and out of
   scope, which technology to use, and what counts as done.
2. **Make the result verifiable:** every brief ends in a check the agent can run and
   evidence it must show, so "looks done" is never the only signal.

This design follows Anthropic's analysis of roughly 400,000 Claude Code sessions
(*Agentic coding and persistent returns to expertise*, June 2026,
https://www.anthropic.com/research/claude-code-expertise): session success tracks how
precisely directions are framed, what the user asks the agent to verify, and who corrects
whom. Most of the gain comes from moving a user from novice to intermediate. The brief is
built to carry a user across that first step.

## 2. When this standard applies

| Condition | Output |
| --- | --- |
| Optimizer request with `taskType = CODING` | Coding Brief (this standard) |
| Any other `taskType` | Super Prompt (`docs/PROMPT_QUALITY_STANDARD.md`) |

The brief is plain Markdown, usable in any coding agent, and never depends on
tool-specific commands.

## 3. Two situations, one element set

| Situation | Marker | Typical `CONTEXT` |
| --- | --- | --- |
| **Greenfield** — nothing exists yet | `CONTEXT` begins with `New project:` | "New project: nothing exists yet." |
| **Brownfield** — work inside existing code | `CONTEXT` names paths or an `Explore first:` line | `@lib/optimizer/engine.ts` |

The elements do not change between the two. Only what fills them changes.

## 4. Elements

Seven sections, in this order, with these exact headings.

| # | Heading | Required | Content rule |
| --- | --- | --- | --- |
| 1 | `## GOAL` | Yes | One sentence: what is built or changed. No background, no rationale. |
| 2 | `## CONTEXT` | Yes | What already exists. Greenfield: `New project:` plus the target directory if known. Brownfield: paths, or `Explore first:` plus the area in the user's own words. |
| 3 | `## SCOPE` | Yes | What the work covers. Greenfield: the pages, screens, or capabilities to build. Brownfield: the triggering condition, observed versus expected behaviour. |
| 4 | `## STACK` | Yes when the user named any technology; otherwise optional | Languages, frameworks, libraries, versions, and conventions the user specified, plus an existing file to imitate when there is one. Never invent a stack the user did not name. |
| 5 | `## OUT OF SCOPE` | Optional, recommended | What must not be built or changed. |
| 6 | `## DONE WHEN` | Yes | A runnable check with an expected result, or a `Propose a check first:` line (§6). |
| 7 | `## REPORT` | Yes (fixed text) | The evidence rules in §7, inserted verbatim by the Optimizer. |

Optional sections with no content are omitted entirely, never left empty.

## 5. Validation rules

Deterministic, run on every brief before it leaves the Optimizer. A brief failing any rule
is invalid.

| ID | Rule |
| --- | --- |
| V1 | All required headings present, in the §4 order, with no unknown `##` headings. |
| V2 | No present section is empty. |
| V3 | `GOAL` is a single sentence of at most 40 words. |
| V4 | `CONTEXT` contains a path-like token, **or** begins with `New project:`, **or** begins with `Explore first:`. |
| V5 | `SCOPE` names at least two concrete items (pages, capabilities, or an observed/expected pair). A single vague noun phrase fails. |
| V6 | `DONE WHEN` contains at least one backticked command or test identifier, **or** begins with `Propose a check first:`. |
| V7 | `DONE WHEN` is not made only of vague outcome phrases ("works", "works well", "no errors", "looks good", "berjalan dengan baik", "tidak error", "sesuai harapan"). |
| V8 | `REPORT` matches the canonical text in §7 exactly. |
| V9 | No line begins with an Optimizer settings label (`Target LLM:`, `Domain:`, `Tone:`). Mentioning a label inside a sentence is allowed. |
| V10 | Every technology named in the raw request appears in `STACK`. A named stack is never silently dropped. |
| V11 | A brief in which both `Explore first:` and `Propose a check first:` fire is flagged `thin`: valid, but returned with a warning telling the user which two answers would make it useful. |

Validator output is `{ valid, issues[], thin, deprecated[] }`; `deprecated` lists any v1.0
headings that were accepted and mapped. Rules V4, V5, V6 and V7 are heuristics,
scheduled for calibration with Phase 4 evaluation data.

## 6. Missing information and clarification

The Optimizer never invents file paths, function names, commands, test names, or
technologies. When critical information is missing, it asks.

| ID | Rule |
| --- | --- |
| C1 | Critical elements are `CONTEXT`, `SCOPE` and `DONE WHEN`. Only these trigger questions. |
| C2 | At most three questions per brief, in plain, non-technical language. |
| C3 | Every question offers "I don't know" and "Skip". |
| C4 | `CONTEXT` unknown: greenfield writes `New project:` with `[TODO: target directory]`; brownfield writes `Explore first:` and the agent investigates read-only, then presents a plan before editing. |
| C5 | `DONE WHEN` unknown: write `Propose a check first:` and the intended outcome. The agent proposes a runnable check and waits for approval before editing. |
| C6 | Answers are used verbatim. Specifics are never embellished. |
| C7 | A `thin` brief (V11) is never presented as complete. The warning names the two missing answers. |

## 7. Evidence rules (canonical REPORT text)

```markdown
## REPORT
- Read every file you reference before changing or describing it.
- If a referenced file, function, or command does not exist, stop and ask.
- Show each command you ran and its actual output.
- Do not claim a result you did not execute.
- List every file you changed and anything you left undone.
```

## 8. Canonical format

```markdown
## GOAL
<one sentence>

## CONTEXT
New project: <target directory> | <paths, one per line> | Explore first: <area>

## SCOPE
<pages or capabilities> | <trigger, observed behaviour, expected behaviour>

## STACK
<languages, frameworks, versions, conventions the user named>

## OUT OF SCOPE
<what must not be built or changed>

## DONE WHEN
<runnable check and expected result> | Propose a check first: <intended outcome>

## REPORT
<canonical text from §7>
```

## 9. Examples

### 9.1 Greenfield — the case v1.0 could not express

Raw request: "buatkan website dokter umum pakai React dan Next.js"

```markdown
## GOAL
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
`pnpm dev` runs and every page listed in SCOPE renders without console errors.

## REPORT
- Read every file you reference before changing or describing it.
- If a referenced file, function, or command does not exist, stop and ask.
- Show each command you ran and its actual output.
- Do not claim a result you did not execute.
- List every file you changed and anything you left undone.
```

### 9.2 Brownfield — a fix in existing code

```markdown
## GOAL
Stop the optimizer from returning truncated prompts as successful results.

## CONTEXT
@lib/optimizer/engine.ts
@lib/llm/types.ts

## SCOPE
A streamed result ending mid-list is accepted as complete.
Expected: the truncation is detected and either continued or flagged.

## STACK
TypeScript, Vitest. Follow the length-recovery logic in `optimizePrompt`.

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

### 9.3 Thin — valid but warned (V11)

```markdown
## GOAL
Make the application faster.

## CONTEXT
Explore first: the application, area not yet specified.

## SCOPE
[TODO: which screens or operations feel slow?]

## DONE WHEN
Propose a check first: the slow operation completes noticeably faster.

## REPORT
<canonical text>
```

Returned with: `warn  thin brief — add where to work and how to check it`. The wording is
generic on purpose: for this example the two answers are where it is slow and how to
measure it, but the warning must read correctly for every thin brief.

### 9.4 Invalid

```markdown
## GOAL
Fix the login bug. Also make the app faster for all users.

## CONTEXT
The login part.

## DONE WHEN
Login works well.
```

Issues: V1 (missing `SCOPE` and `REPORT`), V3 (two sentences), V4 (no path, no
`New project:`, no `Explore first:`), V6 and V7 (no runnable check, vague outcome).

## 10. Non-goals

- No persona or role. Persona text does not say what to build or how to prove it.
- No implementation steps. Execution decisions belong to the agent; the brief constrains
  outcome, scope, stack and evidence.
- No guarantee of correctness. The brief makes failure visible and cheap to detect.
