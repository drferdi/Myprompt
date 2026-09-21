# Contributing to Sentra Prompt

Thank you for contributing to Sentra Prompt. This project is a standalone
Electron capsule with desktop IPC, provider, persistence, billing, and data
boundaries. Keep each change focused, documented, and verifiable.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of
Conduct.

## How to Contribute

### Reporting Bugs

- Ensure the bug was not already reported by searching on GitHub under Issues.
- Include the observed behaviour, expected behaviour, reproduction steps, and
  non-sensitive environment details.
- Do not include API keys, database URLs, payment data, or `.env.local` content.

### Suggesting Enhancements

- Open a new issue using the **Feature request** template.
- Provide as much detail as possible about the feature and the motivation behind
  it.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. Keep source, dependency, and documentation changes in the smallest practical
   reviewable scope.
3. Add behavioural tests for changed logic and update documentation for changed
   workflows or configuration.
4. Run `pnpm run verify` and `pnpm run verify:extraction` from the capsule root.
5. State test evidence and any known limitations in the pull request.
6. Request designated review for Electron IPC, Prisma, provider, billing, or
   external-service boundary changes.

## Coding Standards

- We use `pnpm` as our package manager.
- Follow the formatting rules enforced by `pnpm run lint` and `.editorconfig`.
- Keep credentials in ignored local environment files, never in source or docs.
- Do not introduce a dependency on a parent monorepo or another capsule.
- Write clear, imperative commit messages.

Thank you!
