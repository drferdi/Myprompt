---
document_id: "S07"
title: "Decision Provenance"
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
related_evidence: ["AGENTS.md", "PROJECT_GENOME.yaml"]
agent_readable: true
agent_editable: false
human_approval_required: true
classification: SENTRA
review_trigger: "decision is accepted, revised, or superseded"
---

# Decision Provenance

## Function

Records why durable project decisions were made and where their authority resides.

ADR-0001 derives from the requirement that Prompt remain portable outside a parent
monorepo. The Chief is the authority for this decision. Structural and extraction
verification provide implementation evidence, but do not replace human authority
to change the decision.
