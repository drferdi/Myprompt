// Drferdi Transformer Engine V2 — Prompt Builder
import type { TaskType, PromptTone, OutputFormat, LLMProviderName, OptimizeLane } from '@/types'

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
