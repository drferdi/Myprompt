---
document_id: "79"
title: "AI Limitations"
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
related_evidence: ["docs/PROMPT_QUALITY_STANDARD.md", "docs/data.md"]
agent_readable: true
agent_editable: false
human_approval_required: true
classification: DOMAIN
review_trigger: "new model capability or material evaluation change"
---

# AI Limitations

## Function

States limitations that operators must consider when using provider-backed output.

Provider output can be incomplete, inaccurate, inconsistent, unavailable, or
unsuitable for a particular domain. A missing key leaves the desktop shell usable
but disables provider-backed operations. Template matching and evaluations are
assistive signals, not guarantees of correctness. Operators must review outputs
before relying on them or sharing them with others.
