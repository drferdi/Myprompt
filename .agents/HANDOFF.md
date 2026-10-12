# HANDOFF

## 2026-10-13 - Console opens a little larger: 96 x 24 (Claude Code)

- Gaffer asked for a slightly wider and taller UI. `desktop/main.ts`: first-run `GRID_TARGET` 80 x 20 -> 96 x 24 (about 556x367 -> 662x431 px at the 11px face); `GRID_MIN` stays 80 x 20 (Chief's floor). `WINDOW_STATE_VERSION` 7 -> 8 so the stored 80 x 20 fit is replaced once; later user resizes persist as before. e2e grid test and the screenshot baseline (`transform-controls-contained-win32.png`, now 662x431, LFS) updated.
- PASS: ESLint on touched files, `tsc --noEmit` and `tsc -p tsconfig.desktop.json --noEmit` (exit 0), Vitest 215, Playwright 5/5 (baseline regenerated and inspected).
- Note: `node --run typecheck` / `desktop:build` failed with EPERM in `prisma generate` because Gaffer's running MyPrompt held the Prisma query-engine DLL; the schema is unchanged, so the remaining build steps (tsc desktop + html/css copy) were run directly to restore `dist-electron`.
- Not yet published to Myprompt: needs the new LFS object uploaded (`git lfs push myprompt --object-id <new oid>`) before the gated push.

## 2026-10-13 - e2e baseline LFS fix on Myprompt; capsule synced with Myprompt main (Claude Code)

- Root cause of the Myprompt e2e failure: the baseline PNG reaches Myprompt from this Monorepo as a Git LFS pointer (root `.gitattributes` `*.png filter=lfs`), but Myprompt had no LFS rule. Fix: uploaded the LFS object (`git lfs push myprompt --object-id 8aef5407...`), added `.gitattributes` (`*.png` LFS) to Myprompt, fast-forwarded Myprompt `main` `93229ce5..a03820ad` via the gate (`CHIEF_PUSH_OK=1` once; range clean). e2e 5/5 on the Myprompt tree.
- Synced this capsule with Myprompt `main`: applied `git diff --binary 05f0a6d7:tools/prompt myprompt/main` (3-way, clean). Brought in #49-#54 (workspace store sharing, clarification slash guard, dependabot config, next/vitest/electron bumps), the unused-Tailwind removal, and `.gitattributes`. The capsule tree now equals Myprompt `main` except this HANDOFF. `pnpm install --frozen-lockfile` (vitest 3 -> 4, electron 44.4.4, tailwindcss removed).
- PASS / exit 0: lint, typecheck, full Vitest (19 files, 215 tests), `test:e2e` (5/5, includes desktop:build), verify-structure, Electron --smoke (temp profile).
- Not merged into Monorepo `main`, not pushed to `origin` (capsule rule). Branch: `feat/prompt-template-metaprompt`.

## 2026-10-13 - Dependabot #128 (braces) resolved on Myprompt main (Claude Code)

- `braces` <= 3.0.3 (GHSA-vfj7-8cjw-p6xm, high) has no patched release. Removed the unused `tailwindcss-animate` (dependencies) and `tailwindcss` (devDependencies) on top of `myprompt/main` in a worktree: `postcss.config.mjs` has no plugins and neither package is imported. Lockfile change is removals only (320 lines). `braces` now has no production path; it remains via `eslint-config-next` (dev lint only).
- Myprompt `main` fast-forwarded `8e29149f..93229ce5` from the Monorepo checkout (gate ran, `CHIEF_PUSH_OK=1` once, approved by Gaffer; range scanned clean). Dependabot re-scoped #128 to development and auto-dismissed it; 0 open alerts.
- PASS on the Myprompt tree after `pnpm install --frozen-lockfile`: lint, typecheck, 215 tests, desktop:build, Electron --smoke (exit 0 via PowerShell; Git Bash cannot exec the pnpm-symlinked binary, exit 127). e2e 4/5 with the committed baseline: Myprompt stores `e2e/.../transform-controls-contained-win32.png` as a raw Git LFS pointer (no LFS attributes there), so the screenshot test cannot decode it; with the real PNG from this capsule 5/5 passed. Pre-existing Myprompt issue, not fixed.
- Process note: the first local commit used `--no-verify` by mistake; it was reset (soft, unpushed) and recommitted without it.
- Open: this Monorepo capsule copy is behind Myprompt `main` (dependency removal, #49-#54 changes); syncing it is a separate, approval-gated merge.

## 2026-10-13 - Merged into Myprompt main; publish-gate incident (Claude Code)

- Myprompt `main` fast-forwarded `eb350601..8e29149f` (3 commits: Metaprompt feature, HANDOFF, Claude-first + README) on Gaffer's "merge it", with `CHIEF_PUSH_OK=1` set once after Gaffer explicitly approved opening the gate.
- Incident: the two earlier pushes of `feat/prompt-template-metaprompt` ran from a `git worktree` whose checkout was the Myprompt tree, so `core.hooksPath=.husky/_` did not resolve and the publish gate never ran. Pushed range `eb350601..8e29149f` scanned afterwards: no WhatsApp JIDs (`@s.whatsapp.net`, `@g.us`, `@c.us`, `@lid`) and no phone-number patterns. Future publishes from a worktree must run the gate explicitly (or push from the Monorepo checkout).
- Open: Dependabot alert #128 (1 high) on Myprompt `main`, pre-existing.

## 2026-10-13 - README completed, Claude-first provider order (Claude Code)

- Gaffer chose "README + Claude priority". Code: `desktop/main.ts` `getPreferredLoadedProvider` now Anthropic -> xAI -> OpenAI -> Mistral -> Qwen; `lib/llm/provider-readiness.ts` fallback now Claude -> OpenAI -> first available (test added). README: Claude-first positioning, new section 04 (Metaprompt, notebook parity table, deliberate deviations), sections renumbered 05-20, console/routing/providers/error classes/contributor map/known gaps/verification snapshot updated.
- PASS / exit 0: typecheck, ESLint on touched TS, full Vitest suite (18 files, 211 tests), `node --run test:e2e` (5 Playwright Electron tests, isolated userData, provider keys stripped), desktop:build, verify-structure, Electron --smoke (temp profile). README has no linter in this capsule; Mermaid edits not rendered.
- Uncommitted on Monorepo branch `feat/prompt-template-metaprompt`; not pushed (needs Gaffer approval). Claude model has no env override (`DEFAULT_MODEL_MAP.CLAUDE`).

## 2026-10-13 - Metaprompt (Prompt Template) implemented per Metaprompt.md (Claude Code)

- Monorepo branch `feat/prompt-template-metaprompt` (commit `f29fd12e`). Published to `myprompt` as branch `feat/prompt-template-metaprompt` (`24c81832`, cherry-picked onto `myprompt/main` because the fresh subtree split shared no history with it; 18 test files + `tsc --noEmit` passed on that tree). Not merged into Myprompt `main` (needs Gaffer approval). Source of truth: `D:/DEV/gafferverse/metaprompt/Metaprompt.md` (identical to Gaffer's Downloads copy).
- New `OutputKind` `PROMPT_TEMPLATE`. Bare console input now runs it (Gaffer's decision); `brief`/`super` stay as commands; `template [VARS] <task>` also works. Startup hint and help updated.
- Faithful to the notebook (Gaffer asked for no deviation): Metaprompt text word-for-word (`lib/optimizer/metaprompt-text.ts`); single user message, **no system prompt** (providers now omit an empty system prompt), temperature 0, max tokens 4096; no-prefill steering text verbatim; VARIABLES from a leading `[A, B]` list, normalized `strip/lstrip $/upper`, with the verbatim "must use exactly these input variables" steering; `extract_prompt` (first `<Instructions>`, empty-tag double pass) and `extract_variables` (`{...}`, sorted) ported; template keeps `{$VAR}`; console prints `Variables: / ***** / Prompt:` like the notebook while `[c] copy` copies only the template; token-limit finish (`max_tokens`/`length`) or missing `<Instructions>` fails fast with `PromptTemplateError`, shown via failure code `TEMPLATE_INCOMPLETE`.
- Approved deviations: function-calling example dropped; notebook section 2 (test-drive with example values) not built; model is the app's active provider, not `claude-sonnet-4-6`.
- Also fixed: `DesktopRecentRunInputSchema.outputKind` had a private enum, so template runs were dropped from recent runs; now `OutputKindSchema`. Rerun of a template run reruns as `template`.
- PASS / exit 0: `node --run typecheck`, ESLint on touched files, `vitest run __tests__/optimizer __tests__/desktop __tests__/llm` (17 files, 203 tests), `node --run desktop:build`, `scripts/verify-structure.mjs`, Electron `--smoke` (temporary profile). The one live Claude run by Gaffer predates the doc-alignment changes; the current build has not been exercised against a provider.
- Risks: temperature 0 is rejected by some newer models (notebook warns about claude-sonnet-5); a task that itself starts with `[...] ` is read as a variable list; streaming path cannot see the finish reason, so a cut-off stream is caught only by the missing `</Instructions>`; non-Claude quality unverified; run header still shows the console lane though the route always uses DEEP scope.
- Next: Gaffer decides on merging Myprompt `feat/prompt-template-metaprompt` into `main` (PR). Monorepo branch is local only (never push it to `origin`).

## 2026-10-11 - Tool contract and lifecycle alignment (Codex)

- Files: `project.contract.json` ID now `tools/prompt`; `AGENTS.md`/`README.md` describe tools discovery and the actual smoke run contract; `package.json` chains local Node scripts, uses local tsc, and propagates Electron smoke failure; renderer HTML has CSP with the exact CommonJS bootstrap hash; added desktop CSP regression test.
- PASS / exit 0: Prisma generation + typecheck, ESLint, full 191 existing tests and one added CSP test, build, isolated-profile Electron smoke, deployment dry-run, root tools structural checker and contract discovery. Test harness path/regex compatibility issues were corrected before final checks.
- Remaining risks: fresh extraction/install not executed; root Biome exclusion awaits old-claim takeover decision. Root governance/combined-checkout handoff failed on ownership and another project's missing handoff, so no global PASS claim. No provider inference, database migration, commit or publication.
- Next: resolve root ownership/configuration, then review and run extraction within explicitly authorized install/network scope.

## 2026-10-11 - Relocated to tools/prompt (Codex)

- Moved the complete capsule from `projects/internal/prompt` to `tools/prompt` on Gaffer's order. Updated `AGENTS.md` and `README.md` subtree prefix; retained the repository identity, manifests, lockfile, source, and local state.
- The Desktop shortcut retains its launcher; `C:/Users/drfer/Documents/script/Run-Sentra-Prompt.bat` now points at this directory. Generated dependency shims and virtual-store metadata were updated; all 2,603 links are valid and local.
- PASS (exit 0): structural verification, direct local TypeScript typecheck, desktop compilation, pretest dry-run, 61 desktop tests, Electron `--smoke` with a temporary user-data profile, deploy dry-run, diff check. No provider inference or database migration.
- Initial script-based typecheck failed (exit 1): pnpm attempted an automatic reinstall because relocated virtual-store metadata was stale. Stopped that route, repaired generated metadata, and verified directly with existing local executables; the script was not rerun.
- Remaining risks: fresh extraction/install and full lifecycle build not verified; root doctor and governance remain blocked by service readiness and task ownership. The existing external launcher force-stops Electron processes, so interactive shortcut launch was not used for verification. Next: address those existing gates before publishing. No commit or push.

Last updated: 2026-09-25 (Claude Code, branch `integration/post-adr-0007-2`, claim `PROMPT-README-CI`)

Overwrite this file at the end of every capsule-scoped session; never append. Durable decisions go
to `DECISIONS.md`.

## Current state

- This `.agents/` folder was created by ADR 0007 WP-G on 2026-09-25. No capsule-scoped session
  has been recorded here yet.
- ADR 0007 WP-B (merged 2026-09-25): `project.contract.json` passes the validator and
  `db:generate` is plain `prisma generate`. The pnpm link problem in `project-standalone verify`
  was fixed by ADR 0007 WP-C.
- `project.contract.json` `run` is now `pnpm exec electron ./dist-electron/desktop/bootstrap.js
  --smoke`: the built app starts with a hidden window and exits 0 after the renderer loads
  (`desktop/main.ts`, `isSmokeMode`). The old `pnpm run start` rebuilt and opened the app and
  never exited, so `run` timed out. `node tools/project-standalone/src/cli.mjs verify
  internal/prompt` passed every stage on Windows on 2026-09-25 (install through run, cleanup).
- `README.md` is the MyPrompt comprehensive README (19 sections; written by another agent on
  2026-09-24 from the "Myprompt — Bahan README" dossier), committed on Chief's order
  ("selesaikan sekalian", 2026-09-25) after removing a stale insertion note. It replaces the
  short README, including its "Local proof" section.
- `.github/` (Copilot instructions and a Windows CI workflow for the drferdi/Myprompt repository)
  is committed. The workflow uses Node 22 while the contract pins 24.18.0, and its actions are
  tag-pinned (`@v4`), not SHA-pinned.
- `.gitignore` now ignores `docs/plans/`, `droid-wiki/`, and `extension/` (local working
  material that never enters the capsule history). One older plan under `docs/plans/` stays
  tracked.
- Superseded: `README.md` "Local proof" and `docs/data.md` now describe `db:generate` as plain `prisma generate` (Codex review
  of ADR 0007 WP-G).

## Work in flight

None recorded.

## Blockers

None recorded.

## Next action

None recorded.
