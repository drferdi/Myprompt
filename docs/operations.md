# Local operations

## Install

Install dependencies from the capsule root:

```bash
pnpm install --frozen-lockfile
```

The lockfile is part of the standalone contract. Do not use a parent workspace or
lockfile to install this project.

## Launch

```bash
pnpm run start
```

This command builds the Electron main process and renderer assets, generates the
Prisma client with a safe placeholder when required, and launches the desktop app.

For iterative desktop work, use:

```bash
pnpm run desktop:dev
```

## Configure a provider

1. Create `.env.local` in the capsule root from `.env.example`.
2. Add one provider key appropriate to the intended model operation.
3. Close and relaunch the desktop app.

Do not use `.env.example` to store working credentials. It is tracked by Git and
must retain empty values.

## Database commands

`pnpm run db:generate` is safe for build and local verification. Database
migration, seed, and deploy commands are intentionally separate because they can
change real data. Use them only in an approved environment and change procedure.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Provider missing | Verify that `.env.local` has the leading dot, is in the capsule root, and contains the key for the selected provider. Restart the app. |
| Prisma type errors | Run `pnpm run db:generate`, then `pnpm run typecheck`. |
| Electron does not start | Run `pnpm run desktop:smoke` to capture a controlled startup result. |
| Capsule boundary failure | Run `pnpm run verify:structure` and remove root-only references. |
