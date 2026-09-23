// Drferdi Transformer Engine V2 — Prompt Builder
import type {
  CodingBriefRefinement,
  TaskType,
  PromptTone,
  OutputFormat,
  LLMProviderName,
  OptimizeLane,
} from '@/types'

interface OptimizePromptParams {
  rawIdea: string
  taskType: TaskType
  tone: PromptTone
  format: OutputFormat
  targetLlm: LLMProviderName
  optimizerLane?: OptimizeLane
  templateContext?: string
}

interface EvaluatePromptParams {
  promptText: string
}

const TONE_DESCRIPTORS: Record<PromptTone, string> = {
  PROFESSIONAL: 'formal, direct, business-safe',
  CASUAL: 'friendly, natural, approachable',
  TECHNICAL: 'precise, technical, detail-first',
  ACADEMIC: 'rigorous, scholarly, evidence-aware',
  CREATIVE: 'imaginative, vivid, engaging',
  PERSUASIVE: 'compelling, action-oriented, outcome-focused',
}

const FORMAT_INSTRUCTIONS: Record<OutputFormat, string> = {
  DETAILED: 'deep, complete, well-scoped',
  CONCISE: 'brief, essential points',
  STRUCTURED: 'headings, bullets, sections',
  STEP_BY_STEP: 'numbered sequential steps',
  CONVERSATIONAL: 'natural dialogue flow',
}

const TASK_CONTEXT: Record<TaskType, string> = {
  CODING: 'code, debugging, implementation',
  EMAIL: 'email, reply, follow-up',
  ANALYSIS: 'analysis, numbers, synthesis',
  CREATIVE: 'creative writing, content',
  RESEARCH: 'research, literature, synthesis',
  BUSINESS: 'business, strategy, proposals',
  EDUCATION: 'teaching, curriculum, learning',
  MARKETING: 'marketing, campaigns, brand',
  GENERAL: 'general task',
}

const OPERATOR_SIGNAL_PATTERN =
  /(?:\btable\b|\btabel\b|\bkolom\b|\bcolumns?\b|\brows?\b|\bbaris\b|\bdata\b|\bmetric\b|\bmetrik\b|\brevenue\b|\bpendapatan\b|\bsales\b|\bpenjualan\b|\bhitung\b|\bcalculate\b|\bcomparison\b|\bcompare\b|\banalisis\b|\banalysis\b|rp\d?|%)/i

const INDONESIAN_SIGNAL_PATTERN =
  /(?:\b(?:yang|untuk|dengan|seperti|agar|supaya|jelaskan|buatkan|tolong|bahasa|indonesia|ditujukan|aplikasi|arsitektur|tingkat|tinggi)\b)/i

const INDONESIAN_AUDIENCE_PATTERN =
  /(?:\b(?:indonesia|indonesian|audiens indonesia|engineer junior di indonesia)\b)/i

const PROPRIETARY_PRODUCT_PATTERN =
  /\b(?:whatsapp|telegram|slack|discord|instagram|tiktok|youtube|notion|figma|airbnb|uber|gojek|tokopedia|shopee)\b/i

const EXPLICIT_FORMAT_PATTERN =
  /(?:format berikut|gunakan format berikut|output format|struktur berikut|gunakan struktur berikut|follow(?:ing)? format|use the following format)/i

