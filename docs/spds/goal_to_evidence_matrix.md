---
document_id: "S06"
title: "Goal to Evidence Matrix"
status: active
authority: Chief
owner: Chief
version: "1.0.0"
created: "2026-09-21"
last_verified: "2026-09-21"
applies_to: "."
source_of_truth: true
related_requirements: ["FR-001", "FR-002", "QR-001"]
related_decisions: []
related_evidence: ["docs/spds/verification_evidence_index.md"]
agent_readable: true
agent_editable: false
human_approval_required: true
classification: SENTRA
review_trigger: "goal, requirement, or evidence change"
---

# Goal to Evidence Matrix

## Function

Connects product claims to executable evidence and known limits.

| Goal | Evidence | Limit |
| --- | --- | --- |
| Local desktop workspace launches | `pnpm run desktop:smoke` | Does not prove live provider use. |
| Prompt logic remains behaviourally checked | `pnpm run test` | Does not prove all user workflows. |
| Capsule is standalone | `pnpm run verify:extraction` | Does not prove production deployment. |
| Prisma generation avoids live DB dependency | `pnpm run typecheck` | Does not prove migration safety on shared data. |
