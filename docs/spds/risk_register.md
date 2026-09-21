---
document_id: "51"
title: "Risk Register"
status: active
authority: Chief
owner: Chief
version: "1.0.0"
created: "2026-09-21"
last_verified: "2026-09-21"
applies_to: "."
source_of_truth: true
related_requirements: ["QR-002", "QR-003"]
related_decisions: ["ADR-0001"]
related_evidence: ["AGENTS.md", "SECURITY.md"]
agent_readable: true
agent_editable: false
human_approval_required: true
classification: CORE
review_trigger: "new risk, incident, or external interface"
---

# Risk Register

## Function

Preserves material risks and their required controls.

| Risk | Control | Residual status |
| --- | --- | --- |
| Credential exposure | Empty tracked template, ignored `.env.local`, no secret logging | Requires operator discipline |
| Privileged renderer access | Context isolation and validated preload/IPC boundary | R2 review required for changes |
| Live database mutation | Separate migration commands; verification uses placeholder URL | Not authorised by routine work |
| Provider output misuse | Human operator remains accountable; limitations are documented | Provider-dependent |
| Supply-chain drift | Pinned pnpm lockfile and frozen installation | Requires dependency review |
