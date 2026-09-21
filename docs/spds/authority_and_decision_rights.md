---
document_id: "07"
title: "Authority and Decision Rights"
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
related_evidence: ["AGENTS.md"]
agent_readable: true
agent_editable: false
human_approval_required: true
classification: CORE
review_trigger: "authority or risk change"
---

# Authority and Decision Rights

## Function

Separates human decisions from delegated engineering execution.

Chief alone authorises product purpose, scope expansion, production deployment,
credential use, live database mutation, payment actions, and material architecture
changes. Engineers and agents may perform reversible capsule-local work, execute
documented verification, and prepare review evidence.

R2 changes affecting Electron IPC, Prisma, providers, billing, or external-service
contracts require designated review before integration.
