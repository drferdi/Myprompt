# Sentra Prompt

Status: active SAFRS capsule; R2 review required before integration or release.

## Objective

Sentra Prompt is the daily desktop workspace for prompt development, optimisation, templates, and provider-backed evaluation. It was migrated from `D:\Devops\abyss-monorepo\apps\internal\prompt` as a standalone Electron and Prisma capsule.

## Boundaries

- In scope: Electron main/preload/renderer, prompt logic, template data, Prisma schema and migrations, local tests, and desktop build artifacts.
- Out of scope: live database migration, provider calls, payment actions, real email delivery, and production packaging or deployment.
- Interfaces: optional PostgreSQL/Supabase, LLM providers, Resend, and Xendit; every external credential is operator-managed.

## Lifecycle contract

| Stage | Program | Arguments |
| --- | --- | --- |
| install | `pnpm` | `install --frozen-lockfile` |
| lint | `pnpm` | `run lint` |
| typecheck | `pnpm` | `run typecheck` |
| test | `pnpm` | `run test` |
| build | `pnpm` | `run build` |
| run | `pnpm` | `run start` |
| deployDryRun | `pnpm` | `run deploy:dry-run` |

## Local proof

`db:generate` assigns a process-local placeholder PostgreSQL URL only when neither database URL is set; it does not connect to a database. `verify:structure` enforces capsule-local boundaries. `verify:extraction` proves installation, checks, generation, build, and deploy dry-run from a fresh extracted copy.
