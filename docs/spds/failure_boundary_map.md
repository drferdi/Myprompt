---
document_id: "S11"
title: "Failure Boundary Map"
status: active
authority: Chief
owner: Chief
version: "1.0.0"
created: "2026-09-21"
last_verified: "2026-09-21"
applies_to: "."
source_of_truth: true
related_requirements: []
related_decisions: []
related_evidence: ["docs/operations.md", "docs/testing.md"]
agent_readable: true
agent_editable: false
human_approval_required: true
classification: SENTRA
review_trigger: "new failure mode or integration"
---

# Failure Boundary Map

## Function

Defines where common failures stop and who must resolve them.

| Boundary | Failure | Owner/action |
| --- | --- | --- |
| Local configuration | Provider missing | Operator configures ignored `.env.local`, then restarts. |
| Build | Prisma client stale | Run `pnpm run db:generate`; do not run migrations. |
| Capsule contract | Structure/extraction failure | Engineer removes hidden root dependencies. |
| External systems | Provider, database, payment failure | Operator and designated reviewer assess credentials, service status, and authority. |
