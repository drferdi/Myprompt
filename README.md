# Sentra Prompt

Sentra Prompt is a standalone Electron desktop workspace for prompt development,
template-assisted authoring, optimisation, and provider-backed evaluation.

It is an active SAFRS capsule. The application can be cloned, installed, built,
tested, and run without a parent monorepo.

## Quick start

### Prerequisites

- Node.js 22 or later
- pnpm 11.21.0
- A supported desktop platform for Electron

```bash
pnpm install --frozen-lockfile
pnpm run start
```

`start` builds and launches the Electron desktop application. No database or LLM
provider is required to open the shell. Optimizer and Evaluator actions require a
configured provider credential.

## Configuration

Copy `.env.example` to `.env.local` and set only the values required for the
features being used. Never commit `.env.local`.

| Capability | Required configuration |
| --- | --- |
| OpenAI provider | `OPENAI_API_KEY` |
| Anthropic provider | `ANTHROPIC_API_KEY` |
| xAI / Grok provider | `XAI_API_KEY` |
| PostgreSQL operations | `DATABASE_URL` and `DIRECT_URL` |

See [Data and environment](docs/data.md) for the full boundary and provider
selection behaviour.

## Lifecycle commands

| Purpose | Command |
| --- | --- |
| Install dependencies | `pnpm install --frozen-lockfile` |
| Lint | `pnpm run lint` |
| Type-check | `pnpm run typecheck` |
| Run tests | `pnpm run test` |
| Build Electron | `pnpm run build` |
| Launch desktop application | `pnpm run start` |
| Run smoke test | `pnpm run desktop:smoke` |
| Validate capsule structure | `pnpm run verify:structure` |
| Validate a clean extraction | `pnpm run verify:extraction` |
| Run the complete local gate | `pnpm run verify` |
| Validate deploy artifacts only | `pnpm run deploy:dry-run` |

`db:generate` uses a process-local placeholder URL when database variables are
absent. It generates the Prisma client and never opens a database connection.

## Documentation

- [SPDS Read First](docs/spds/read_first.md)
- [Architecture](docs/architecture.md)
- [Local operations](docs/operations.md)
- [Data and environment](docs/data.md)
- [Testing and verification](docs/testing.md)
- [Release procedure](docs/release.md)
- [Prompt quality standard](docs/PROMPT_QUALITY_STANDARD.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Code of conduct](CODE_OF_CONDUCT.md)

## Safety and scope

The application contains desktop IPC, provider-key, billing, and data-access
surfaces. Do not run database migrations, payment callbacks, provider requests,
or production deployment commands as part of routine verification. Changes to
those boundaries require designated review.

## License

See [LICENSE](LICENSE).
