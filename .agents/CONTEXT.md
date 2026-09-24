# CONTEXT

- Purpose: MyPrompt, the daily desktop workspace for prompt development, optimisation, templates,
  and provider-backed evaluation, run as a standalone Electron and Prisma capsule (`README.md`).
- Repository: https://github.com/drferdi/Myprompt, published through the `myprompt` remote; never
  published to the Monorepo (`AGENTS.md` "Repository identity").
- Human owner: Chief. Default risk: R2 (desktop IPC, provider keys, user data, and payment
  integrations).
- Stack: Node.js 24.18.0 and pnpm 11.21.0; smoke is `none` because the contract schema has no
  desktop probe (`project.contract.json`).
- Contract and commands: `project.contract.json`; the stage table is in `AGENTS.md` "Standalone
  contract". Commands run from the capsule root.
- Protected areas: provider, database, Supabase, Resend, and Xendit values stay outside the
  repository; do not run `db:migrate`, `db:migrate:deploy`, `db:migrate:apply`, `db:seed`, payment
  callbacks, or provider requests during verification; keep context isolation and IPC validation.

This folder is tracked and publishes with the capsule. Treat it as public: no secrets,
credentials, tokens, phone numbers, messaging identifiers, personal data, or database dumps.
Name environment variables, never their values.
