---
document_id: "05"
title: "Scope and Boundaries"
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
related_evidence: ["AGENTS.md", "capabilities.json"]
agent_readable: true
agent_editable: false
human_approval_required: true
classification: CORE
review_trigger: "new external interface or privilege boundary"
---

# Scope and Boundaries

## Function

Defines what belongs to the capsule and what requires separate authority.

In scope: Electron main, preload, and renderer code; prompt logic; template data;
Prisma schema and migrations; capsule-local lifecycle tooling; and documentation.

Outside routine work: real database migration or seed, provider calls, payment
callbacks, email delivery, credential rotation, and production deployment. The
renderer must not acquire direct Node.js, filesystem, database, or secret access.
