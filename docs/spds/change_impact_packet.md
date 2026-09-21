---
document_id: "S09"
title: "Change Impact Packet"
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
related_evidence: ["docs/testing.md", "docs/spds/risk_register.md"]
agent_readable: true
agent_editable: false
human_approval_required: true
classification: SENTRA
review_trigger: "every material change"
---

# Change Impact Packet

## Function

Guides evidence collection before a material change is integrated.

Classify the affected boundary, preserve intended desktop behaviour, identify
credential/data/provider impact, and run the relevant local gates. Changes to
renderer design require product approval. Changes to Electron IPC, Prisma, provider
routing, billing, or external contracts require R2 review. Attach commands run,
results, and known unverified conditions to the review record.
