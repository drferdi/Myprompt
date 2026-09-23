# Architecture

The desktop process is composed from `desktop/bootstrap.ts`, `desktop/main.ts`, and a context-isolated preload bridge. The renderer is local static content under `desktop/renderer/`. Product logic is capsule-local under `lib/`; reusable templates are in `data/`; shared types are in `types/`.

Prisma uses PostgreSQL and remains fully capsule-owned under `prisma/`, including its migration history. No source import, dependency, build path, or verification script may resolve outside this capsule.
