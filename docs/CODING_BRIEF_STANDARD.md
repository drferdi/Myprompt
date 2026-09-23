# Coding Brief Standard — Sentra Prompt

**Status:** v3.0 — draft. Fill by default; ask only to refine.
**Authority:** `lib/prompt-quality/contract.ts` (runtime source of truth: `validateCodingBrief`)
**Companion:** `docs/PROMPT_QUALITY_STANDARD.md` (Super Prompt format for non-coding tasks)
**Last updated:** 2026-09-23

> **What changed in v3.0 and why.** v1.0 and v2.0 both told the Optimizer to ask rather than
> invent. Applied to a new project, that rule produced briefs made of holes: `New project:
> [TODO: target directory]`, `Propose a check first:`, and a user who still had to write the
> answers themselves. A prompt tool that hands the work back is not a prompt tool.
>
> Two findings corrected the design. Anthropic's prompt generator exists to solve the blank
> page problem: the user describes a task, the tool produces a complete, editable template,
> and never interrogates the user
> (https://platform.claude.com/docs/en/docs/prompt-generator). And guides for AI app builders
> are consistent that whatever the user does not specify gets decided by the tool anyway,
> usually wrongly and invisibly. A hole does not prevent an assumption; it hides it.
>
> So v3.0 narrows the never-invent rule to where it was actually earned — paths, functions,
> commands and test names **in existing code** — and requires every other element to carry a
> concrete proposal, with the proposals listed openly under `ASSUMPTIONS`.

---

## 1. Purpose

A coding agent already knows how to write code. What it cannot know is what exists, what is
wanted, and what counts as done. A Coding Brief supplies those and makes the result provable.

Two jobs, in this order:

1. **Remove the blank page.** The user types a rough idea; the brief comes back complete and
   ready to hand to an agent. Anything the user did not say is filled with a sensible
   proposal, stated openly so it can be changed in one line.
2. **Make the result verifiable.** Every brief ends in a check that can be run and evidence
   that must be shown, so "looks done" is never the only signal.

## 2. The asymmetry that governs everything

| Situation | Rule |
| --- | --- |
| **Existing code** (paths, functions, commands, test names, APIs) | **Never invent.** A wrong path sends the agent to edit the wrong file, and the mistake is invisible. Use `Explore first:` and let the agent investigate read-only. |
| **Everything else** (a new project's directory, page list, stack, scope boundary, how to check) | **Always propose.** A wrong proposal costs the user one edited line. An empty element costs them the whole job. |

Every rule below follows from this table.

## 3. When this standard applies

| Condition | Output |
| --- | --- |
| Optimizer request with `taskType = CODING` | Coding Brief (this standard) |
| Any other `taskType` | Super Prompt (`docs/PROMPT_QUALITY_STANDARD.md`) |

Plain Markdown, usable in any coding agent, never dependent on tool-specific commands.

## 4. Elements

Eight sections, in this order, with these exact headings.

| # | Heading | Required | Content rule |
| --- | --- | --- | --- |
| 1 | `## GOAL` | Yes | One sentence: what is built or changed. |
| 2 | `## CONTEXT` | Yes | What exists. Greenfield: `New project:` plus a proposed directory. Brownfield: real paths, or `Explore first:` plus the area in the user's words. |
| 3 | `## SCOPE` | Yes | Greenfield: the pages or capabilities to build, proposed in full. Brownfield: trigger, observed behaviour, expected behaviour. |
| 4 | `## STACK` | Yes | Languages, frameworks and conventions. Whatever the user named is carried verbatim; the rest is proposed. |
| 5 | `## OUT OF SCOPE` | Yes | What must not be built or changed. Proposed when the user said nothing. |
| 6 | `## DONE WHEN` | Yes | A runnable check and its expected result, in the user's own terms. |
| 7 | `## ASSUMPTIONS` | Yes when any element was proposed rather than stated | One line per proposal, plus a closing line telling the user to change any line and re-run. |
| 8 | `## REPORT` | Yes (fixed text) | The evidence rules in §7, inserted verbatim by the Optimizer. |

There are no optional-and-omitted elements left except `ASSUMPTIONS`, which is omitted only
when the user supplied everything.

## 5. Validation rules

Deterministic; run on every brief before it leaves the Optimizer.

| ID | Rule |
| --- | --- |
| V1 | All required headings present, in §4 order, no unknown `##` headings. |
| V2 | No present section is empty. |
| V3 | `GOAL` is a single sentence of at most 40 words. |
| V4 | `CONTEXT` contains a path-like token, **or** begins with `New project:` followed by a proposed directory, **or** begins with `Explore first:` (brownfield only). |
| V5 | `SCOPE` names at least two concrete items. |
| V6 | `DONE WHEN` contains a runnable command or an observable outcome with a concrete noun from `GOAL` or `SCOPE`. |
| V7 | `DONE WHEN` is not made only of vague outcome phrases ("works", "no errors", "looks good", "berjalan dengan baik", "sesuai harapan"). |
| V8 | `REPORT` matches §7 exactly. |
| V9 | No line begins with an Optimizer settings label (`Target LLM:`, `Domain:`, `Tone:`). |
| V10 | Every technology named in the raw request appears in `STACK`. |
| V11 | **Brownfield only:** `Explore first:` and an unresolved check together mark the brief `thin` — valid, warned, because the missing facts are ones only the repository can supply. |
| V12 | Text after a placeholder marker never paraphrases the instruction ("the intended outcome", "the check", "to be determined"). |
| V13 | **No unresolved `[TODO:` in any required element of a greenfield brief.** The Optimizer proposes instead. A `[TODO:` here is a defect, not honesty. |
| V14 | `ASSUMPTIONS` is present whenever any element was proposed rather than stated by the user. |

Rules V4, V5, V6 and V7 are heuristics, scheduled for calibration with Phase 4 data.

## 6. Proposing well

| ID | Rule |
| --- | --- |
| P1 | Anything the user stated is carried verbatim and never reworded. |
| P2 | Anything the user did not state is proposed as the most ordinary choice for that kind of work, not the most sophisticated one. |
| P3 | Every proposal appears as one line under `ASSUMPTIONS`, phrased so a non-programmer can tell whether it is wrong. |
| P4 | Proposals never cover existing code. No invented path, function, command, test name or API, ever. |
| P5 | Questions (Phase 3) refine a brief that is already complete. They are never a precondition for producing one. |
| P6 | When the request is genuinely ambiguous between two ordinary readings, pick one, build the brief on it, and name the other in `ASSUMPTIONS`. |

## 7. Evidence rules (canonical REPORT text)

```markdown
## REPORT
- Read every file you reference before changing or describing it.
- If a referenced file, function, or command does not exist, stop and ask.
- Show each command you ran and its actual output.
- Do not claim a result you did not execute.
- List every file you changed and anything you left undone.
```

## 8. Examples

### 8.1 Greenfield — the case v1.0 and v2.0 both failed

Raw request: "buatkan website dokter umum, desain biru langit"

```markdown
## GOAL
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
`pnpm dev` runs and every page listed in SCOPE opens in the browser with the sky-blue theme
applied and no console errors.

## ASSUMPTIONS
- Directory ./clinic-website; change it if the project lives elsewhere.
- Next.js and Tailwind chosen as the ordinary stack for this kind of site.
- Contact by form and email, no booking system.
- Indonesian-language content, single clinic, single doctor profile.
Change any line above and run again.

## REPORT
- Read every file you reference before changing or describing it.
- If a referenced file, function, or command does not exist, stop and ask.
- Show each command you ran and its actual output.
- Do not claim a result you did not execute.
- List every file you changed and anything you left undone.
```

### 8.2 Brownfield — existing code, nothing invented

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
`pnpm run test` passes, including a new test that feeds the truncated fixture and expects a
truncation flag.

## REPORT
<canonical text from §7>
```

No `ASSUMPTIONS`: the user supplied everything.

### 8.3 Brownfield thin — valid, warned (V11)

`CONTEXT` is `Explore first: the application, area not yet specified` and the check is still
open. Returned with `warn  thin brief — add where to work and how to check it`. This is the
only case where a brief may ship incomplete, because only the repository can close the gap.

### 8.4 Invalid — what v2.0 used to produce (V13)

```markdown
## CONTEXT
New project: [TODO: target directory]

## SCOPE
Homepage with sky-blue visual design.
[TODO: What other pages should belong in scope?]

## DONE WHEN
Propose a check first: the intended outcome for verifying the website design.
```

Issues: V13 (unresolved `[TODO:` in two required elements of a greenfield brief), V12
("the intended outcome" paraphrases the instruction), V14 (no `ASSUMPTIONS`). The Optimizer
should have proposed a directory, a page list and a check, and listed all three as
assumptions.

## 9. Non-goals

- No persona or role.
- No implementation steps. The brief constrains outcome, scope, stack and evidence.
- No guarantee of correctness. It makes failure visible and cheap to detect.
- No interrogation. A brief is delivered complete; questions only refine it afterwards.
