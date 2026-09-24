# HANDOFF

Last updated: 2026-09-25 (Claude Code, branch `integration/post-adr-0007`, claim `PROMPT-RUN-SMOKE`)

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
- `README.md` "Local proof" and `docs/data.md` now describe `db:generate` as plain `prisma generate` (Codex review
  of ADR 0007 WP-G).

## Work in flight

None recorded.

## Blockers

None recorded.

## Next action

None recorded.