const HEADING_LINE_PATTERN = /^\s{0,3}(?:#{1,6}\s+.+|\d+\.\s+.+)$/m
const TECHNICAL_ARCHITECTURE_PATTERN =
  /(?:distributed systems?|real-time communication|websocket|message broker|database architecture|system design|arsitektur|scalabilit|low-latency|fault tolerance|gateway|push notification|chatting real-time)/i

function buildOperatorPriorities(rawIdea: string, taskType: TaskType): string | null {
  const isOperatorHeavyTask =
    taskType === 'ANALYSIS' ||
    taskType === 'BUSINESS' ||
    taskType === 'RESEARCH' ||
    OPERATOR_SIGNAL_PATTERN.test(rawIdea)

  if (!isOperatorHeavyTask) {
    return null
  }

  return `OPERATOR PRIORITIES:
- Preserve every user-supplied number, unit, currency, timeframe, and named entity verbatim.
- If the task asks for a table, calculation, comparison, or recommendation, use compact sections with explicit results and no narrative padding.`
}

function detectPreferredInstructionLanguage(rawIdea: string): string {
  return INDONESIAN_SIGNAL_PATTERN.test(rawIdea) ? 'Bahasa Indonesia' : 'English'
}

function shouldPreferIndonesianContext(rawIdea: string): boolean {
  return (
    detectPreferredInstructionLanguage(rawIdea) === 'Bahasa Indonesia' ||
    INDONESIAN_AUDIENCE_PATTERN.test(rawIdea)
  )
}

function hasExplicitOutputStructure(rawIdea: string): boolean {
  return EXPLICIT_FORMAT_PATTERN.test(rawIdea) || HEADING_LINE_PATTERN.test(rawIdea)
}

function buildQualityRoutingGuidance(rawIdea: string, taskType: TaskType): string {
  const guidance = [
    `PROMPT QUALITY RULES:`,
    `- Preferred instruction language: ${detectPreferredInstructionLanguage(rawIdea)}.`,
    `- Always add one explicit output-length constraint in CONSTRAINTS. Preserve user-specified limits; otherwise use a sensible default.`,
    `- For shorter operator tasks, default to a focused cap such as ~400-700 words. For deeper explanation, architecture, or analysis tasks, default to a focused cap such as ~1024 tokens.`,
    `- Keep the user's core domain wording and deliverable framing close to the original request. Do not broaden it into a different adjacent task.`,
    `- Preserve any explicitly named audience in ROLE, TASK, or CONTEXT instead of replacing it with a more generic audience.`,
    `- Carry forward explicitly requested components, steps, sections, and examples instead of swapping them for your own scaffolding.`,
  ]

  if (
    shouldPreferIndonesianContext(rawIdea) &&
    (taskType === 'EDUCATION' ||
      taskType === 'ANALYSIS' ||
      taskType === 'BUSINESS' ||
      /\banalog/i.test(rawIdea))
  ) {
    guidance.push(
      `- If analogies or examples help, prefer examples or analogies familiar to readers in Indonesia.`
    )
  }

  if (PROPRIETARY_PRODUCT_PATTERN.test(rawIdea)) {
    guidance.push(
      `- If the raw idea names a branded product, keep the user intent while restating it as a general industry pattern. Do not imply access to private or proprietary internal details.`
    )
  }

  if (
    taskType === 'CODING' ||
    taskType === 'EDUCATION' ||
    taskType === 'RESEARCH' ||
    TECHNICAL_ARCHITECTURE_PATTERN.test(rawIdea)
  ) {
    guidance.push(
      `- For technical architecture or systems prompts, make ROLE use the strongest relevant domain nouns already present in the raw idea, such as distributed systems, real-time communication, WebSocket infrastructure, message broker, or database architecture when they are explicitly provided.`
    )
    guidance.push(
      `- Keep TASK close to the user's original sentence shape and technical scope. Do not weaken a concrete user request into a safer but broader paraphrase.`
    )

    if (PROPRIETARY_PRODUCT_PATTERN.test(rawIdea)) {
      guidance.push(
        `- If the user uses a branded comparison, keep the comparison label when it helps orientation, but frame it as a public product comparison rather than proprietary internal knowledge.`
      )
    }
  }

  if (hasExplicitOutputStructure(rawIdea)) {
    guidance.push(
      `- The user already specified an output structure. Preserve those requested headings, section names, and ordering as closely as possible.`
    )
    guidance.push(
      `- Do not add extra sections such as Learning Objectives, Assessment, FAQ, or other scaffolding unless the user explicitly asked for them.`
    )
  }

  return guidance.join('\n')
}

const SHARED_QUALITY_RULES: string[] = [
  'Match the dominant user language for the instruction body unless the user explicitly requests another language.',
  'Always include one explicit output-length constraint. Preserve any user-provided limit; otherwise choose a focused default that keeps the answer bounded.',
  'If the audience is Indonesian and analogies help, prefer examples familiar in Indonesia.',
  'If the raw idea references a branded or proprietary product, restate it as a general public pattern and avoid implying knowledge of private internals.',
  'If the user already specifies headings, section names, section order, or an exact output structure, preserve those requested headings and ordering as closely as possible.',
  "Do not add extra sections beyond the user's requested structure unless they are explicitly asked for.",
  "Preserve the user's core domain wording and deliverable framing. Do not rename it into a broader adjacent task unless safety or clarity truly requires it.",
  'If the user explicitly names the audience, preserve that audience in ROLE, TASK, or CONTEXT instead of replacing it with a more generic one.',
  'If the user explicitly requests required components, steps, sections, or examples, carry those forward instead of replacing them with your own scaffolding.',
  'For technical architecture or systems prompts, make ROLE use the strongest relevant domain nouns already present in the raw idea.',
  'Do not weaken a concrete user request into a safer but broader paraphrase in TASK when the user already wrote a strong technical sentence.',
]

function buildDeepOptimizeSystemPrompt(): string {
  return `You are an expert Prompt Engineer. Your job is to transform raw, unstructured ideas into highly effective, structured "Super Prompts" that maximize the output quality of Large Language Models.

Output a Super Prompt using exactly this markdown structure, in exactly this heading order:

## ROLE
<role text>

## TASK
<task text>

## CONTEXT
<context text — include any assumptions stated explicitly here>

## APPROACH
<high-level reasoning approach — NOT hidden chain-of-thought>

## CONSTRAINTS
- <constraint 1>
- <constraint 2>

## OUTPUT FORMAT
<format specification text>

Output rules:
- Output ONLY the markdown above — no \`\`\` fences, no preamble, no trailing commentary. Begin directly with \`## ROLE\`.
- APPROACH stays high-level and operational; do not reveal hidden chain-of-thought.
- Never include meta-commentary about the prompt itself.

Handling ambiguity:
- When the raw idea omits critical information, make the most reasonable assumption instead of stalling.
- State every such assumption explicitly in the CONTEXT section.
- Encode any genuinely missing decision as an explicit CONSTRAINTS entry or as a bracketed [TODO: ...] placeholder in the TASK or OUTPUT FORMAT section.
- Never silently invent specifics that change the user's original intent.

Quality bar (every Super Prompt must satisfy these):
- Specific over vague: name concrete deliverables, audiences, and success signals.
- Constraints are testable: each one must be checkable against the produced output.
- Preserve the user's original intent: enrich it, do not redirect it.
- Prefer dense, information-complete bullets and short clauses over elaborate paragraphs. Specificity is quality; verbosity is not.
${SHARED_QUALITY_RULES.map((r) => `- ${r}`).join('\n')}
- For tables, calculations, and analysis tasks: preserve source numbers verbatim, keep formulas/results explicit, and use compact tables or bullets when requested.
- Optimize for operator usability: direct outputs first, decorative prose never.

Example:
Raw idea: "buatkan saya konten"
Super Prompt:

## ROLE
Senior content strategist for Indonesian social media

## TASK
Write one ready-to-publish content piece based on the user's idea

## CONTEXT
The raw idea 'buatkan saya konten' omits platform, topic, and audience. Assumption: a short Instagram caption in Bahasa Indonesia for a general audience, since no specifics were provided.

## APPROACH
Open with a hook, deliver one clear value point, close with a single call to action.

## CONSTRAINTS
- Output in Bahasa Indonesia
- Maximum 120 words
- Include exactly one call to action

## OUTPUT FORMAT
A single caption block followed by 3-5 relevant hashtags`
}

function buildInteractiveOptimizeSystemPrompt(): string {
  return `You are an expert Prompt Engineer. Transform the raw idea into a directly usable Super Prompt.

Output only markdown with these headings in this exact order:
## ROLE
## TASK
## CONTEXT
## APPROACH
## CONSTRAINTS
## OUTPUT FORMAT

Rules:
- No fences, no preamble, no trailing commentary.
- Preserve the user's intent plus every number, unit, currency, timeframe, and named entity verbatim.
- Make reasonable assumptions and state them explicitly in CONTEXT.
- Keep every section short. Prefer 1 sentence for ROLE, 1-2 sentences for TASK, and concise bullets for CONSTRAINTS/OUTPUT FORMAT.
- Do not invent product features, offers, testimonials, metrics, or brand claims that the user did not provide.
${SHARED_QUALITY_RULES.map((r) => `- ${r}`).join('\n')}
- Use [TODO: ...] only when a critical decision is genuinely missing.
- Do not append rationale, explanation, or "why this works" summaries unless the user explicitly asked for them.
- Keep the result dense, operator-ready, and immediately usable.
- APPROACH must stay high-level; never reveal hidden chain-of-thought.`
}

export function buildOptimizeSystemPrompt(optimizerLane: OptimizeLane = 'DEEP'): string {
  return optimizerLane === 'INTERACTIVE'
    ? buildInteractiveOptimizeSystemPrompt()
    : buildDeepOptimizeSystemPrompt()
}

export function buildOptimizeUserPrompt(params: OptimizePromptParams): string {
  const {
    rawIdea,
    taskType,
    tone,
    format,
    targetLlm,
    optimizerLane = 'DEEP',
    templateContext,
  } = params

  const operatorPriorities = buildOperatorPriorities(rawIdea, taskType)
  const qualityRoutingGuidance = buildQualityRoutingGuidance(rawIdea, taskType)

  let prompt =
    optimizerLane === 'INTERACTIVE'
      ? `Convert this raw idea into a ready-to-run Super Prompt:

RAW IDEA: "${rawIdea}"

- Domain: ${TASK_CONTEXT[taskType]}
- Tone: ${TONE_DESCRIPTORS[tone]}
- Format: ${FORMAT_INSTRUCTIONS[format]}
- Target LLM: ${targetLlm}`
      : `Transform this raw idea into a Super Prompt:

RAW IDEA: "${rawIdea}"

SETTINGS:
- Task Domain: ${TASK_CONTEXT[taskType]}
- Tone: ${TONE_DESCRIPTORS[tone]}
- Output Format: ${FORMAT_INSTRUCTIONS[format]}
- Target LLM: ${targetLlm}`

  if (templateContext) {
    prompt +=
      optimizerLane === 'INTERACTIVE'
        ? `\n\nOPTIONAL TEMPLATE GUIDANCE:\n${templateContext}`
        : `\n\nTEMPLATE GUIDANCE:\n${templateContext}`
  }

  if (operatorPriorities) {
    prompt += `\n\n${operatorPriorities}`
  }

  prompt += `\n\n${qualityRoutingGuidance}`

  prompt +=
    optimizerLane === 'INTERACTIVE'
      ? `\n\nReturn the Super Prompt now.`
      : `\n\nGenerate the Super Prompt now.`

  return prompt
}

// ── Coding Brief (docs/CODING_BRIEF_STANDARD.md) ─────────────────────────
//
// These builders deliberately carry no Optimizer settings (target LLM, domain,
// tone, format): §5 V9 rejects a brief whose lines open with those labels, and
// §9 rules out persona and implementation steps.

export function buildCodingBriefSystemPrompt(): string {
  return `You are a senior engineer writing a Coding Brief for a coding agent that already knows how to write code. The user types a rough idea; you return a complete brief that is ready to hand to the agent. Anything the user did not say is filled with a sensible proposal and listed openly under ASSUMPTIONS, so the user can change it in one line.

Output ONLY these markdown headings, uppercase, in this exact order:
## GOAL
## CONTEXT
## SCOPE
## STACK
## OUT OF SCOPE
## DONE WHEN
## ASSUMPTIONS

Never output a REPORT section. The Optimizer appends it.

The rule that governs everything:
- Existing code (paths, functions, commands, test names, APIs): never invent. A wrong path sends the agent to edit the wrong file. When the raw idea names none, CONTEXT is exactly \`Explore first: <area of the product in the user's own words>\`.
- Everything else (a new project's directory, the page list, the stack, the scope boundary, how to check): always propose. A wrong proposal costs the user one edited line; an empty element costs them the whole job.

Two situations, one element set:
- Greenfield (nothing exists yet): CONTEXT begins with \`New project:\` followed by a proposed directory such as \`./clinic-website\`. SCOPE lists every page, screen, or capability to build, proposed in full. Never write \`[TODO: ...]\` in a greenfield brief; propose instead.
- Brownfield (work inside existing code): CONTEXT lists the paths the raw idea names, one per line, or \`Explore first:\` as above. SCOPE states the triggering condition, the observed behaviour, and the expected behaviour.

Rules:
- Every heading except ASSUMPTIONS is always required. Write the headings exactly as listed, with no extra words after the heading text, and never leave a section empty.
- Anything the user stated is carried verbatim and never reworded.
- Anything the user did not state is proposed as the most ordinary choice for that kind of work, not the most sophisticated one.
- GOAL is one sentence of at most 40 words stating what is built or changed. No background, no rationale.
- SCOPE names at least two concrete items.
- STACK carries every technology the raw idea names, spelled as the user spelled it, plus an existing file to imitate when the raw idea names one. Propose the rest; in brownfield work without named technology, write \`Explore first: the stack the repository already uses.\`
- OUT OF SCOPE states what must not be built or changed; propose it when the user said nothing.
- DONE WHEN contains a runnable command in backticks together with its expected result, in the user's own terms. Never state only a vague outcome such as "works", "works well", "no errors", or "looks good". Only in brownfield work where the check depends on code you cannot see, write \`Propose a check first: <the concrete outcome to verify>\`.
- Text after \`Explore first:\` or \`Propose a check first:\` states real content, never a paraphrase such as "the intended outcome", "the check", or "to be determined".
- ASSUMPTIONS has one line per proposal, phrased so a non-programmer can tell whether it is wrong, then the closing line \`Change any line above and run again.\` Omit ASSUMPTIONS only when the user supplied everything.
- When the request is ambiguous between two ordinary readings, pick one, build the brief on it, and name the other in ASSUMPTIONS.
- No code fences, no preamble, no trailing commentary. Begin directly with \`## GOAL\`.
- Do not assign a persona or role, and do not prescribe implementation steps.
- When the message carries a PREVIOUS BRIEF and ANSWERS FROM THE USER, return that brief refined: change only what an answer covers, carry each answer verbatim, remove each answered item from ASSUMPTIONS, and keep every other line unchanged.

Acceptance criteria guidance:
- Satisfy the requested behavior without unrelated changes.

Verification guidance:
- Name the focused checks that demonstrate the requested behavior.
- Report only results supported by executed evidence.

Example 1 — greenfield. Raw idea: "buatkan website dokter umum, desain biru langit"

## GOAL
Build a general practitioner clinic website with a sky-blue visual theme.

## CONTEXT
New project: ./clinic-website

## SCOPE
Home with clinic introduction, doctor profile, services, opening hours, location with map
link, and a contact page with a form that sends to an email address.

## STACK
Next.js (App Router), React, TypeScript, Tailwind CSS.

## OUT OF SCOPE
No patient records, no authentication, no online appointment booking, no payments.

## DONE WHEN
\`pnpm dev\` runs and every page listed in SCOPE opens in the browser with the sky-blue theme
applied and no console errors.

## ASSUMPTIONS
- Directory ./clinic-website; change it if the project lives elsewhere.
- Next.js and Tailwind chosen as the ordinary stack for this kind of site.
- Contact by form and email, no booking system.
- Indonesian-language content, single clinic, single doctor profile.
Change any line above and run again.

Example 2 — brownfield, the user supplied everything, so no ASSUMPTIONS. Raw idea: "the optimizer returns truncated prompts as successful results; fix it in lib/optimizer/engine.ts and lib/llm/types.ts, TypeScript with Vitest, follow the length-recovery logic in optimizePrompt"

## GOAL
Stop the optimizer from returning truncated prompts as successful results.

## CONTEXT
@lib/optimizer/engine.ts
@lib/llm/types.ts

## SCOPE
A streamed result ending mid-list is accepted as complete.
Expected: the truncation is detected and either continued or flagged.

## STACK
TypeScript, Vitest. Follow the length-recovery logic in \`optimizePrompt\`.

## OUT OF SCOPE
lib/transform/**, desktop/preload.ts

## DONE WHEN
\`pnpm run test\` passes, including a new test that feeds the truncated fixture and expects a
truncation flag.`
}

export function buildCodingBriefUserPrompt(params: {
  rawIdea: string
  refinement?: CodingBriefRefinement
}): string {
  const { rawIdea, refinement } = params
  if (!refinement) {
    return `RAW IDEA: "${rawIdea}"

Return the Coding Brief now.`
  }

  // "I don't know" (null) keeps the proposal, so only answered items are sent.
  const answered = refinement.clarifications.filter(
    (item) => item.answer !== null && item.answer.trim() !== ''
  )
  return `RAW IDEA: "${rawIdea}"

PREVIOUS BRIEF:
${refinement.previousBrief}

ANSWERS FROM THE USER:
${answered.map((item) => `- ${item.question}\n  Answer: "${item.answer}"`).join('\n')}

Return the refined Coding Brief now.`
}

/**
 * Generates the system prompt for the Evaluation Engine.
 *
 * The system prompt instructs the LLM to act as a Prompt Quality Evaluator
 * and perform a multi-dimensional analysis (Structure, Clarity, Completeness, Specificity).
 *
 * @returns The system prompt string.
 */
export function buildEvaluateSystemPrompt(): string {
  return `You are an expert Prompt Quality Evaluator. Analyze prompts across 4 dimensions and provide actionable feedback.

Your output MUST be a valid JSON object with this exact structure:
{
  "structure": {
    "score": <number 0-10>,
    "feedback": "<specific feedback about prompt organization, sections, and logical flow>"
  },
  "clarity": {
    "score": <number 0-10>,
    "feedback": "<specific feedback about language clarity, ambiguity, and precision>"
  },
  "completeness": {
    "score": <number 0-10>,
    "feedback": "<specific feedback about missing context, constraints, or specifications>"
  },
  "specificity": {
    "score": <number 0-10>,
    "feedback": "<specific feedback about how specific vs vague the instructions are>"
  },
  "suggestions": [
    "<actionable improvement suggestion 1>",
    "<actionable improvement suggestion 2>",
    "<actionable improvement suggestion 3>"
  ]
}

Scoring rubric:
- 9-10: Exceptional, production-ready
- 7-8: Good, minor improvements possible
- 5-6: Adequate, significant room for improvement
- 3-4: Below average, major issues
- 1-2: Poor, needs complete rewrite

Output ONLY the JSON object, no markdown fences, no explanation.`
}

export function buildEvaluateUserPrompt(params: EvaluatePromptParams): string {
  return `Evaluate this prompt:\n\n"${params.promptText}"\n\nProvide your evaluation JSON now.`
}
