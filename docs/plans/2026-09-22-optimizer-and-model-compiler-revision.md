# Sentra Prompt — Optimizer Diagnostics and Model Compiler Revision

**Status:** COMPLETED  
**Date:** 2026-09-22  
**Capsule:** `projects/internal/prompt`  
**Risk:** R2 — Electron IPC error contract changes; no provider credentials, API calls, database mutations, or new provider integration.

## Objective

Make Optimizer failures actionable without disclosing sensitive provider data, replace Fable/Mythos transform profiles with prompt-only compiler profiles for Claude, Codex, Gemini, and Grok, and prevent renderer text overflow.

## Tasks

1. Add a typed, safe optimizer failure contract and test provider-stream failure classification before changing IPC or renderer behavior.
2. Replace the compiler profile schema, controls, and compiler modules. Preserve legacy output when no profile is selected. Use XML structure for Claude, issue-style execution contracts for Codex, context-first structured instructions for Gemini, and evidence/uncertainty boundaries for Grok. Escape all XML task content.
3. Add responsive overflow guards and automated desktop UI coverage, including a real Electron E2E runner that exercises Transform without a provider request.
4. Run project-local Gate S, unit tests, lint, typecheck, build, Electron E2E/smoke, deploy dry-run, and Gate E. Review the resulting diff before reporting completion.

## Acceptance criteria

- IPC emits only safe `code`, `stage`, `retryable`, and public message fields.
- Renderer uses the canonical `stage` field.
- The only selectable compiler profiles are Claude, Codex, Gemini, and Grok.
- Transform is deterministic, provider-neutral, and has no Fable/Mythos option.
- Long output remains contained in standard and mini consoles.
- E2E exercises the built desktop Transform path without a live provider.

## Verification evidence

- `pnpm run verify:structure` passed.
- `pnpm run test` passed with 33 tests.
- `pnpm run test:e2e` passed with 3 Electron scenarios.
- `pnpm run verify` passed, including lint, typecheck, build, desktop smoke, and deploy dry-run.
- `pnpm run verify:extraction` passed from an isolated extracted capsule.
