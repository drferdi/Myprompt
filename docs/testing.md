# Testing and verification

## Test levels

| Level | Command | Evidence |
| --- | --- | --- |
| Static analysis | `pnpm run lint` | ESLint compliance. |
| Type safety | `pnpm run typecheck` | TypeScript validation after Prisma generation. |
| Behavioural tests | `pnpm run test` | Optimizer acceptance dry-run and Vitest suites. |
| Desktop runtime | `pnpm run desktop:smoke` | Builds Electron and verifies controlled startup. |
| End-to-end | `pnpm run test:e2e` | Playwright drives the built Electron app (Windows). |
| Structure gate | `pnpm run verify:structure` | Confirms capsule-local files and dependency boundaries. |
| Extraction gate | `pnpm run verify:extraction` | Reinstalls and validates a fresh temporary copy. |

## Test locations

- `tests/unit/` — Vitest unit tests, grouped by area (compiler, desktop, llm, optimizer).
- `tests/e2e/` — Playwright Electron tests and their screenshot baselines.
- `tests/e2e/results/` — Playwright output; generated locally and ignored by Git.

## Recommended local gate

Run the following before opening a change for review:

```bash
pnpm run verify
pnpm run verify:extraction
```

The complete gate runs lint, type checking, test suites, an Electron smoke test,
and a deploy artifact dry-run. Tests do not require provider credentials or a live
database.

## Failure handling

Treat a failed gate as evidence, not as a reason to weaken validation. Record the
failing command, the affected surface, and whether the failure predates the change.
Do not replace behavioural tests with placeholders or use a production credential
to make a local test pass.
