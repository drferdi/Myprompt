# HANDOFF

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
