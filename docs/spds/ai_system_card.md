---
document_id: "70"
title: "AI System Card"
status: active
authority: Chief
owner: Chief
version: "1.0.0"
created: "2026-09-21"
last_verified: "2026-09-21"
applies_to: "."
source_of_truth: true
related_requirements: ["FR-002"]
related_decisions: []
related_evidence: ["lib/llm/provider-registry.ts", "docs/data.md"]
agent_readable: true
agent_editable: false
human_approval_required: true
classification: DOMAIN
review_trigger: "provider, model, or evaluation behaviour change"
---

# AI System Card

## Function

Defines the material AI role without overstating model ownership or capability.

Sentra Prompt routes operator requests to configured external or local model
providers for prompt optimisation and evaluation. The capsule does not train or
own model weights, and it does not claim vendor model performance. Provider choice,
credentials, model availability, and output quality are runtime-dependent.

The product assists an operator; it does not act autonomously or make authoritative
business, clinical, legal, or security decisions.
