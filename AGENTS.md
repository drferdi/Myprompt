# Sentra Prompt Capsule Router

## Objective and ownership

- Project: Sentra Prompt (domain: internal)
- Objective: run the migrated desktop prompt-engineering workspace independently of the SAFRS root.
- Human owner: Chief
- Default risk: R2 because this capsule handles desktop IPC, provider keys, user data, and payment integrations.

## Repository identity (read this before any git, wiki, or publishing action)

- This project's repository is **https://github.com/drferdi/Myprompt**. The product brand is **MyPrompt**.
- This folder may live inside `D:\DEV\Monorepo` (remote `origin` = drferdi/Monorepo-safrs). That Monorepo is Chief's working tree, not this project's repository. `git rev-parse --show-toplevel` and `git remote get-url origin` therefore answer for the Monorepo; treat those answers as wrong for this project.
- Never publish anything about this project to the Monorepo: no wiki pages, no pull requests, no pushes of this folder's content to `origin`. The Monorepo pre-push hook blocks such pushes; do not work around it.
- Publishing goes to the `myprompt` remote (`git@github.com:drferdi/Myprompt.git`): `git subtree split --prefix=projects/internal/prompt`, push the split branch, then merge it into Myprompt `main`. Verify the remote first with `git remote get-url myprompt`.
- The wiki for this project is https://github.com/drferdi/Myprompt/wiki, never https://github.com/drferdi/Monorepo-safrs/wiki.
- `package.json` carries the same identity in its `repository`, `homepage`, and `bugs` fields; tools that read the manifest must use those, not the enclosing git remote.

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
