# HANDOFF

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
