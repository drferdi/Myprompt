# Release procedure

## Scope

This document covers local release readiness only. It does not authorise a
production deployment, database migration, payment action, provider request, or
credential rotation.

## Readiness checklist

1. Confirm the change preserves the intended desktop behaviour and IPC boundary.
2. Run `pnpm run verify` from the capsule root.
3. Run `pnpm run verify:extraction` from the capsule root.
4. Review `.env.example` to confirm every value is empty.
5. Confirm `.env.local`, build output, and generated Prisma artifacts are ignored.
6. Obtain designated review for R2 surfaces, including Electron IPC, Prisma,
   providers, billing, and external-service contracts.

## Deploy dry-run

```bash
pnpm run deploy:dry-run
```

The dry-run checks that the Electron bootstrap and renderer artifacts exist after a
build. It has no production side effects.

## Release record

Use the pull request description and changelog to record user-visible changes,
verification evidence, known limitations, and any required operator configuration.
