# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Model compiler profiles for Claude, Codex, Gemini, and Grok in the Transformer.
- Provider readiness checks and typed optimizer streaming failures.
- Electron end-to-end tests with Playwright.
- `SUPPORT.md`.

### Changed

- Test suites consolidated under `tests/` (`tests/unit`, `tests/e2e`); Playwright
  output now goes to the ignored `tests/e2e/results/` directory.
- README restored and updated to the current desktop and extension architecture.

### Removed

- Local-only governance, planning, and AI working records are no longer tracked
  in Git (`docs/spds/`, `docs/plans/`, `PROJECT_GENOME.yaml`).
- Unused `public/opening.mp3` and placeholder `src/README.md`.

## [0.1.1] - 2026-09-21

### Added

- Standard GitHub repository scaffolding (Issue/PR templates, CI/CD,
  documentation)
- Local operations, release, architecture, data, testing, contribution, and
  code-of-conduct documentation for the standalone capsule.

### Changed

- Reworked the README as the documented entry point for setup, provider
  configuration, lifecycle commands, verification, and safety boundaries.

### Deprecated

- None

### Removed

- Unreferenced legacy `migration_init.sql`; canonical Prisma history remains in
  `prisma/migrations/`.

### Fixed

- None

### Security

- None
