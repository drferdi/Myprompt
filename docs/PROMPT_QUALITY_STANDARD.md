# Prompt Quality Standard — Sentra Prompt 2026

**Scope:** `apps/internal/sentra-prompt`  
**Authority:** `lib/prompt-quality/contract.ts` (runtime SSOT)  
**Last updated:** 2026-06-04

---

## 1. What is a "Good Prompt"?

A good prompt is **self-contained, unambiguous, and testable**. Anyone — human
or LLM — should be able to read it cold and produce the intended output without
asking follow-up questions.

Four questions every prompt must answer:

| Question                         | Field                        |
| -------------------------------- | ---------------------------- |
| Who is the agent?                | `role`                       |
| What must be done?               | `task`                       |
| What context matters?            | `context`                    |
| What does good output look like? | `constraints` + `formatSpec` |

If any answer is missing, the prompt is incomplete.

---

## 2. The Super Prompt Schema (SSOT)

All structured prompts in Sentra Prompt conform to `SuperPromptSchema` in
`lib/prompt-quality/contract.ts`:

```typescript
{
  role:              string   // Who the LLM is playing
  task:              string   // The concrete deliverable
  context:           string   // Background + stated assumptions
  chainOfThought:    string   // Internal reasoning guidance (never exposed to end-user)
  constraints:       string[] // Testable rules the output must satisfy
  formatSpec:        string   // Exact output format
  fullPrompt:        string   // Paste-ready, standalone prompt string
}
```

`fullPrompt` is the **only field sent to the LLM**. All other fields enrich it
and feed the Optimizer's self-evaluation loop.

---

## 3. Quality Bar — Mandatory Rules

Every Super Prompt must satisfy all five rules before it leaves the Optimizer:

### Rule 1 — Specific over vague

Name concrete deliverables, audiences, and success signals.

| ❌ Weak              | ✅ Strong                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| "Write some content" | "Write one 800-word LinkedIn article for Indonesian startup founders about bootstrapping vs. VC funding" |
| "Explain this code"  | "Explain this Python function to a junior developer who knows Django but has never seen async/await"     |

### Rule 2 — Constraints are testable

Each constraint must be checkable against the produced output. If you cannot
write a pass/fail test for it, rewrite it.

| ❌ Untestable     | ✅ Testable                                          |
| ----------------- | ---------------------------------------------------- |
| "Be professional" | "Use no slang; no sentence shorter than 8 words"     |
| "Keep it short"   | "Maximum 200 words"                                  |
| "Sound human"     | "No em-dash (—) usage; max 1 question per paragraph" |

### Rule 3 — `fullPrompt` is self-contained

Paste `fullPrompt` into any chat interface and it must work without the other
fields. No pronouns without antecedents, no "the above context", no assumptions
the LLM cannot read.

### Rule 4 — Preserve original intent

Enriching a prompt ≠ redirecting it. If the user asked for a casual Instagram
caption, the output must still be a casual Instagram caption — not a formal
press release with hashtags.

### Rule 5 — Handle ambiguity explicitly

When the raw idea is vague, the Optimizer must:

1. Make the most reasonable assumption (do not stall).
2. State the assumption in `context`.
3. Surface genuinely open decisions as `[TODO: ...]` placeholders in
   `fullPrompt`.

```
Bad:  Silently invent a topic for "buatkan saya konten"
Good: Assume Instagram caption → state in context → add [TODO: confirm the actual topic]
```

---

## 4. Intent Detection

`detectIntent()` in `lib/transform/engine.ts` classifies a raw prompt into one
of seven intents, used to select the appropriate framing and instructions:

| Intent          | Trigger keywords (ID + EN sample)                           |
| --------------- | ----------------------------------------------------------- |
| `translation`   | terjemah, translate, alih bahasa                            |
| `generation`    | buatkan, bikin, buat, tulis, susun, create, write, generate |
| `analysis`      | analisis, analisa, evaluasi, kaji, analyze, review, assess  |
| `comparison`    | bandingkan, compare, perbedaan, difference, vs, versus      |
| `explanation`   | jelaskan, ceritakan, explain, what is, apa itu, bagaimana   |
| `debugging`     | perbaiki, benahi, atasi, fix, debug, error, bug             |
| `summarization` | ringkas, singkat, rangkum, summarize, summary               |
| `general`       | (fallback)                                                  |

**Authoring note:** `translation` is checked first because a prompt like
"terjemahkan dan buatkan versi formal" contains both `terjemah` and `buat`.
First-match semantics mean the more specific intent should be listed first.

---

## 5. Template Matching

`matchTemplate()` maps a raw idea to the closest pre-built template using two
layers:

### Layer 1 — Synonym-expanded keyword scoring

Before scoring, user query tokens are expanded through a bilingual synonym map
(`SYNONYMS` in `lib/templates/matcher.ts`). This means "bikin kode" matches the
same templates as "create code" or "write code".

