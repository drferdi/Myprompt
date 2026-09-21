---
document_id: "21"
title: "SPDS Architecture Record"
status: active
authority: Chief
owner: Chief
version: "1.0.0"
created: "2026-09-21"
last_verified: "2026-09-21"
applies_to: "."
source_of_truth: true
related_requirements: ["QR-001", "QR-002"]
related_decisions: ["ADR-0001"]
related_evidence: ["docs/architecture.md", "desktop/main.ts", "desktop/preload.ts"]
agent_readable: true
agent_editable: false
human_approval_required: true
classification: CORE
review_trigger: "IPC, preload, provider, or persistence boundary change"
---

# SPDS Architecture Record

## Function

Records the architecture decision that governs implementation boundaries.

The Electron main process owns privileged work. The preload bridge exposes a
limited context-isolated interface; the renderer consumes that interface and does
not obtain direct filesystem, database, or provider-key access. Product logic,
templates, types, Prisma schema, migrations, lockfile, and verification scripts
remain capsule-local.

See the detailed [Architecture Guide](../architecture.md).
