---
document_id: "02"
title: "Project Charter"
status: active
authority: Chief
owner: Chief
version: "1.0.0"
created: "2026-09-21"
last_verified: "2026-09-21"
applies_to: "."
source_of_truth: true
related_requirements: ["FR-001", "QR-001"]
related_decisions: ["ADR-0001"]
related_evidence: ["project.contract.json"]
agent_readable: true
agent_editable: false
human_approval_required: true
classification: CORE
review_trigger: "change to product ownership, scope, or risk"
---

# Project Charter

## Function

Authorises the capsule's purpose, ownership, and operating boundary.

Chief owns Sentra Prompt. The product provides a daily desktop workspace for
prompt creation, template use, optimisation, and evaluation. Its current risk is
R2 because it combines Electron IPC, provider credentials, user data, billing, and
database interfaces. The capsule is independently installable and executable.

No documentation claim authorises production deployment, live data mutation, or
external financial action.
