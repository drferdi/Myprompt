---
document_id: "13"
title: "System Requirements"
status: active
authority: Chief
owner: Chief
version: "1.0.0"
created: "2026-09-21"
last_verified: "2026-09-21"
applies_to: "."
source_of_truth: true
related_requirements: ["FR-001", "FR-002", "QR-001"]
related_decisions: ["ADR-0001"]
related_evidence: ["project.contract.json", "docs/testing.md"]
agent_readable: true
agent_editable: false
human_approval_required: true
classification: CORE
review_trigger: "runtime or lifecycle contract change"
---

# System Requirements

## Function

Defines the minimum executable and security-relevant requirements for the capsule.

- **FR-001:** The application shall launch as a local Electron desktop workspace.
- **FR-002:** The application shall support prompt authoring, template use,
  optimisation, and evaluation through configured providers.
- **QR-001:** The capsule shall install, lint, type-check, test, build, run, and
  perform a deploy dry-run from its own root.
- **QR-002:** Provider credentials shall remain outside tracked source and the
  renderer's privilege boundary.
- **QR-003:** Prisma generation shall succeed without a live database.
