# Data and environment

The Prisma schema models users, provider-key metadata, prompts, evaluations, templates, subscriptions, payments, usage records, feature flags, rate limits, and email jobs. Its PostgreSQL datasource is declared through `DATABASE_URL` and `DIRECT_URL`.

Migration verification never invokes database migration or seed commands. Prisma client generation uses a process-local placeholder URL only if database URLs are absent. `.env.example` declares names without values; real credentials remain operator-managed.
