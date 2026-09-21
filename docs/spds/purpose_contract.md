---
document_id: "S02"
title: "Purpose Contract"
status: active
authority: Chief
owner: Chief
version: "1.0.0"
created: "2026-09-21"
last_verified: "2026-09-21"
applies_to: "."
source_of_truth: true
related_requirements: ["FR-001", "FR-002"]
related_decisions: ["ADR-0001"]
related_evidence: ["README.md", "project.contract.json"]
agent_readable: true
agent_editable: false
human_approval_required: true
classification: SENTRA
review_trigger: "change to intended product outcome"
---

# Purpose Contract

## Function

Defines the intended outcome that implementation and verification must preserve.

Sentra Prompt shall let authorised operators create, refine, organise, and evaluate
prompts in a local desktop experience. It may use configured third-party model
providers, but must remain useful as a local shell when no provider is configured.

It shall not treat provider output as authoritative business, legal, clinical, or
security advice. It is not a medical device, autonomous agent, or production
deployment control plane.
