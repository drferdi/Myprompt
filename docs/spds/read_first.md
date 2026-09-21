---
document_id: "01"
title: "Read First"
status: active
authority: Chief
owner: Chief
version: "1.0.0"
created: "2026-09-21"
last_verified: "2026-09-21"
applies_to: "."
source_of_truth: true
related_requirements: []
related_decisions: ["ADR-0001"]
related_evidence: ["project.contract.json", "docs/testing.md"]
agent_readable: true
agent_editable: false
human_approval_required: true
classification: CORE
review_trigger: "material change to purpose, architecture, runtime, or evidence"
---

# Read First

## Function

Directs humans and agents to the authoritative project record before work starts.

Sentra Prompt is an R2 standalone Electron capsule. Read `PROJECT_GENOME.yaml`,
then [Purpose Contract](purpose_contract.md), [Authority and Decision Rights](authority_and_decision_rights.md), and the applicable operational guide before changing code or configuration.

Never read, commit, or transmit `.env.local`. Routine verification may generate a
Prisma client with a placeholder URL, but may not run database migrations, provider
requests, payment actions, or production deployment.
