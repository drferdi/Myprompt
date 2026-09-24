# Copilot instructions for MyPrompt

## Project shape

MyPrompt is a Windows-oriented Electron desktop application. The renderer is
static local content in `desktop/renderer/`; the Electron main process is
assembled from `desktop/bootstrap.ts`, `desktop/main.ts`, and
`desktop/preload.ts`. Product logic lives in `lib/`, reusable prompt templates
in `data/`, shared types in `types/`, and the desktop build emits to
`dist-electron/`.

The main-process flow is:

```text
renderer -> context-isolated preload bridge -> validated Electron IPC
         -> optimizer / transform / evaluator / provider services
         -> local workspace JSON and, for account features, Prisma/PostgreSQL
```

The optimizer produces Coding Briefs or Super Prompts, while
`lib/transform/` builds deterministic model-specific scaffolds without an LLM
call. `lib/llm/` owns provider registration and adapters. Account-backed
features (auth, quotas, library, subscriptions, encrypted provider keys, and
usage) stay in the main process and use Prisma; guest work is local-first in
Electron `userData`.

## Commands

Use Node.js 22+ and the pinned `pnpm@11.21.0`. The desktop build scripts
currently require Windows PowerShell.

```powershell
pnpm install --frozen-lockfile

pnpm start                 # build and launch the Electron development app
pnpm build                 # compile the desktop app to dist-electron/
pnpm lint
pnpm typecheck
pnpm test                  # optimizer dry-run pretest plus all Vitest tests
pnpm test:desktop          # only __tests__/desktop
pnpm test:e2e              # build, then run Playwright Electron tests
pnpm desktop:smoke         # build and launch the Electron smoke probe
pnpm verify                # structure, lint, typecheck, tests, build, smoke, dry-run
pnpm verify:structure      # standalone-capsule boundary checks
pnpm verify:extraction     # verify an extracted copy independently
pnpm deploy:dry-run
```

Run one unit test file or test case with Vitest:

```powershell
pnpm exec vitest run __tests__/optimizer/clarification.test.ts
pnpm exec vitest run __tests__/optimizer/clarification.test.ts -t "case name"
```

Run one Playwright spec or test title with:

```powershell
pnpm exec playwright test e2e/transform.e2e.spec.ts
pnpm exec playwright test e2e/transform.e2e.spec.ts -g "test title"
```

`vitest.config.ts` discovers only `__tests__/**/*.test.ts` in a jsdom
environment. Playwright is configured for `e2e/`, with one worker and a
30-second timeout. `pnpm test` intentionally runs the optimizer acceptance
dry-run first.

## Development conventions

- Treat `project.contract.json` and `AGENTS.md` as the standalone-capsule
  contract. Work only from this capsule's manifests, lockfile, source,
  migrations, generated output, scripts, and tests; do not add imports or build
  paths that reach a containing monorepo.
- Keep the renderer unprivileged: preserve `contextIsolation: true`,
  `nodeIntegration: false`, and the narrow `window.sentraDesktop` preload API.
  Route new renderer capabilities through explicit IPC handlers rather than
  exposing Node.js or importing `lib/` into renderer code.
- Validate IPC and persisted workspace payloads with the existing Zod schemas.
  Keep account, quota, provider-key, subscription, and payment checks in the
  main process. Provider keys must remain encrypted and must never be logged
  or returned to the renderer.
- Workspace persistence is local-first. Writes use the existing temporary-file
  rename and serialized-store patterns; preserve schema validation and the
  `userData` file locations when changing workspace state.
- When changing prompt behavior, read
  `docs/CODING_BRIEF_STANDARD.md` and `lib/prompt-quality/contract.ts` first.
  The executable validator is authoritative when prose and runtime behavior
  differ. Check optimizer routing and transform profile behavior in their
  respective `lib/optimizer/` and `lib/transform/` modules.
- Keep provider integrations behind `lib/llm/` adapters and the provider
  registry. `transform` is deliberately deterministic and should not acquire
  an LLM dependency.
- Keep tests in the existing `__tests__/` and `e2e/` discovery locations.
  Renderer tests use jsdom; Electron behavior belongs in desktop tests or the
  Playwright suite.
- Do not run live migrations, seed data, payment callbacks, provider requests,
  or real email delivery as part of normal verification. Use
  `pnpm db:generate` when Prisma types need regeneration; database migration
  commands are operational commands, not routine test setup.
- Never read, commit, or publish `.env`/`.env.local` or credentials. The
  project's repository is `drferdi/Myprompt`; do not publish capsule changes to
  an enclosing monorepo remote.

## Authoritative files

| Concern | File or directory |
| --- | --- |
| Package identity and scripts | `package.json` |
| Standalone lifecycle contract | `project.contract.json` |
| Desktop process and IPC | `desktop/` |
| Prompt optimizer and quality rules | `lib/optimizer/`, `lib/prompt-quality/` |
| Deterministic transforms | `lib/transform/` |
| Provider adapters | `lib/llm/` |
| Data model and migrations | `prisma/schema.prisma`, `prisma/migrations/` |
| Acceptance and boundary checks | `scripts/optimizer-acceptance.ts`, `scripts/verify-structure.mjs`, `scripts/verify-extraction.mjs` |
| Architecture and testing notes | `docs/architecture.md`, `docs/testing.md` |
