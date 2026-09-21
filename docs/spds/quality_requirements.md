---
document_id: "15"
title: "Quality Requirements"
status: active
authority: Chief
owner: Chief
version: "1.0.0"
created: "2026-09-21"
last_verified: "2026-09-21"
applies_to: "."
source_of_truth: true
related_requirements: ["QR-001", "QR-002", "QR-003"]
related_decisions: []
related_evidence: ["docs/testing.md", "project.contract.json"]
agent_readable: true
agent_editable: false
human_approval_required: true
classification: CORE
review_trigger: "quality gate or security boundary change"
---

# Quality Requirements

## Function

Defines measurable quality expectations beyond feature behaviour.

The capsule must pass lint, TypeScript validation, behavioural tests, an Electron
smoke test, structural verification, and extraction verification. It must not
depend on a parent workspace or root lockfile. Build verification must not contact
a live database. UI design fidelity is preserved unless a product change explicitly
authorises a design revision.
