---
document_id: "S10"
title: "Context Handoff Packet"
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
related_evidence: ["docs/spds/current_state_snapshot.md"]
agent_readable: true
agent_editable: false
human_approval_required: true
classification: SENTRA
review_trigger: "session or ownership handoff"
---

# Context Handoff Packet

## Function

Provides the minimum durable state for a succeeding maintainer or agent.

Start with `read_first.md`, confirm the active Git branch and working-tree state,
then run the smallest relevant verification command. Preserve the standalone
contract and never recover credentials from Git history or environment files.
Escalate R2 boundary changes for review; do not treat documentation as authority
for a production action.
