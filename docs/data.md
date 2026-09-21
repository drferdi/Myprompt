# Data and environment

## Data ownership

`prisma/schema.prisma` is the source of truth for the application's PostgreSQL
data model. The capsule owns its complete migration history in
`prisma/migrations/`. The model includes users, provider-key metadata, prompts,
evaluations, templates, subscriptions, payments, usage records, feature flags,
rate limits, and email jobs.

Use Prisma commands from the capsule root only. Never edit a generated Prisma
client or migration SQL after it has been applied to a shared environment.

## Environment files

`.env.example` lists supported variable names with empty values. Copy it to
`.env.local` for local configuration. `.env.local` is ignored by Git and must not
be copied into an archive, commit, issue, or support request.

The desktop process reads `.env` and `.env.local` from the capsule root, then
allows process environment variables to supply the same keys. Restart the desktop
application after changing local environment configuration.

## Provider configuration

| Provider | Variable |
| --- | --- |
| OpenAI | `OPENAI_API_KEY` |
| Anthropic | `ANTHROPIC_API_KEY` |
| xAI / Grok | `XAI_API_KEY` |
| Mistral | `MISTRAL_API_KEY` |
| Qwen | `QWEN_API_KEY` |

Provider selection is runtime behaviour. A key being absent is not a build error;
the desktop shell opens but provider-backed Optimizer and Evaluator actions remain
unavailable until a compatible key is configured.

## Database safety

`DATABASE_URL` and `DIRECT_URL` are required only for real database operations.
For Prisma client generation, `db:generate` supplies an in-process placeholder URL
when neither variable is configured. This prevents a live database connection
during build and extraction verification.

Routine verification must not run `db:migrate`, `db:migrate:deploy`,
`db:migrate:apply`, or `db:seed`.
