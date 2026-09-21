// Sentra Prompt — Canonical prompt-quality contract (Single Source of Truth)
//
// This module is the SSOT for "structured prompt quality" in this codebase. It
// canonicalizes the existing SuperPromptSchema rather than inventing a new shape,
// so adoption is zero-risk and no public type changes.
//
// Canonical field set: role, task, context, reasoning, constraints, format
// (plus the assembled fullPrompt).
//
// Vocabulary mapping across the three prompt skeletons (documented, NOT enforced
// here — converting Transform + templates to this contract is deferred to P2):
//
//   Canonical    | Optimizer (SuperPrompt) | Transform skeleton | Template renderer
//   -------------|-------------------------|--------------------|------------------
//   role         | role                    | # Role             | role
//   task         | task                    | # Task             | taskStructure
//   context      | context                 | # Context          | (context)
//   reasoning    | chainOfThought          | (implicit)         | cotGuidance
//   constraints  | constraints[]           | # Constraints      | constraints
//   format       | formatSpec              | (output section)   | formatSpec
//
// See DECISIONS.md (2026-06-04): SSOT prompt-quality contract established;
// Transform + template migration deferred to P2.

import { SuperPromptSchema, type SuperPrompt } from '@/types'

/** Canonical schema for structured prompt quality (SSOT). */
export const PromptQualitySchema = SuperPromptSchema

/** Canonical type for structured prompt quality (SSOT). */
export type PromptQuality = SuperPrompt