Scoring weights per token match:

- Slug match: **+3**
- Name match: **+2**
- Description match: **+1**
- Full name substring in query: **+4**

### Layer 2 — Semantic embedding similarity (async)

`matchTemplateWithEmbeddings()` enriches layer 1 with cosine similarity between
the query embedding and cached template embeddings (`text-embedding-3-small`,
1536 dims).

Decision logic:

1. Keyword score > 0 **and** semantic winner matches → use keyword result
2. Keyword score = 0 **and** semantic score ≥ 0.35 → use semantic result
3. Keyword and semantic disagree, semantic score ≥ 0.55 → prefer semantic
4. Any embedding error → graceful fallback to keyword result

Template embeddings are cached in memory per process (computed once per slug,
reused on subsequent requests).

---

## 6. Vocabulary Mapping Across Skeletons

The codebase has three places that describe "a good prompt." They use different
field names but map to the same concepts:

| Concept        | SuperPromptSchema | Transform skeleton      | Template skeleton        |
| -------------- | ----------------- | ----------------------- | ------------------------ |
| Agent identity | `role`            | `# Role` section        | `template.role`          |
| What to do     | `task`            | `# Task` section        | `template.taskStructure` |
| Background     | `context`         | `# Context` section     | —                        |
| Reasoning      | `chainOfThought`  | —                       | `template.cotGuidance`   |
| Rules          | `constraints[]`   | `# Constraints` section | `template.constraints[]` |
| Output shape   | `formatSpec`      | `# Format` section      | `template.formatSpec`    |
| Deliverable    | `fullPrompt`      | full assembled string   | rendered template        |

Transform and template renderers are **not yet migrated** onto
`PromptQualitySchema` — tracked as P2 backlog.

---

## 7. Provider-Aware Prompting

Different LLMs respond best to different structural conventions. `MODEL_HINTS`
in `lib/transform/engine.ts` encodes these:

| Model family          | Convention                                                     |
| --------------------- | -------------------------------------------------------------- |
| Claude (Sonnet, Opus) | Use XML tags: `<role>`, `<context>`, `<task>`, `<constraints>` |
| OpenAI GPT-4o         | System message with numbered lists for multi-step tasks        |
| Mistral Large         | Direct, concise instructions — avoid verbose preamble          |
| DeepSeek V3/V4        | Chain-of-thought prompting; step-by-step reasoning blocks      |

The optimizer generates `chainOfThought` guidance but **never includes it in
`fullPrompt`** — it is used only internally and never sent to the end-user or
exposed in Sentry payloads.

---

## 8. Anti-Patterns (What Not to Do)

| Anti-pattern                              | Why it fails               | Fix                                                                |
| ----------------------------------------- | -------------------------- | ------------------------------------------------------------------ |
| Role: "You are an AI"                     | Provides no grounding      | Name a specific expert: "You are a senior Python engineer…"        |
| Task: "Help me with X"                    | No deliverable defined     | "Write / Analyze / Summarize / Fix X and return Y"                 |
| Constraint: "Be helpful"                  | Not testable               | Remove it — it adds noise, not signal                              |
| `fullPrompt` that references other fields | Not self-contained         | Rebuild `fullPrompt` to include all context inline                 |
| Silent assumption                         | User intent corrupted      | State assumption in `context`; add `[TODO:]` if uncertain          |
| Leaking `chainOfThought`                  | Exposes internal reasoning | Keep CoT in `chainOfThought` field only; exclude from `fullPrompt` |

---

## 9. Evaluation Checklist

Before promoting a prompt to production or the template library, verify:

- [ ] `role` names a concrete expert or persona (not "an AI assistant")
- [ ] `task` specifies the exact deliverable and target audience
- [ ] `context` states all assumptions made from vague input
- [ ] Every item in `constraints[]` is independently testable
- [ ] `fullPrompt` works in isolation — paste it cold into any LLM chat
- [ ] No `[TODO:]` placeholders remain (they must be resolved before promotion)
- [ ] `chainOfThought` is non-empty for complex tasks and absent from
      `fullPrompt`
- [ ] Output conforms to `PromptQualitySchema.parse()` without throwing

---

## 10. References

- Runtime SSOT: `lib/prompt-quality/contract.ts`
- Schema definition: `types/index.ts` → `SuperPromptSchema`
- Intent detection: `lib/transform/engine.ts` → `detectIntent()`
- Template matching: `lib/templates/matcher.ts` → `matchTemplate()` /
  `matchTemplateWithEmbeddings()`
- Embedding generator: `lib/embeddings/generator.ts`
- Cosine similarity: `lib/embeddings/similarity.ts` → `cosineSimilarity()`
- System prompt: `lib/llm/prompt-builder.ts` → `buildOptimizeSystemPrompt()`
- Test suites: `tests/unit/optimizer/`
