# Sentra Prompt Capsule Router

## Objective and ownership

- Project: Sentra Prompt (domain: internal)
- Objective: run the migrated desktop prompt-engineering workspace independently of the SAFRS root.
- Human owner: Chief
- Default risk: R2 because this capsule handles desktop IPC, provider keys, user data, and payment integrations.

## Required context

Before substantial work, read `docs/spds/read_first.md` when it is present on the
local machine (it is a local-only record and is not tracked in Git), then use the linked
authority, architecture, risk, and verification records relevant to the task.

## Standalone contract

All lifecycle commands execute from this directory and use only capsule-owned manifests, lockfile, source, Prisma schema, generated output, scripts, and tests.

| Stage | Program | Arguments |
| --- | --- | --- |
| install | `pnpm` | `install --frozen-lockfile` |
| lint | `pnpm` | `run lint` |
| typecheck | `pnpm` | `run typecheck` |
| test | `pnpm` | `run test` |
| build | `pnpm` | `run build` |
| run | `pnpm` | `run start` |
| deployDryRun | `pnpm` | `run deploy:dry-run` |

## Boundaries

- Provider, database, Supabase, Resend, and Xendit values remain outside the repository. Never read or commit `.env`.
- Do not execute `db:migrate`, `db:migrate:deploy`, `db:migrate:apply`, `db:seed`, payment callbacks, or provider requests during migration verification.
- Electron is recorded as R2 in `capabilities.json`; its root selector cannot address the required nested SAFRS capsule path, so this capsule-local record mirrors the reviewed manifest.
- Retain context isolation and IPC validation; do not widen the preload API during migration.
