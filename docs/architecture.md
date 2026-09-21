# Architecture

## Runtime boundaries

Sentra Prompt is a single, independently operable Electron capsule. Its runtime
does not import source, configuration, tooling, dependency state, or scripts from
another repository.

The application is organised into the following layers:

| Layer | Location | Responsibility |
| --- | --- | --- |
| Bootstrap | `desktop/bootstrap.ts` | Starts the Electron process. |
| Main process | `desktop/main.ts`, `desktop/ipc/` | Owns windows, local environment loading, and validated IPC handlers. |
| Preload bridge | `desktop/preload.ts` | Exposes the intentionally limited renderer API through context isolation. |
| Renderer | `desktop/renderer/` | Renders the local desktop interface and sends typed commands through the preload bridge. |
| Product logic | `lib/` | Implements prompt processing, provider routing, evaluation, templates, and service boundaries. |
| Data contracts | `types/`, `data/` | Defines shared types and capsule-owned template data. |
| Persistence | `prisma/` | Owns the PostgreSQL schema and ordered migration history. |

## External dependencies

External systems are optional integrations, not dependencies on this repository:

- PostgreSQL and Supabase for data services.
- OpenAI-compatible, Anthropic, xAI, Mistral, Qwen, or local providers for model
  operations.
- Resend for email delivery.
- Xendit for payment processing.

Credentials are loaded only at runtime from process environment or capsule-local
environment files. They are never part of the source tree or a build artifact.

## Security model

The renderer is not granted direct Node.js, filesystem, database, or provider-key
access. Privileged work remains in the main process and crosses the process
boundary through the context-isolated preload API and IPC validation layer.

Do not widen the preload API or bypass IPC validation without dedicated review.

## Portability contract

The capsule owns its manifest, lockfile, workspace declaration, verification
scripts, source, generated build configuration, and deployment dry-run. The
required lifecycle commands resolve from this directory. `verify:extraction`
copies the capsule into a fresh temporary directory and proves that contract.
