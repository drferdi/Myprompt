# Testing

The migrated Vitest suite covers desktop renderer behavior and prompt optimisation formatting. `pnpm run test` first runs the non-network optimizer acceptance dry-run, then runs Vitest. `pnpm run desktop:smoke` is the runtime probe for a local Electron build.

`verify:structure` checks the standalone boundary. `verify:extraction` creates a temporary copy and runs lifecycle checks from that extraction without using the SAFRS root.
