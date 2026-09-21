---
document_id: "48"
title: "Verification Evidence Index"
status: active
authority: Chief
owner: Chief
version: "1.0.0"
created: "2026-09-21"
last_verified: "2026-09-21"
applies_to: "."
source_of_truth: true
related_requirements: ["QR-001", "QR-003"]
related_decisions: []
related_evidence: ["docs/testing.md", "project.contract.json"]
agent_readable: true
agent_editable: false
human_approval_required: true
classification: SENTRA
review_trigger: "verification command or result changes"
---

# Verification Evidence Index

## Function

Identifies executable evidence for the capsule's stated contract.

| Claim | Evidence command |
| --- | --- |
| Capsule structure is local | `pnpm run verify:structure` |
| Static and behavioural checks pass | `pnpm run verify` |
| Fresh extraction remains operable | `pnpm run verify:extraction` |
| Desktop artifacts exist | `pnpm run deploy:dry-run` |

FACT: These commands completed successfully on 2026-09-21 during migration and
documentation maintenance. UNKNOWN: no production runtime, database, or external
provider health was verified.
