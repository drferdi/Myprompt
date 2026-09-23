import * as strings from './strings'

type DesktopPrimaryModeId = 'transform' | 'optimize'
type DesktopOptimizeLane = 'INTERACTIVE' | 'DEEP'
type DesktopCompilerProfile = 'default' | 'claude' | 'codex' | 'gemini' | 'grok'
type DesktopEffortLevel = 'low' | 'medium' | 'high' | 'xhigh' | 'max'
type DesktopCommandId =
  | 'help.show'
  | 'evaluate'
  | 'library.list'
  | 'library.search'
  | 'library.save'
  | 'draft.list'
  | 'draft.save'
  | 'recent.list'
  | 'benchmark.list'
  | 'benchmark.save'
  | 'benchmark.run'
  | 'templates.list'
  | 'provider.list'
  | 'provider.save'
  | 'provider.delete'
  | 'usage.summary'
  | 'subscription.upgrade'
  | 'auth.login'
  | 'auth.register'
  | 'auth.logout'

type ParsedConsoleInput =
  | { kind: 'prompt'; value: string }
  | { kind: 'command'; command: DesktopCommandId; args: string[] }

interface DesktopInvocation {
  channel: string
  payload?: unknown
}

type DesktopRunSourceMode = 'transform' | 'optimize'

interface DesktopRunRecord {
  id: string
  rawInput: string
  outputText: string
  sourceMode: DesktopRunSourceMode
  taskType: string
  tone: string
  format: string
  targetLlm: DesktopLLMProvider
  optimizerLane?: DesktopOptimizeLane
}

interface DesktopRecentRunRecord {
  id: string
  rawInput: string
  outputText: string
  sourceMode: 'transform' | 'optimize' | 'evaluate'
  createdAt?: string
  outputKind?: DesktopOutputKind
  quality?: { complete: boolean; degraded: boolean; thin?: boolean }
}

interface BriefCounts {
  total: number
  complete: number
  needsCheck: number
}

interface DesktopBenchmarkRecord {
  id: string
  title: string
  prompt: string
  taskType: string
  tone: string
  format: string
  lanes: DesktopOptimizeLane[]
  createdAt?: string
  updatedAt?: string
}

interface DesktopCommandCatalogEntry {
  id: DesktopCommandId
  slash: string
  summary: string
  transportCommand: string
}

type DesktopOutputKind = 'SUPER_PROMPT' | 'CODING_BRIEF'

interface DesktopOptimizerSuggestion {
  taskType: string
  optimizerLane: DesktopOptimizeLane
  templateSlug?: string
  outputKind: DesktopOutputKind
  reasons: string[]
}

interface AppendConsoleLineOptions {
  copyText?: string
  runRecord?: DesktopRunRecord
}

interface DesktopShellState {
  appName?: string
  badges?: Array<{
    id: string
    label: string
    tone: 'muted' | 'danger'
  }>
  modelChip?: string
  preferredModel?: string
  preferredProvider?: DesktopLLMProvider
  providerReadiness?: {
    status: 'ready' | 'missing'
    availableProviders: DesktopLLMProvider[]
    activeProvider: DesktopLLMProvider | null
  }
  optimizerLaneStates?: Partial<
    Record<
      DesktopOptimizeLane,
      {
        modelChip?: string
        preferredModel?: string
      }
    >
  >
}

type DesktopLLMProvider = 'CLAUDE' | 'OPENAI' | 'MISTRAL' | 'QWEN' | 'GROK'

type DesktopWindow = Window &
  typeof globalThis & {
    sentraDesktop?: {
      getShellState?: () => Promise<DesktopShellState>
      invoke?: <T = unknown>(channel: string, payload?: unknown) => Promise<T>
      auth?: {
        getSession?: () => Promise<unknown>
        setSession?: (payload: unknown) => Promise<unknown>
        login?: (payload: unknown) => Promise<unknown>
        register?: (payload: unknown) => Promise<unknown>
        logout?: () => Promise<unknown>
      }
      workspace?: {
        listDrafts?: () => Promise<unknown>
        saveDraft?: (payload: Record<string, unknown>) => Promise<unknown>
        listRecentRuns?: () => Promise<unknown>
        listBenchmarks?: () => Promise<unknown>
      }
      onStream?: (channel: string, callback: (payload: unknown) => void) => void
      offStream?: (channel: string, callback: (payload: unknown) => void) => void
      close?: () => void
      minimize?: () => void
      getWindowPos?: () => Promise<number[]>
      setWindowPos?: (x: number, y: number) => void
    }
  }

const desktopWindow = window as DesktopWindow

const SCRAMBLE_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*_+-=[]{}|'
const DECODE_TARGET_LENGTH = 40

function generateScrambleText(length: number): string {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
  }
  return out
}

const COMMAND_CATALOG: DesktopCommandCatalogEntry[] = [
  {
    id: 'help.show',
    slash: '/help',
    summary: strings.summaryHelpShow,
    transportCommand: 'help:show',
  },
  {
    id: 'evaluate',
    slash: '/evaluate <text>',
    summary: strings.summaryEvaluate,
    transportCommand: 'evaluate:run',
  },
  {
    id: 'library.list',
    slash: '/library',
    summary: strings.summaryLibraryList,
    transportCommand: 'library:list',
  },
  {
    id: 'library.search',
    slash: '/library search <query>',
    summary: strings.summaryLibrarySearch,
    transportCommand: 'library:search',
  },
  {
    id: 'library.save',
    slash: '/library save',
    summary: strings.summaryLibrarySave,
    transportCommand: 'library:save',
  },
  {
    id: 'draft.save',
    slash: '/draft save',
    summary: strings.summaryDraftSave,
    transportCommand: 'draft:save',
  },
  {
    id: 'recent.list',
    slash: '/recent',
    summary: strings.summaryRecentList,
    transportCommand: 'recent:list',
  },
  {
    id: 'benchmark.list',
    slash: '/benchmark list',
    summary: strings.summaryBenchmarkList,
    transportCommand: 'benchmark:list',
  },
  {
    id: 'benchmark.save',
    slash: '/benchmark save',
    summary: strings.summaryBenchmarkSave,
    transportCommand: 'benchmark:save',
  },
  {
    id: 'benchmark.run',
    slash: '/benchmark run <id>',
    summary: strings.summaryBenchmarkRun,
    transportCommand: 'benchmark:run',
  },
  {
    id: 'provider.list',
    slash: '/provider',
    summary: strings.summaryProviderList,
    transportCommand: 'provider:list',
  },
  {
    id: 'usage.summary',
    slash: '/usage',
    summary: strings.summaryUsageSummary,
    transportCommand: 'usage:summary',
  },
  {
    id: 'subscription.upgrade',
    slash: '/subscription upgrade <tier> <interval>',
    summary: strings.summarySubscriptionUpgrade,
    transportCommand: 'subscription:upgrade',
  },
]

const COMPILER_PROFILES: DesktopCompilerProfile[] = [
  'default',
  'claude',
  'codex',
  'gemini',
  'grok',
]
const EFFORT_LEVELS: DesktopEffortLevel[] = ['low', 'medium', 'high', 'xhigh', 'max']
const EFFORT_MAX_TOKENS: Record<DesktopEffortLevel, number> = {
  low: 700,
  medium: 1200,
  high: 1800,
  xhigh: 2600,
  max: 3200,
}

const shell = document.getElementById('consoleShell') as HTMLElement | null
const display = document.getElementById('display') as HTMLElement | null
const promptLine = document.getElementById('promptLine') as HTMLElement | null
const input = document.getElementById('cmdInput') as HTMLInputElement | null
const closeBtn = document.getElementById('closeBtn') as HTMLElement | null
const minimizeBtn = document.getElementById('minimizeBtn') as HTMLElement | null

let currentMode: DesktopPrimaryModeId = 'optimize'
let currentOutputKind: DesktopOutputKind = 'CODING_BRIEF'
let currentCompilerProfile: DesktopCompilerProfile = 'default'
let currentEffortLevel: DesktopEffortLevel = 'high'
let currentOptimizerLane: DesktopOptimizeLane = 'INTERACTIVE'
let currentProvider: DesktopLLMProvider | null = null
let currentModelLabel = 'provider-resolving'
let providerReadinessStatus: 'resolving' | 'ready' | 'missing' = 'resolving'

let isExecuting = false
let lastRunRecord: DesktopRunRecord | null = null
// Startup block state: printed once the shell state is known, and again on `clear`.
let shellStateLoaded = false
let briefCounts: BriefCounts | null = null
let lastCopyText = ''

// Clarification round (docs/CODING_BRIEF_STANDARD.md §6 P5). The main process derives the
// questions and sends them with a delivered brief; this module cannot import lib/.
type ClarificationElement = keyof typeof strings.clarificationHints

interface ClarificationItem {
  element: ClarificationElement
  question: string
}

interface CodingBriefRefinementPayload {
  previousBrief: string
  clarifications: Array<ClarificationItem & { answer: string | null }>
}

interface ClarificationRound {
  rawIdea: string
  previousBrief: string
  items: ClarificationItem[]
  /** One entry per answered question: the typed text, or null for "keep" (Enter). */
  answers: Array<string | null>
}

/** Set by a delivered brief; its first question prints once that run's command block closes. */
let offeredClarificationRound: ClarificationRound | null = null
/** While set, every typed line answers the current question (D2). */
let pendingClarificationRound: ClarificationRound | null = null
const activeOptimizeLines = new Map<string, HTMLElement>()
const activeOptimizeStatusLines = new Map<string, HTMLElement>()
let optimizerLaneStates: Partial<
  Record<
    DesktopOptimizeLane,
    {
      modelChip?: string
      preferredModel?: string
    }
  >
> = {}

function inferOptimizeTaskType(value: string) {
  const normalized = value.toLowerCase()
  const codingSignals = [
    'react',
    'vite',
    'tailwind',
    'shadcn',
    'typescript',
    'javascript',
    'next.js',
    'nextjs',
    'frontend',
    'backend',
    'component',
    'routing',
    'api',
    'website',
    'web app',
    'landing page',
    'dashboard',
    'code',
    'arsitektur',
    'architecture',
    'system',
    'review',
    'observability',
    'multi-tenant',
  ]
  const marketingSignals = [
    'copywriting',
    'copy',
    'iklan',
    'instagram',
    'campaign',
    'kampanye',
    'ads',
    'promo',
    'promosi',
    'branding',
    'brand',
    'caption',
    'hook',
    'cta',
    'audience',
  ]

  if (codingSignals.some((signal) => normalized.includes(signal))) {
    return 'CODING'
  }

  if (marketingSignals.some((signal) => normalized.includes(signal))) {
    return 'MARKETING'
  }

  return 'GENERAL'
}

function inferTemplateSlug(value: string, taskType: string) {
  const normalized = value.toLowerCase()

  if (taskType === 'MARKETING') {
    if (
      normalized.includes('seo') ||
      normalized.includes('search intent') ||
      normalized.includes('keyword')
    ) {
      return 'seo-content'
    }

    return 'ad-copy'
  }

  if (taskType === 'CODING') {
    if (
      normalized.includes('debug') ||
      normalized.includes('bug') ||
      normalized.includes('error')
    ) {
      return 'debug-issue'
    }

    return 'code-review'
  }

  if (taskType === 'ANALYSIS') {
    if (normalized.includes('competitor') || normalized.includes('competitive')) {
      return 'competitive-analysis'
    }

    return 'data-analysis'
  }

  if (taskType === 'BUSINESS') {
    return 'business-plan'
  }

  if (taskType === 'RESEARCH') {
    return 'technology-assessment'
  }

  return undefined
}

function suggestOptimizerConfig(rawIdea: string): DesktopOptimizerSuggestion {
  const normalized = rawIdea.toLowerCase()
  const taskType = inferOptimizeTaskType(rawIdea)
  const deepSignals = [
    'arsitektur',
    'architecture',
    'trade-off',
    'tradeoff',
    'multi-tenant',
    'strategy',
    'strategi',
    'event-driven',
    'observability',
    'rollback',
    'market-entry',
    'root cause',
  ]
  const optimizerLane = deepSignals.some((signal) => normalized.includes(signal))
    ? 'DEEP'
    : 'INTERACTIVE'
  const templateSlug = inferTemplateSlug(rawIdea, taskType)
  const outputKind: DesktopOutputKind = taskType === 'CODING' ? 'CODING_BRIEF' : 'SUPER_PROMPT'
  const reasons = [
    `Task type inferred as ${taskType}.`,
    optimizerLane === 'DEEP'
      ? 'Deep lane suggested because the prompt asks for richer analysis or trade-offs.'
      : 'Interactive lane suggested because the prompt looks execution-first and short-horizon.',
    outputKind === 'CODING_BRIEF'
      ? 'Coding Brief output selected because the task type is CODING.'
      : 'Super Prompt output selected.',
  ]

  if (templateSlug) {
    reasons.push(`Template hint: ${templateSlug}.`)
  }

  return {
    taskType,
    optimizerLane,
    templateSlug,
    outputKind,
    reasons,
  }
}

function joinArgs(parts: string[]) {
  const value = parts.join(' ').trim()
  return value ? [value] : []
}

function parseConsoleInput(inputValue: string): ParsedConsoleInput {
  const value = inputValue.trim()

  if (!value.startsWith('/')) {
    return { kind: 'prompt', value }
  }

  const [rawCommand = '', ...rest] = value.slice(1).split(/\s+/)
  const subcommand = rest[0]

  if (rawCommand === 'help') {
    return { kind: 'command', command: 'help.show', args: [] }
  }

  if (rawCommand === 'evaluate') {
    return { kind: 'command', command: 'evaluate', args: joinArgs(rest) }
  }

  if (rawCommand === 'recent') {
    return { kind: 'command', command: 'recent.list', args: [] }
  }

  if ((rawCommand === 'draft' || rawCommand === 'drafts') && subcommand === 'save') {
    return { kind: 'command', command: 'draft.save', args: [] }
  }

  if (rawCommand === 'benchmark' && subcommand === 'run') {
    return {
      kind: 'command',
      command: 'benchmark.run',
      args: rest.slice(1),
    }
  }

  if (rawCommand === 'benchmark' && subcommand === 'save') {
    return { kind: 'command', command: 'benchmark.save', args: [] }
  }

  if (rawCommand === 'benchmark') {
    return { kind: 'command', command: 'benchmark.list', args: [] }
  }

  if (rawCommand === 'library' && subcommand === 'search') {
    return {
      kind: 'command',
      command: 'library.search',
      args: joinArgs(rest.slice(1)),
    }
  }

  if (rawCommand === 'library') {
    return { kind: 'command', command: 'library.list', args: [] }
  }

  if (rawCommand === 'templates') {
    return {
      kind: 'command',
      command: 'templates.list',
      args: rest[0] === 'list' ? rest.slice(1) : rest,
    }
  }

  if (rawCommand === 'provider' && subcommand === 'save') {
    return {
      kind: 'command',
      command: 'provider.save',
      args: rest.slice(1),
    }
  }

  if (rawCommand === 'provider' && subcommand === 'delete') {
    return {
      kind: 'command',
      command: 'provider.delete',
      args: rest.slice(1),
    }
  }

  if (rawCommand === 'provider') {
    return { kind: 'command', command: 'provider.list', args: [] }
  }

  if (rawCommand === 'usage') {
    return { kind: 'command', command: 'usage.summary', args: [] }
  }

  if (rawCommand === 'subscription' && subcommand === 'upgrade') {
    return {
      kind: 'command',
      command: 'subscription.upgrade',
      args: rest.slice(1),
    }
  }

  if (rawCommand === 'auth' && subcommand === 'login') {
    return {
      kind: 'command',
      command: 'auth.login',
      args: rest.slice(1),
    }
  }

  if (rawCommand === 'auth' && subcommand === 'register') {
    return {
      kind: 'command',
      command: 'auth.register',
      args: rest.slice(1),
    }
  }

  if (rawCommand === 'auth' && subcommand === 'logout') {
    return {
      kind: 'command',
      command: 'auth.logout',
      args: [],
    }
  }

  return {
    kind: 'command',
    command: 'library.search',
    args: joinArgs([rawCommand, ...rest]),
  }
}

function normalizeRecentRuns(payload: unknown): DesktopRecentRunRecord[] {
  if (!isObjectRecord(payload) || !Array.isArray(payload.recentRuns)) {
    return []
  }

  return payload.recentRuns.filter(
    (item): item is DesktopRecentRunRecord =>
      isObjectRecord(item) &&
      typeof item.id === 'string' &&
      typeof item.rawInput === 'string' &&
      typeof item.outputText === 'string' &&
      (item.sourceMode === 'transform' ||
        item.sourceMode === 'optimize' ||
        item.sourceMode === 'evaluate')
  )
}

/**
 * Today's Coding Briefs by outcome, from the stored runs. Only records that carry an
 * output kind and a quality verdict are counted, so the numbers are never inferred.
 */
function countTodaysBriefs(recentRuns: DesktopRecentRunRecord[], now = new Date()): BriefCounts {
  const today = now.toDateString()
  const counts: BriefCounts = { total: 0, complete: 0, needsCheck: 0 }

  for (const record of recentRuns) {
    if (record.sourceMode !== 'optimize' || record.outputKind !== 'CODING_BRIEF') continue
    if (!record.quality || typeof record.createdAt !== 'string') continue
    const createdAt = new Date(record.createdAt)
    if (Number.isNaN(createdAt.getTime()) || createdAt.toDateString() !== today) continue
    counts.total += 1
    // A thin brief is valid but never complete (§8.3): the user still owes two answers.
    if (record.quality.degraded || record.quality.thin) {
      counts.needsCheck += 1
    } else if (record.quality.complete) {
      counts.complete += 1
    }
  }

  return counts
}

function normalizeBenchmarkRecords(payload: unknown): DesktopBenchmarkRecord[] {
  if (!isObjectRecord(payload) || !Array.isArray(payload.benchmarks)) {
    return []
  }

  return payload.benchmarks.filter(
    (item): item is DesktopBenchmarkRecord =>
      isObjectRecord(item) &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.prompt === 'string' &&
      Array.isArray(item.lanes) &&
      item.lanes.every((lane) => lane === 'INTERACTIVE' || lane === 'DEEP')
  )
}

function buildCompareGroups(recentRuns: DesktopRecentRunRecord[]) {
  const groups = new Map<string, DesktopRecentRunRecord[]>()

  for (const item of recentRuns) {
    const key = item.rawInput.trim()
    if (!key) {
      continue
    }

    const entries = groups.get(key) ?? []
    entries.push(item)
    groups.set(key, entries)
  }

  return Array.from(groups.values()).filter(
    (items) =>
      items.some((item) => item.sourceMode === 'transform') &&
      items.some((item) => item.sourceMode === 'optimize')
  )
}

async function appendRecentRunToWorkspace(record: DesktopRecentRunRecord) {
  await desktopWindow.sentraDesktop?.invoke?.('workspace:recent:append', {
    id: record.id,
    sourceMode: record.sourceMode,
    rawInput: record.rawInput,
    outputText: record.outputText,
    ...(record.outputKind && { outputKind: record.outputKind }),
    ...(record.quality && { quality: record.quality }),
  })
}

/** The stored fields the startup counts need, read from an optimize response's metadata. */
function readRunOutcome(response: unknown): Pick<DesktopRecentRunRecord, 'outputKind' | 'quality'> {
  const metadata = isObjectRecord(response) && isObjectRecord(response.metadata) ? response.metadata : null
  const quality = metadata && isObjectRecord(metadata.quality) ? metadata.quality : null
  return {
    ...(metadata?.outputKind === 'SUPER_PROMPT' || metadata?.outputKind === 'CODING_BRIEF'
      ? { outputKind: metadata.outputKind }
      : {}),
    ...(quality && typeof quality.complete === 'boolean' && typeof quality.degraded === 'boolean'
      ? {
          quality: {
            complete: quality.complete,
            degraded: quality.degraded,
            ...(quality.thin === true && { thin: true }),
          },
        }
      : {}),
  }
}

/** Re-issue a stored run as the console command that would have produced it. */
function buildRerunCommand(sourceMode: DesktopRunSourceMode, rawInput: string) {
  if (sourceMode === 'transform') {
    return `transform ${rawInput}`
  }

  return suggestOptimizerConfig(rawInput).outputKind === 'CODING_BRIEF'
    ? `brief ${rawInput}`
    : `super ${rawInput}`
}

async function rerunRecentRecord(record: DesktopRecentRunRecord) {
  if (!input || isExecuting) {
    return
  }

  input.value =
    record.sourceMode === 'evaluate'
      ? `/evaluate ${record.rawInput}`
      : buildRerunCommand(record.sourceMode, record.rawInput)

  input.focus()
  await execute()
}

async function evaluateRecentRecord(record: DesktopRecentRunRecord) {
  if (!display || isExecuting) {
    return
  }

  setExecutionState(true)
  const started = Date.now()
  appendConsoleLine(display, 'user', '/evaluate saved output')
  appendConsoleLine(display, 'sys', strings.evaluatorPending)

  try {
    const result = await desktopWindow.sentraDesktop?.invoke?.('desktop:command', {
      command: 'evaluate:run',
      payload: {
        promptText: record.outputText,
        provider: requireActiveDesktopProvider(),
      },
    })
    const formattedText = formatDesktopResult(result)

    appendConsoleLine(display, 'agent', formattedText)
    await appendRecentRunToWorkspace({
      id: crypto.randomUUID(),
      sourceMode: 'evaluate',
      rawInput: record.outputText,
      outputText: formattedText,
    })
    appendConsoleLine(
      display,
      'sys',
      strings.evaluationFinishedIn(Math.round((Date.now() - started) / 1000))
    )
  } catch (error) {
    appendConsoleLine(display, 'sys', `[ERROR] ${formatDesktopErrorMessage(error)}`)
  } finally {
    setExecutionState(false)
    input?.focus()
  }
}

async function runBenchmarkRecord(record: DesktopBenchmarkRecord) {
  if (!display || isExecuting) {
    return
  }

  setExecutionState(true)
  const started = Date.now()
  appendConsoleLine(display, 'user', `/benchmark run ${record.id}`)
  appendConsoleLine(display, 'sys', strings.benchmarkPending)

  try {
    const result = await desktopWindow.sentraDesktop?.invoke?.('desktop:command', {
      command: 'benchmark:run',
      payload: {
        id: record.id,
        provider: requireActiveDesktopProvider(),
      },
    })

    appendConsoleLine(display, 'agent', formatDesktopResult(result))
    appendConsoleLine(
      display,
      'sys',
      strings.benchmarkFinishedIn(Math.round((Date.now() - started) / 1000))
    )
  } catch (error) {
    appendConsoleLine(display, 'sys', `[ERROR] ${formatDesktopErrorMessage(error)}`)
  } finally {
    setExecutionState(false)
    input?.focus()
  }
}

function buildTransformInvocation(value: string): DesktopInvocation {
  return {
    channel: 'desktop:command',
    payload: {
      command: 'transform:run',
      payload: {
        prompt: value,
        model: 'claude-sonnet',
        mode: 'professional',
        temperature: 0.7,
        maxTokens: EFFORT_MAX_TOKENS[currentEffortLevel],
        locale: 'id',
        profile: currentCompilerProfile === 'default' ? undefined : currentCompilerProfile,
        effort: currentEffortLevel,
        target: 'general',
      },
    },
  }
}

function buildOptimizeInvocation(
  value: string,
  outputKind: DesktopOutputKind,
  requestId?: string,
  refinement?: CodingBriefRefinementPayload
): DesktopInvocation {
  const suggestion = suggestOptimizerConfig(value)
  const provider = requireActiveDesktopProvider()

  return {
    channel: 'desktop:command',
    payload: {
      command: 'optimize:run',
      payload: {
        rawIdea: value,
        taskType: suggestion.taskType,
        tone: 'PROFESSIONAL',
        format: 'STRUCTURED',
        targetLlm: provider,
        provider,
        optimizerLane: currentOptimizerLane,
        outputKind,
        requestId,
        ...(refinement && { refinement }),
      },
    },
  }
}

function buildCommandInvocation(
  parsed: Extract<ParsedConsoleInput, { kind: 'command' }>
): DesktopInvocation {
  if (parsed.command === 'evaluate') {
    const provider = requireActiveDesktopProvider()
    return {
      channel: 'desktop:command',
      payload: {
        command: 'evaluate:run',
        payload: {
          promptText: parsed.args[0] ?? '',
          provider,
        },
      },
    }
  }

  if (parsed.command === 'library.list') {
    return {
      channel: 'desktop:command',
      payload: {
        command: 'library:list',
        payload: {},
      },
    }
  }

  if (parsed.command === 'library.search') {
    return {
      channel: 'desktop:command',
      payload: {
        command: 'library:search',
        payload: {
          search: parsed.args[0] ?? '',
        },
      },
    }
  }

  if (parsed.command === 'library.save') {
    if (!lastRunRecord) {
      throw new Error(strings.noOutputForLibrary)
    }

    return {
      channel: 'desktop:command',
      payload: {
        command: 'library:save',
        payload: {
          rawInput: lastRunRecord.rawInput,
          optimizedText: lastRunRecord.outputText,
          taskType: lastRunRecord.taskType,
          tone: lastRunRecord.tone,
          format: lastRunRecord.format,
          targetLlm: lastRunRecord.targetLlm,
          tags: [lastRunRecord.sourceMode],
        },
      },
    }
  }

  if (parsed.command === 'draft.list') {
    return {
      channel: 'workspace:draft:list',
    }
  }

  if (parsed.command === 'draft.save') {
    if (!lastRunRecord) {
      throw new Error(strings.noOutputForDraft)
    }

    return {
      channel: 'desktop:command',
      payload: {
        command: 'draft:save',
        payload: {
          id: `draft-${lastRunRecord.id}`,
          rawInput: lastRunRecord.rawInput,
          optimizedText: lastRunRecord.outputText,
          sourceMode: lastRunRecord.sourceMode,
        },
      },
    }
  }

  if (parsed.command === 'benchmark.list') {
    return {
      channel: 'desktop:command',
      payload: {
        command: 'benchmark:list',
        payload: {},
      },
    }
  }

  if (parsed.command === 'benchmark.save') {
    if (!lastRunRecord) {
      throw new Error(strings.noOutputForBenchmark)
    }

    return {
      channel: 'desktop:command',
      payload: {
        command: 'benchmark:save',
        payload: {
          id: `bench-${lastRunRecord.id}`,
          title: lastRunRecord.rawInput.slice(0, 72),
          prompt: lastRunRecord.rawInput,
          taskType: lastRunRecord.taskType,
          tone: lastRunRecord.tone,
          format: lastRunRecord.format,
          optimizerLane: lastRunRecord.optimizerLane ?? 'INTERACTIVE',
        },
      },
    }
  }

  if (parsed.command === 'benchmark.run') {
    const benchmarkId = parsed.args[0]?.trim()

    if (!benchmarkId) {
      throw new Error(strings.benchmarkRunNeedsId)
    }
    const provider = requireActiveDesktopProvider()

    return {
      channel: 'desktop:command',
      payload: {
        command: 'benchmark:run',
        payload: {
          id: benchmarkId,
          provider,
        },
      },
    }
  }

  if (parsed.command === 'templates.list') {
    return {
      channel: 'desktop:command',
      payload: {
        command: 'templates:list',
        payload: parsed.args[0] ? { category: parsed.args[0].toUpperCase() } : {},
      },
    }
  }

  if (parsed.command === 'provider.list') {
    return {
      channel: 'desktop:command',
      payload: {
        command: 'provider:list',
        payload: {},
      },
    }
  }

  if (parsed.command === 'provider.save') {
    return {
      channel: 'desktop:command',
      payload: {
        command: 'provider:save',
        payload: {
          provider: (parsed.args[0] ?? '').toUpperCase(),
          apiKey: parsed.args.slice(1).join(' '),
        },
      },
    }
  }

  if (parsed.command === 'provider.delete') {
    return {
      channel: 'desktop:command',
      payload: {
        command: 'provider:delete',
        payload: {
          provider: (parsed.args[0] ?? '').toUpperCase(),
        },
      },
    }
  }

  if (parsed.command === 'usage.summary') {
    return {
      channel: 'desktop:command',
      payload: {
        command: 'usage:summary',
        payload: {},
      },
    }
  }

  if (parsed.command === 'subscription.upgrade') {
    return {
      channel: 'desktop:command',
      payload: {
        command: 'subscription:upgrade',
        payload: {
          tier: (parsed.args[0] ?? 'PRO').toUpperCase(),
          interval: (parsed.args[1] ?? 'MONTHLY').toUpperCase(),
        },
      },
    }
  }

  if (parsed.command === 'auth.login') {
    return {
      channel: 'auth:login',
      payload: {
        email: parsed.args[0] ?? '',
        password: parsed.args.slice(1).join(' '),
      },
    }
  }

  if (parsed.command === 'auth.register') {
    return {
      channel: 'auth:register',
      payload: {
        email: parsed.args[1] ?? '',
        password: parsed.args.slice(2).join(' '),
        options: {
          data: {
            name: parsed.args[0] ?? '',
          },
        },
      },
    }
  }

  if (parsed.command === 'auth.logout') {
    return {
      channel: 'auth:logout',
      payload: undefined,
    }
  }

  throw new Error(strings.unsupportedCommand(parsed.command))
}

function extractCopyableText(formattedText: string): string {
  let text = formattedText
  text = text.replace(/^# (?:Optimized|Transformed) Prompt\n\n/, '')
  // The meta flag line and the quality line close the result; neither is part of the prompt.
  const lines = text.trimEnd().split('\n')
  while (lines.length > 1 && isTrailingResultLine(lines[lines.length - 1])) {
    lines.pop()
  }
  return lines.join('\n').trim()
}

/**
 * Actions render as plain-text buttons on their own transcript line: real `<button>`
 * elements so they stay keyboard reachable, with the spoken name in `aria-label`.
 */
function createActionButton(
  label: string,
  ariaLabel: string,
  handler: (button: HTMLButtonElement) => Promise<void> | void
) {
  const button = document.createElement('button')
  button.className = 'tx-action'
  button.type = 'button'
  button.textContent = label
  button.setAttribute('aria-label', ariaLabel)
  button.addEventListener('click', () => {
    if (button.disabled) {
      return
    }

    const maybePromise = handler(button)
    if (maybePromise instanceof Promise) {
      void maybePromise
    }
  })

  return button
}

interface ConsoleAction {
  label: string
  ariaLabel: string
  handler: (button: HTMLButtonElement) => Promise<void> | void
}

function buildActionLine(actions: ConsoleAction[]) {
  const row = document.createElement('div')
  row.className = 'line tx-actions'

  for (const action of actions) {
    row.appendChild(createActionButton(action.label, action.ariaLabel, action.handler))
  }

  return row
}

function appendActionLine(container: HTMLElement, actions: ConsoleAction[]) {
  const row = buildActionLine(actions)
  insertBeforePrompt(container, row)
  container.scrollTop = container.scrollHeight
  return row
}

/** Wraps a save handler in the transient `Saving... / Saved / Failed` button states. */
function withTransientSaveState(
  label: string,
  run: () => Promise<string>
): (button: HTMLButtonElement) => Promise<void> {
  return async (button) => {
    if (!desktopWindow.sentraDesktop?.invoke || !display) {
      return
    }

    button.disabled = true
    button.textContent = strings.transientSaving

    try {
      const note = await run()
      button.textContent = strings.transientSaved
      appendConsoleLine(display, 'sys', note)
    } catch (error) {
      button.textContent = strings.transientFailed
      appendConsoleLine(display, 'sys', `[ERROR] ${formatDesktopErrorMessage(error)}`)
    } finally {
      window.setTimeout(() => {
        button.disabled = false
        button.textContent = label
      }, 1500)
    }
  }
}

function buildResultActions(copyText: string, runRecord?: DesktopRunRecord): ConsoleAction[] {
  const actions: ConsoleAction[] = [
    {
      label: strings.actionCopyLabel,
      ariaLabel: strings.actionCopyAria,
      handler: (button) => {
        navigator.clipboard
          .writeText(extractCopyableText(copyText))
          .then(() => {
            button.textContent = strings.actionCopiedLabel
            window.setTimeout(() => {
              button.textContent = strings.actionCopyLabel
            }, 1500)
          })
          .catch(() => {
            button.textContent = strings.actionCopyFailedLabel
          })
      },
    },
  ]

  if (!runRecord) {
    return actions
  }

  actions.push({
    label: strings.actionRerunLabel,
    ariaLabel: strings.actionRerunAria,
    handler: () => {
      if (!input || isExecuting) {
        return
      }

      // A clicked rerun is not a typed answer (D2): it ends a pending round first.
      if (pendingClarificationRound && display) {
        pendingClarificationRound = null
        appendConsoleLine(display, 'sys', strings.clarificationSkipped)
      }

      currentProvider = runRecord.targetLlm
      if (runRecord.sourceMode === 'optimize' && runRecord.optimizerLane) {
        updateOptimizerLane(runRecord.optimizerLane)
      }

      input.value = buildRerunCommand(runRecord.sourceMode, runRecord.rawInput)
      input.focus()
      void execute()
    },
  })

  actions.push({
    label: strings.actionEvaluateLabel,
    ariaLabel: strings.actionEvaluateAria,
    handler: async (button) => {
      if (!desktopWindow.sentraDesktop?.invoke || !display || isExecuting) {
        return
      }

      button.disabled = true
      button.textContent = strings.transientRunning
      setExecutionState(true)

      const started = Date.now()
      appendConsoleLine(display, 'user', '/evaluate saved output')
      appendConsoleLine(display, 'sys', strings.evaluatorPending)

      try {
        const result = await desktopWindow.sentraDesktop.invoke('desktop:command', {
          command: 'evaluate:run',
          payload: {
            promptText: runRecord.outputText,
            provider: runRecord.targetLlm,
          },
        })

        appendConsoleLine(display, 'agent', formatDesktopResult(result))
        appendConsoleLine(
          display,
          'sys',
          strings.evaluationFinishedIn(Math.round((Date.now() - started) / 1000))
        )
      } catch (error) {
        appendConsoleLine(display, 'sys', `[ERROR] ${formatDesktopErrorMessage(error)}`)
      } finally {
        setExecutionState(false)
        button.disabled = false
        button.textContent = strings.actionEvaluateLabel
        input?.focus()
      }
    },
  })

  actions.push({
    label: strings.actionLibraryLabel,
    ariaLabel: strings.actionLibraryAria,
    handler: withTransientSaveState(strings.actionLibraryLabel, async () => {
      const result = await desktopWindow.sentraDesktop?.invoke?.('desktop:command', {
        command: 'library:save',
        payload: {
          rawInput: runRecord.rawInput,
          optimizedText: runRecord.outputText,
          taskType: runRecord.taskType,
          tone: runRecord.tone,
          format: runRecord.format,
          targetLlm: runRecord.targetLlm,
          tags: [runRecord.sourceMode],
        },
      })
      const promptId =
        isObjectRecord(result) &&
        isObjectRecord(result.prompt) &&
        typeof result.prompt.id === 'string'
          ? result.prompt.id
          : 'saved'

      return strings.libraryItemCreatedNotice(promptId)
    }),
  })
  return actions
}

function buildOptimizePromptText(superPrompt: Record<string, unknown>) {
  const fullPrompt = typeof superPrompt.fullPrompt === 'string' ? superPrompt.fullPrompt.trim() : ''

  if (fullPrompt) {
    return fullPrompt
  }

  const sections: string[] = []

  if (typeof superPrompt.role === 'string' && superPrompt.role.trim()) {
    sections.push(`## ROLE\n${superPrompt.role.trim()}`)
  }
  if (typeof superPrompt.task === 'string' && superPrompt.task.trim()) {
    sections.push(`## TASK\n${superPrompt.task.trim()}`)
  }
  if (typeof superPrompt.context === 'string' && superPrompt.context.trim()) {
    sections.push(`## CONTEXT\n${superPrompt.context.trim()}`)
  }
  if (Array.isArray(superPrompt.constraints) && superPrompt.constraints.length > 0) {
    const lines = superPrompt.constraints
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((item) => `- ${item.trim()}`)

    if (lines.length > 0) {
      sections.push(`## CONSTRAINTS\n${lines.join('\n')}`)
    }
  }
  if (typeof superPrompt.formatSpec === 'string' && superPrompt.formatSpec.trim()) {
    sections.push(`## OUTPUT FORMAT\n${superPrompt.formatSpec.trim()}`)
  }

  return sections.join('\n\n').trim()
}

function buildRunRecord(
  mode: DesktopRunSourceMode,
  rawInput: string,
  result: unknown,
  requestId = crypto.randomUUID()
): DesktopRunRecord | null {
  if (mode === 'transform' && isObjectRecord(result)) {
    const transformedPrompt =
      typeof result.transformedPrompt === 'string' ? result.transformedPrompt.trim() : ''

    if (!transformedPrompt) {
      return null
    }

    return {
      id: requestId,
      rawInput,
      outputText: transformedPrompt,
      sourceMode: 'transform',
      taskType: suggestOptimizerConfig(rawInput).taskType,
      tone: 'PROFESSIONAL',
      format: 'STRUCTURED',
      targetLlm: currentProvider ?? 'OPENAI',
    }
  }

  if (mode === 'optimize' && isObjectRecord(result) && isObjectRecord(result.superPrompt)) {
    const outputText = buildOptimizePromptText(result.superPrompt)

    if (!outputText) {
      return null
    }

    const metadata = isObjectRecord(result.metadata) ? result.metadata : {}
    const targetLlm =
      typeof metadata.provider === 'string'
        ? (metadata.provider as DesktopLLMProvider)
        : (currentProvider ?? 'OPENAI')

    return {
      id: requestId,
      rawInput,
      outputText,
      sourceMode: 'optimize',
      taskType:
        typeof metadata.taskType === 'string'
          ? metadata.taskType
          : suggestOptimizerConfig(rawInput).taskType,
      tone: typeof metadata.tone === 'string' ? metadata.tone : 'PROFESSIONAL',
      format: typeof metadata.format === 'string' ? metadata.format : 'STRUCTURED',
      targetLlm,
      optimizerLane: currentOptimizerLane,
    }
  }

  return null
}

const STATUS_PREFIX_PATTERN =
  /^\[(DONE|SAVED|DRAFT|BENCHMARK|BOOT|INFO|WORKBENCH|WAIT|STATE|WARN|ERROR)\]\s*/

/**
 * Result status lines carry an ok / warn / error prefix rendered by CSS (`::before`),
 * so the legacy `[TAG]` marker is stripped from the text and mapped to a class.
 */
function applyStatusPrefix(line: HTMLElement, text: string): string {
  const match = STATUS_PREFIX_PATTERN.exec(text)
  if (!match) {
    return text
  }

  const tag = match[1]
  const status =
    tag === 'ERROR'
      ? 'error'
      : tag === 'WAIT' || tag === 'STATE' || tag === 'WARN'
        ? 'warn'
        : 'ok'
  line.classList.add(`status-${status}`)
  return text.slice(match[0].length)
}

/**
 * The prompt line is the transcript's last line, so every emitted line is inserted
 * before it rather than appended.
 */
function insertBeforePrompt(container: HTMLElement, node: HTMLElement) {
  if (promptLine && promptLine.parentNode === container) {
    container.insertBefore(node, promptLine)
    return
  }

  container.appendChild(node)
}

// A path: optional @, one or more `dir/` segments, then a file name or glob (may be empty
// after a trailing slash). Not preceded by a path or URL character, so URLs stay plain.
const PATH_PATTERN = /(?<![\w:/.\-@])(@?(?:[\w.\-]+\/)+)([\w.\-*]*)/g
// A bare file name with a source-like extension, e.g. `engine.ts` or `README.md`.
const FILE_PATTERN =
  /(?<![\w:/.\-@])[\w\-]+\.(?:ts|tsx|js|jsx|mjs|cjs|json|md|css|html|py|yml|yaml|toml|sh|ps1|sql|prisma)\b/g

function appendRun(line: HTMLElement, text: string, tone?: string) {
  if (!text) return
  if (!tone) {
    line.appendChild(document.createTextNode(text))
    return
  }
  const span = document.createElement('span')
  span.className = `seg-${tone}`
  span.textContent = text
  line.appendChild(span)
}

/** Colour every path in `text`: directories blue and bold, the file name bright. */
function appendPathRuns(line: HTMLElement, text: string) {
  let cursor = 0
  const matches: Array<{ start: number; end: number; dir: string; file: string }> = []
  for (const match of text.matchAll(PATH_PATTERN)) {
    // Sentence punctuation after a path is not part of the file name.
    let file = match[2]
    while (file.endsWith('.')) file = file.slice(0, -1)
    matches.push({ start: match.index, end: match.index + match[1].length + file.length, dir: match[1], file })
  }
  for (const match of text.matchAll(FILE_PATTERN)) {
    const start = match.index
    if (matches.some((item) => start >= item.start && start < item.end)) continue
    matches.push({ start, end: start + match[0].length, dir: '', file: match[0] })
  }
  matches.sort((a, b) => a.start - b.start)
  for (const match of matches) {
    if (match.start < cursor) continue
    appendRun(line, text.slice(cursor, match.start))
    appendRun(line, match.dir, 'dir')
    appendRun(line, match.file, 'file')
    cursor = match.end
  }
  appendRun(line, text.slice(cursor))
}

/**
 * Render a result body as coloured runs inside one line element, as the pixel reference
 * shows a brief: `## HEADING` lines in the heading colour, paths with the directory blue
 * and the file bright, backticked runs green (a backticked path keeps the path colours).
 * The DOM text stays identical to the plain body, so copying is unchanged.
 */
function renderBodyRuns(line: HTMLElement, body: string) {
  line.replaceChildren()
  const rows = body.split('\n')
  rows.forEach((row, index) => {
    if (/^#{1,6} \S/.test(row)) {
      appendRun(line, row, 'heading')
    } else {
      let cursor = 0
      for (const match of row.matchAll(/`([^`\n]+)`/g)) {
        appendPathRuns(line, row.slice(cursor, match.index))
        const inner = match[1]
        const pathOnly = new RegExp(`^${PATH_PATTERN.source}$`).test(inner) || new RegExp(`^${FILE_PATTERN.source}$`).test(inner)
        if (pathOnly) {
          appendPathRuns(line, match[0])
        } else {
          appendRun(line, match[0], 'cmd')
        }
        cursor = match.index + match[0].length
      }
      appendPathRuns(line, row.slice(cursor))
    }
    if (index < rows.length - 1) {
      line.appendChild(document.createTextNode('\n'))
    }
  })
}

function appendConsoleLine(
  container: HTMLElement,
  type: 'sys' | 'user' | 'agent',
  text: string,
  options: AppendConsoleLineOptions = {}
) {
  const line = document.createElement('div')
  line.className = `line type-${type}`

  if (type === 'agent') {
    const { body, trailing } = splitTrailingResultLines(text)
    renderBodyRuns(line, body)
    insertBeforePrompt(container, line)
    const anchor = appendTrailingResultLines(line, trailing)
    const copyText = options.copyText ?? text
    lastCopyText = copyText
    const actionRow = buildActionLine(buildResultActions(copyText, options.runRecord))
    anchor.insertAdjacentElement('afterend', actionRow)
  } else {
    line.textContent = type === 'sys' ? applyStatusPrefix(line, text) : text
    insertBeforePrompt(container, line)
  }

  container.scrollTop = container.scrollHeight
  return line
}

function isBlankLine(element: Element | null): boolean {
  return (
    element instanceof HTMLElement &&
    element.classList.contains('line') &&
    (element.classList.contains('blank-line') || element.classList.contains('banner-blank'))
  )
}

function createBlankLine() {
  const line = document.createElement('div')
  line.className = 'line blank-line'
  line.textContent = strings.bannerBlank
  return line
}

/**
 * Exactly one blank line between blocks: appends a blank line before the prompt unless the
 * previous line already is one, so no path through the shell can print two in a row.
 */
function appendBlankLine(container: HTMLElement) {
  const last =
    promptLine && promptLine.parentNode === container
      ? promptLine.previousElementSibling
      : container.lastElementChild

  if (isBlankLine(last)) {
    return last as HTMLElement
  }

  const line = createBlankLine()
  insertBeforePrompt(container, line)
  container.scrollTop = container.scrollHeight
  return line
}

/** Dim settings line; never a verdict. */
function appendMetaLine(container: HTMLElement, text: string) {
  const line = document.createElement('div')
  line.className = 'line type-sys meta-line'
  line.textContent = text
  insertBeforePrompt(container, line)
  container.scrollTop = container.scrollHeight
  return line
}

/** Banner rows carry no status prefix; they are chrome, not verdicts. */
function appendBannerLine(container: HTMLElement, cls: string, text: string) {
  const line = document.createElement('div')
  line.className = `line banner-${cls}`
  line.textContent = text
  insertBeforePrompt(container, line)
  container.scrollTop = container.scrollHeight
  return line
}

type SegmentTone = 'bright' | 'dim' | 'label' | 'cmd'

interface BannerSegment {
  text: string
  tone?: SegmentTone
}

/** A banner row made of coloured runs (title + dim version, cyan labels, green commands). */
function appendBannerSegments(container: HTMLElement, cls: string, segments: BannerSegment[]) {
  const line = document.createElement('div')
  line.className = `line banner-${cls}`
  for (const segment of segments) {
    if (!segment.tone) {
      line.appendChild(document.createTextNode(segment.text))
      continue
    }
    const span = document.createElement('span')
    span.className = `seg-${segment.tone}`
    span.textContent = segment.text
    line.appendChild(span)
  }
  insertBeforePrompt(container, line)
  container.scrollTop = container.scrollHeight
  return line
}

interface TwoColumnPair {
  label: string
  value: string
  labelTone: SegmentTone
  valueTone?: SegmentTone
}

/**
 * Two columns of label/value pairs, as in the startup reference: labels padded to the
 * longest label in their column plus three spaces, the right column starting at a fixed
 * screen column. Rows are zipped; a column that runs out leaves its half empty.
 */
function buildTwoColumnRows(
  left: TwoColumnPair[],
  right: TwoColumnPair[],
  rightColumn: number
): BannerSegment[][] {
  const labelWidth = (pairs: TwoColumnPair[]) =>
    Math.max(0, ...pairs.map((pair) => pair.label.length)) + 3
  const leftWidth = labelWidth(left)
  const rightWidth = labelWidth(right)
  const rows: BannerSegment[][] = []

  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const segments: BannerSegment[] = []
    let column = LABEL_COLUMNS[0]
    const leftPair = left[index]
    const rightPair = right[index]

    if (leftPair) {
      segments.push({ text: leftPair.label, tone: leftPair.labelTone })
      segments.push({ text: ' '.repeat(leftWidth - leftPair.label.length) })
      segments.push({ text: leftPair.value, tone: leftPair.valueTone })
      column += leftWidth + leftPair.value.length
    }
    if (rightPair) {
      segments.push({ text: ' '.repeat(Math.max(2, rightColumn - column)) })
      segments.push({ text: rightPair.label, tone: rightPair.labelTone })
      segments.push({ text: ' '.repeat(rightWidth - rightPair.label.length) })
      segments.push({ text: rightPair.value, tone: rightPair.valueTone })
    }
    rows.push(segments)
  }

  return rows
}

/** Right column of the session block: screen column 40, as in the startup reference. */
const SESSION_RIGHT_COLUMN = 40
/** Right column of the command hint block: screen column 31, as in the startup reference. */
const HINT_RIGHT_COLUMN = 31

/**
 * The session block rows, from real state only. A field the shell does not have (no
 * provider loaded, model still unresolved) is left out; nothing is ever a placeholder.
 * There is no agent setting in the shell, so the reference's `agent` row is not printed.
 */
function buildSessionPairs(): { left: TwoColumnPair[]; right: TwoColumnPair[] } {
  const left: TwoColumnPair[] = []
  const right: TwoColumnPair[] = []

  if (currentProvider) {
    left.push({ label: strings.sessionLabelProvider, value: currentProvider.toLowerCase(), labelTone: 'label' })
  }
  const modelKnown =
    currentModelLabel.trim().length > 0 &&
    currentModelLabel !== 'provider-resolving' &&
    !/(^|\/)(model|env)-required$/.test(currentModelLabel)
  if (currentProvider && modelKnown) {
    left.push({ label: strings.sessionLabelModel, value: currentModelLabel, labelTone: 'label' })
  }
  right.push({ label: strings.sessionLabelLane, value: currentOptimizerLane.toLowerCase(), labelTone: 'label' })
  right.push({ label: strings.sessionLabelProfile, value: currentCompilerProfile, labelTone: 'label' })
  right.push({ label: strings.sessionLabelEffort, value: currentEffortLevel, labelTone: 'label' })

  return { left, right }
}

/**
 * Everything below the rule on the startup screen (reference-console-startup.html):
 * session block, instruction, two example commands, command hints, then the `ok` lines.
 * Printed once the shell state is known, and again after `clear`.
 */
function printStartupBlock(container: HTMLElement) {
  const { left, right } = buildSessionPairs()
  for (const row of buildTwoColumnRows(left, right, SESSION_RIGHT_COLUMN)) {
    appendBannerSegments(container, 'session', row)
  }
  appendBlankLine(container)

  appendBannerLine(container, 'hint', strings.startupInstruction)
  appendBlankLine(container)

  for (const example of strings.startupExamples) {
    appendBannerSegments(container, 'example', [
      { text: example.command, tone: 'cmd' },
      { text: ' ' },
      { text: example.argument, tone: 'dim' },
    ])
  }
  appendBlankLine(container)

  const toHintPair = (hint: [string, string]): TwoColumnPair => ({
    label: hint[0],
    value: hint[1],
    labelTone: 'cmd',
    valueTone: 'dim',
  })
  const hintRows = buildTwoColumnRows(
    strings.startupCommandHints.map((row) => toHintPair(row[0])),
    strings.startupCommandHints.map((row) => toHintPair(row[1])),
    HINT_RIGHT_COLUMN
  )
  for (const row of hintRows) {
    appendBannerSegments(container, 'command', row)
  }
  appendBlankLine(container)

  if (briefCounts) {
    appendConsoleLine(
      container,
      'sys',
      strings.briefCountsLine(briefCounts.total, briefCounts.complete, briefCounts.needsCheck)
    )
  }
  if (providerReadinessStatus === 'ready') {
    appendConsoleLine(container, 'sys', strings.readyLine)
  } else if (providerReadinessStatus === 'missing') {
    appendConsoleLine(container, 'sys', strings.providerMissingBadge)
  }
  appendBlankLine(container)
}


/** Build-time substituted meta tag; empty until the build step fills it in. */
const VERSION_PLACEHOLDER = '__SENTRA_VERSION__'

function readAppVersion(): string {
  const raw = document
    .querySelector('meta[name="sentra-version"]')
    ?.getAttribute('content')
    ?.trim()

  if (!raw || raw === VERSION_PLACEHOLDER) {
    return ''
  }

  return raw
}

function syncOptimizerLaneModelPresentation() {
  const laneState = optimizerLaneStates[currentOptimizerLane]

  if (typeof laneState?.preferredModel === 'string' && laneState.preferredModel.trim()) {
    currentModelLabel = laneState.preferredModel
  }
}

function requireActiveDesktopProvider(): DesktopLLMProvider {
  if (providerReadinessStatus === 'ready' && currentProvider !== null) {
    return currentProvider
  }

  if (providerReadinessStatus === 'resolving') {
    throw new Error(strings.providerResolving)
  }

  throw new Error(strings.providerUnavailable)
}

function setExecutionState(running: boolean) {
  isExecuting = running

  if (input) {
    input.disabled = running || providerReadinessStatus === 'resolving'
  }
}

function buildPendingLabel() {
  if (currentMode === 'transform') {
    return strings.transformPendingLabel
  }

  const laneLabel =
    currentOptimizerLane === 'INTERACTIVE' ? strings.laneLabelInteractive : strings.laneLabelDeep
  return strings.optimizerPendingLabel(
    laneLabel,
    currentProvider ?? 'provider-unavailable',
    currentModelLabel
  )
}

function isOptimizeInvocation(invocation: DesktopInvocation) {
  return (
    invocation.channel === 'desktop:command' &&
    isObjectRecord(invocation.payload) &&
    invocation.payload.command === 'optimize:run' &&
    isObjectRecord(invocation.payload.payload) &&
    typeof invocation.payload.payload.requestId === 'string'
  )
}

function ensureOptimizeStreamLine(container: HTMLElement, requestId: string) {
  const existing = activeOptimizeLines.get(requestId)

  if (existing) {
    return existing
  }

  const line = document.createElement('div')
  line.className = 'line type-agent'
  line.dataset.requestId = requestId
  line.textContent = ''
  insertBeforePrompt(container, line)
  container.scrollTop = container.scrollHeight
  activeOptimizeLines.set(requestId, line)
  return line
}

function ensureOptimizeStatusLine(container: HTMLElement, requestId: string) {
  const existing = activeOptimizeStatusLines.get(requestId)

  if (existing) {
    return existing
  }

  const line = document.createElement('div')
  line.className = 'line type-sys status-warn'
  line.dataset.requestStatusId = requestId
  line.textContent = strings.preparingOptimizer
  insertBeforePrompt(container, line)
  container.scrollTop = container.scrollHeight
  activeOptimizeStatusLines.set(requestId, line)
  return line
}

function removeOptimizeStreamArtifacts(
  requestId: string,
  options: {
    removeStreamLine?: boolean
    removeStatusLine?: boolean
  } = {}
) {
  const streamLine = activeOptimizeLines.get(requestId)
  const statusLine = activeOptimizeStatusLines.get(requestId)

  if (options.removeStreamLine) {
    streamLine?.remove()
    activeOptimizeLines.delete(requestId)
  }

  if (options.removeStatusLine) {
    statusLine?.remove()
    activeOptimizeStatusLines.delete(requestId)
  }
}

function clearOptimizeTransientFailureArtifacts(requestId: string) {
  const streamLine = activeOptimizeLines.get(requestId)

  removeOptimizeStreamArtifacts(requestId, {
    removeStreamLine: streamLine?.textContent?.trim().length === 0,
    removeStatusLine: true,
  })
}

async function executeOptimizeStream(
  invocation: DesktopInvocation,
  requestId: string,
  container: HTMLElement,
  rawInput: string,
  headerMetaLine: HTMLElement | null = null,
  isRefinement = false
) {
  const streamLine = ensureOptimizeStreamLine(container, requestId)
  const statusLine = ensureOptimizeStatusLine(container, requestId)
  const onStream = desktopWindow.sentraDesktop?.onStream
  const offStream = desktopWindow.sentraDesktop?.offStream

  if (!onStream || !offStream) {
    throw new Error(strings.streamBridgeNotReady)
  }

  // ── Scramble decode state (scoped per request) ──
  const SCRAMBLE_INTERVAL_MS = 80
  const DECODE_CHAR_MS = 30
  const DECODE_BUFFER_TIMEOUT_MS = 300

  let activeScrambleLine: HTMLElement | null = null
  let scrambleIntervalId: ReturnType<typeof setInterval> | null = null
  let decodeTimeoutId: ReturnType<typeof setTimeout> | null = null
  let decodeTarget = ''
  let pendingChunks = ''
  let decodeAccumStartMs: number | null = null
  let isDecoding = false

  function clearScramble(): void {
    if (scrambleIntervalId !== null) {
      clearInterval(scrambleIntervalId)
      scrambleIntervalId = null
    }
    if (decodeTimeoutId !== null) {
      clearTimeout(decodeTimeoutId)
      decodeTimeoutId = null
    }
    if (activeScrambleLine) {
      activeScrambleLine.remove()
      activeScrambleLine = null
    }
    decodeTarget = ''
    pendingChunks = ''
    decodeAccumStartMs = null
    isDecoding = false
  }

  function startScramble(): void {
    if (activeScrambleLine) return
    const line = document.createElement('div')
    line.className = 'line scramble-line'
    line.textContent = generateScrambleText(DECODE_TARGET_LENGTH)
    insertBeforePrompt(container, line)
    activeScrambleLine = line
    scrambleIntervalId = setInterval(() => {
      if (activeScrambleLine) {
        activeScrambleLine.textContent = generateScrambleText(DECODE_TARGET_LENGTH)
      }
    }, SCRAMBLE_INTERVAL_MS)
  }

  function startDecode(target: string, onComplete: () => void): void {
    if (!activeScrambleLine) {
      onComplete()
      return
    }
    if (scrambleIntervalId !== null) {
      clearInterval(scrambleIntervalId)
      scrambleIntervalId = null
    }
    isDecoding = true
    const len = target.length
    let revealed = 0

    function step(): void {
      if (!activeScrambleLine) {
        onComplete()
        return
      }
      revealed++
      activeScrambleLine.textContent =
        target.slice(0, revealed) + generateScrambleText(len - revealed)
      if (revealed < len) {
        decodeTimeoutId = setTimeout(step, DECODE_CHAR_MS)
      } else {
        clearScramble()
        onComplete()
      }
    }

    step()
  }

  await new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      offStream('optimize:status', handleStatus)
      offStream('optimize:chunk', handleChunk)
      offStream('optimize:done', handleDone)
      offStream('optimize:error', handleError)
    }

    const handleStatus = (payload: unknown) => {
      if (
        !isObjectRecord(payload) ||
        payload.requestId !== requestId ||
        typeof payload.message !== 'string'
      ) {
        return
      }

      statusLine.textContent = payload.message
      if (payload.stage === 'waiting') {
        startScramble()
      }
      container.scrollTop = container.scrollHeight
    }

    const handleChunk = (payload: unknown) => {
      if (!isObjectRecord(payload)) {
        return
      }

      if (payload.requestId !== requestId || typeof payload.delta !== 'string') {
        return
      }

      // During scramble accumulation phase: buffer chunks, trigger decode when ready
      if (activeScrambleLine && !isDecoding) {
        if (decodeAccumStartMs === null) decodeAccumStartMs = Date.now()
        decodeTarget += payload.delta
        pendingChunks += payload.delta

        const readyByLength = decodeTarget.length >= DECODE_TARGET_LENGTH
        const readyByTimeout = Date.now() - decodeAccumStartMs >= DECODE_BUFFER_TIMEOUT_MS

        if (readyByLength || readyByTimeout) {
          startDecode(decodeTarget.slice(0, DECODE_TARGET_LENGTH), () => {
            streamLine.textContent += pendingChunks
            pendingChunks = ''
            container.scrollTop = container.scrollHeight
          })
        }
        return
      }

      // During decode itself: keep buffering
      if (isDecoding) {
        pendingChunks += payload.delta
        return
      }

      streamLine.textContent += payload.delta
      container.scrollTop = container.scrollHeight
    }

    const handleDone = (payload: unknown) => {
      if (!isObjectRecord(payload) || payload.requestId !== requestId) {
        return
      }

      clearScramble()

      // D3: a refinement still invalid after its repair replaces nothing. The delivered
      // brief above stays the result (copy, rerun and the recent-run store keep it).
      if (isRefinement && isDegradedResponse(payload.response)) {
        streamLine.remove()
        removeOptimizeStreamArtifacts(requestId, { removeStatusLine: true })
        appendConsoleLine(container, 'sys', strings.clarificationRefineFailed)
        cleanup()
        resolve()
        return
      }

      const formattedText = formatDesktopResult(payload.response)
      const { body, trailing } = splitTrailingResultLines(formattedText)
      renderBodyRuns(streamLine, body)
      // The run has one meta block, printed with the echo (reference-console-sentra.html):
      // the settings rows written at the start are completed in place with provider,
      // model and latency, so only the verdict follows the body.
      const metaRows = trailing.filter(isMetaFlagLine)
      const verdictRows = trailing.filter((row) => !isMetaFlagLine(row))
      if (headerMetaLine && metaRows.length > 0) {
        headerMetaLine.textContent = metaRows.join('\n')
      }
      const anchor = appendTrailingResultLines(
        streamLine,
        headerMetaLine ? verdictRows : trailing
      )
      lastCopyText = formattedText
      const runRecord = buildRunRecord('optimize', rawInput, payload.response, requestId)
      if (runRecord) {
        lastRunRecord = runRecord
      }
      anchor.insertAdjacentElement(
        'afterend',
        buildActionLine(buildResultActions(formattedText, runRecord ?? undefined))
      )
      if (runRecord) {
        void appendRecentRunToWorkspace({
          id: runRecord.id,
          sourceMode: runRecord.sourceMode,
          rawInput: runRecord.rawInput,
          outputText: runRecord.outputText,
          ...readRunOutcome(payload.response),
        })
      }
      removeOptimizeStreamArtifacts(requestId, {
        removeStatusLine: true,
      })
      // One round only (P5): the main process sends no questions with a refinement.
      if (!isRefinement) {
        offeredClarificationRound = readClarificationRound(rawInput, payload.response)
      }
      cleanup()
      resolve()
    }

    const handleError = (payload: unknown) => {
      if (
        !isObjectRecord(payload) ||
        payload.requestId !== requestId ||
        typeof payload.message !== 'string'
      ) {
        return
      }

      clearScramble()
      clearOptimizeTransientFailureArtifacts(requestId)
      cleanup()
      const failure = payload.failure
      const safeFailureMessage =
        isObjectRecord(failure) &&
        typeof failure.code === 'string' &&
        typeof failure.publicMessage === 'string'
          ? `[${failure.code}] ${failure.publicMessage}`
          : payload.message

      reject(new Error(safeFailureMessage))
    }

    onStream('optimize:status', handleStatus)
    onStream('optimize:chunk', handleChunk)
    onStream('optimize:done', handleDone)
    onStream('optimize:error', handleError)

    void (async () => {
      try {
        const started =
          (await desktopWindow.sentraDesktop?.invoke?.(invocation.channel, invocation.payload)) ??
          null

        if (
          isObjectRecord(started) &&
          typeof started.requestId === 'string' &&
          started.requestId !== requestId
        ) {
          clearOptimizeTransientFailureArtifacts(requestId)
          cleanup()
          reject(new Error(strings.streamRequestMismatch))
        }
      } catch (error) {
        clearOptimizeTransientFailureArtifacts(requestId)
        cleanup()
        reject(error instanceof Error ? error : new Error(strings.streamBridgeNotReady))
      }
    })()
  })
}

/**
 * Measure the real character cell of the transcript font (a hidden run of 100 "M", width
 * divided by 100; row height is font-size × line-height) and hand it to the main process,
 * which sizes the window in columns and rows: the target on first run only, the minimum on
 * every run. Skips silently when nothing can be measured (no fonts API, zero-sized layout).
 */
async function fitWindowToGrid(container: HTMLElement) {
  const probe = document.createElement('span')
  probe.className = 'cell-probe'
  probe.setAttribute('aria-hidden', 'true')
  probe.textContent = 'M'.repeat(100)
  container.appendChild(probe)
  const cellWidth = probe.getBoundingClientRect().width / 100
  probe.remove()

  const style = getComputedStyle(container)
  const fontSize = parseFloat(style.fontSize)
  const cellHeight = parseFloat(style.lineHeight)

  if (!Number.isFinite(cellWidth) || cellWidth <= 0 || !Number.isFinite(cellHeight) || cellHeight <= 0) {
    return
  }

  if (shell) {
    shell.dataset.cellWidth = cellWidth.toFixed(3)
    shell.dataset.cellHeight = cellHeight.toFixed(3)
    shell.dataset.fontLoaded = String(
      Boolean(document.fonts?.check?.(`${fontSize}px "JetBrains Mono"`))
    )
  }

  try {
    const result = await desktopWindow.sentraDesktop?.invoke?.('window:fit-grid', {
      cellWidth,
      cellHeight,
    })
    if (shell) {
      shell.dataset.gridFit = isObjectRecord(result) ? JSON.stringify(result) : 'no-bridge'
    }
  } catch (error) {
    if (shell) {
      shell.dataset.gridFit = `error:${error instanceof Error ? error.message : String(error)}`
    }
  }
}

function resetConsoleView(container: HTMLElement) {
  for (const child of Array.from(container.childNodes)) {
    if (child !== promptLine) {
      child.parentNode?.removeChild(child)
    }
  }

  activeOptimizeLines.clear()
  activeOptimizeStatusLines.clear()

  const version = readAppVersion()
  appendBannerSegments(container, 'title', [
    { text: strings.bannerTitle, tone: 'bright' },
    ...(version ? [{ text: '  ' }, { text: version, tone: 'dim' as const }] : []),
  ])
  appendBannerLine(container, 'subtitle', strings.bannerSubtitle)
  appendBannerLine(container, 'rule', strings.bannerRule)
  appendBannerLine(container, 'blank', strings.bannerBlank)

  if (shellStateLoaded) {
    printStartupBlock(container)
  }
}

function formatDesktopErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : strings.bridgeNotReady

  const providerMatch = message.match(/No API key provided for (\w+)/)

  if (providerMatch) {
    const provider = providerMatch[1]
    const envHintMap: Record<string, string> = {
      GROK: 'XAI_API_KEY',
      OPENAI: 'OPENAI_API_KEY',
      CLAUDE: 'ANTHROPIC_API_KEY',
      MISTRAL: 'MISTRAL_API_KEY',
      QWEN: 'QWEN_API_KEY',
    }
    const envKey = envHintMap[provider] ?? 'provider env key'
    return strings.providerEnvKeyMissing(provider, envKey)
  }

  return message
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function tryParseStructuredDesktopResult(value: string): unknown {
  const normalized = value.trim()

  if (!normalized.startsWith('{') && !normalized.startsWith('[')) {
    return value
  }

  try {
    return JSON.parse(normalized)
  } catch {
    return value
  }
}

/**
 * Screen columns (0-based, from the window edge) where label/value pairs sit: content
 * starts at column 2 (two-space margin), the second pair at column 40, as in
 * reference-console-startup.html. A line holds two pairs (the window is 80 columns);
 * more pairs continue on the next row at the same columns.
 */
const LABEL_COLUMNS = [2, 40]

/** Text after a six-character status prefix starts at screen column 6. */
const STATUS_TEXT_COLUMN = 6

/**
 * Lay `label=value` pairs out in fixed-width columns. `firstColumn` is the screen column
 * where the text starts: 2 for content, 6 for text after a status prefix. A pair too long
 * for its column pushes the next one right by at least two spaces instead of overlapping.
 */
function formatLabelColumns(pairs: string[], firstColumn = LABEL_COLUMNS[0]): string {
  const rows: string[] = []
  let row = ''
  let column = firstColumn
  let slot = 0

  for (const pair of pairs) {
    if (slot === LABEL_COLUMNS.length) {
      rows.push(row)
      row = ''
      column = firstColumn
      slot = 0
    }
    if (slot > 0) {
      const pad = Math.max(2, LABEL_COLUMNS[slot] - column)
      row += ' '.repeat(pad)
      column += pad
    }
    row += pair
    column += pair.length
    slot += 1
  }

  if (row) {
    rows.push(row)
  }

  return rows.join('\n')
}

/** One text line for metadata.quality; `sectionCount` is the number of `## ` headings shown. */
function formatQualityLine(quality: unknown, sectionCount?: number): string | null {
  if (!isObjectRecord(quality) || typeof quality.degraded !== 'boolean') {
    return null
  }

  const attempts = typeof quality.attempts === 'number' ? quality.attempts : 1
  const attemptsText = strings.attemptsCount(attempts)

  if (quality.degraded) {
    const reason = typeof quality.reason === 'string' ? quality.reason : 'unknown'
    return `${strings.qualityNeedsReview} · ${reason} · ${attemptsText}`
  }

  // V11: valid but thin. A warning naming the two missing answers, never an ok line.
  if (quality.thin === true) {
    return strings.qualityThin
  }

  const sectionsText = typeof sectionCount === 'number' ? strings.sectionsCount(sectionCount) : null
  return [strings.qualityOk, sectionsText, attemptsText].filter(Boolean).join(' · ')
}

function countPromptSections(promptText: string): number {
  return (promptText.match(/^##[ \t]+\S/gm) ?? []).length
}

/**
 * The meta flags are settings, never a verdict:
 * `task=coding  provider=openai  lane=interactive  model=<model>  output=coding_brief  3.8s`.
 * Quality and attempts live on the separate quality line.
 */
function collectMetaFlags(metadata: Record<string, unknown>, lane?: DesktopOptimizeLane): string[] {
  const flags: string[] = []

  if (typeof metadata.taskType === 'string') {
    flags.push(`task=${metadata.taskType.toLowerCase()}`)
  }

  if (typeof metadata.provider === 'string') {
    flags.push(`provider=${metadata.provider.toLowerCase()}`)
  }

  if (lane) {
    flags.push(`lane=${lane.toLowerCase()}`)
  }

  if (typeof metadata.model === 'string') {
    flags.push(`model=${metadata.model}`)
  }

  if (typeof metadata.outputKind === 'string') {
    flags.push(`output=${metadata.outputKind.toLowerCase()}`)
  }

  if (typeof metadata.latencyMs === 'number') {
    flags.push(`${(metadata.latencyMs / 1000).toFixed(1)}s`)
  }

  return flags
}

/** Meta flags laid out in label columns; rows are separate meta lines in the transcript. */
function formatMetaFlags(metadata: Record<string, unknown>, lane?: DesktopOptimizeLane): string {
  return formatLabelColumns(collectMetaFlags(metadata, lane))
}

function isMetaFlagLine(line: string): boolean {
  return /^((task|provider|lane|model|output|code|tokens)=|\d+\.\d+s(\s|$))/.test(line)
}

function isQualityLine(line: string): boolean {
  return (
    line.startsWith(`${strings.qualityOk} · `) ||
    line.startsWith(`${strings.qualityNeedsReview} · `) ||
    line === strings.qualityThin
  )
}

/**
 * Status class of a quality line, as reference-console-sentra.html prints the verdict:
 * `ok    complete · …`, `warn  thin brief …`, `error needs review · …`. The prefix comes
 * from the status style, so the DOM text stays the verdict alone.
 */
function qualityLineClass(text: string): string {
  if (text.startsWith(`${strings.qualityOk} · `)) return 'status-ok'
  if (text === strings.qualityThin) return 'status-warn'
  return 'status-error'
}

function isTrailingResultLine(line: string): boolean {
  return isMetaFlagLine(line) || isQualityLine(line)
}

/** Split the meta flag line and the quality line off the end of a formatted result. */
function splitTrailingResultLines(formattedText: string): { body: string; trailing: string[] } {
  const lines = formattedText.trimEnd().split('\n')
  const trailing: string[] = []

  while (lines.length > 1 && isTrailingResultLine(lines[lines.length - 1])) {
    trailing.unshift(lines.pop() as string)
  }

  // Exactly one blank line between blocks inside the body as well: collapse doubled blanks.
  const body = lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()
  return { body, trailing }
}

/**
 * The meta line is settings (dim); the quality line is a verdict (coloured by status).
 * Both render as their own console lines after the result block, separated from the body
 * by exactly one blank line. Returns the last element written so an action line can
 * follow the whole result block.
 */
function appendTrailingResultLines(afterLine: HTMLElement, trailing: string[]) {
  const blank = createBlankLine()
  afterLine.insertAdjacentElement('afterend', blank)
  let anchor: HTMLElement = blank

  for (const text of trailing) {
    const line = document.createElement('div')
    if (isQualityLine(text)) {
      line.className = `line type-sys quality-line ${qualityLineClass(text)}`
    } else {
      line.className = 'line type-sys meta-line'
    }
    line.textContent = text
    anchor.insertAdjacentElement('afterend', line)
    anchor = line
  }

  return anchor
}

function formatBenchmarkReport(result: {
  summary: string
  report: Array<Record<string, unknown>>
}) {
  const lines = ['# Benchmark Report', '', '```text', result.summary.trim(), '```']

  for (const item of result.report) {
    const caseId = typeof item.caseId === 'string' ? item.caseId : 'unknown-case'
    const lane = typeof item.lane === 'string' ? item.lane : 'UNKNOWN'
    const provider = typeof item.provider === 'string' ? item.provider : 'UNKNOWN'
    const model = typeof item.model === 'string' ? item.model : 'unknown-model'
    const pass = item.pass === true ? 'PASS' : 'FAIL'

    lines.push(
      '',
      `## ${caseId} · ${lane}`,
      `- Result: ${pass}`,
      `- Provider: ${provider}/${model}`
    )

    if (Array.isArray(item.failures) && item.failures.length > 0) {
      lines.push(`- Failures: ${item.failures.join(', ')}`)
    }
  }

  return lines.join('\n')
}

function formatBenchmarkList(benchmarks: DesktopBenchmarkRecord[]) {
  const lines = ['# Saved Benchmarks', '']

  for (const record of benchmarks) {
    lines.push(`- ${record.id} · ${record.title} · lanes=${record.lanes.join(', ')}`)
  }

  return lines.join('\n')
}

function formatDesktopResult(result: unknown): string {
  if (typeof result === 'string') {
    const parsedResult = tryParseStructuredDesktopResult(result)

    if (parsedResult !== result) {
      return formatDesktopResult(parsedResult)
    }

    return result
  }

  if (!isObjectRecord(result)) {
    return JSON.stringify(result, null, 2)
  }

  const superPrompt = isObjectRecord(result.superPrompt) ? result.superPrompt : null
  const metadata = isObjectRecord(result.metadata) ? result.metadata : null
  const failure = isObjectRecord(result.failure) ? result.failure : null

  if (Array.isArray(result.report) && typeof result.summary === 'string') {
    return formatBenchmarkReport({
      summary: result.summary,
      report: result.report.filter(isObjectRecord),
    })
  }

  if (Array.isArray(result.benchmarks)) {
    return formatBenchmarkList(normalizeBenchmarkRecords(result))
  }

  if (isObjectRecord(result.benchmark) && typeof result.benchmark.id === 'string') {
    return [
      '# Benchmark Saved',
      '',
      `- ID: ${result.benchmark.id}`,
      `- Title: ${
        typeof result.benchmark.title === 'string' ? result.benchmark.title : 'Saved benchmark'
      }`,
    ].join('\n')
  }

  if (result.status === 'FAILED') {
    const lines = [
      '# Evaluation Failed',
      '',
      typeof failure?.message === 'string'
        ? failure.message
        : 'Evaluator could not parse provider output.',
    ]
    const metaFlags = formatLabelColumns(
      [
        typeof failure?.code === 'string' ? `code=${failure.code}` : null,
        ...(metadata ? collectMetaFlags(metadata) : []),
      ].filter((flag): flag is string => Boolean(flag))
    )

    if (metaFlags) {
      lines.push('', metaFlags)
    }

    lines.push('', '## Retry', '- Re-run with the same provider from the action row.')
    return lines.join('\n')
  }

  if (superPrompt && typeof superPrompt.fullPrompt === 'string') {
    const promptBody = buildOptimizePromptText(superPrompt)

    const lines = [promptBody || '[No visible prompt content returned by provider.]']
    const metaFlags = metadata ? formatMetaFlags(metadata, currentOptimizerLane) : ''
    const qualityLine = metadata
      ? formatQualityLine(metadata.quality, countPromptSections(promptBody))
      : null

    if (metaFlags) {
      lines.push('', metaFlags)
    }

    if (qualityLine) {
      lines.push(qualityLine)
    }

    return lines.join('\n')
  }

  if (typeof result.transformedPrompt === 'string') {
    const lines = ['# Transformed Prompt', '', result.transformedPrompt.trim()]

    if (typeof result.tokensEstimate === 'number') {
      lines.push('', `tokens=${result.tokensEstimate}`)
    }

    return lines.join('\n')
  }

  return JSON.stringify(result, null, 2)
}

function updateOptimizerLane(lane: DesktopOptimizeLane) {
  currentOptimizerLane = lane
  syncOptimizerLaneModelPresentation()
}

function updateCompilerProfile(nextProfile: DesktopCompilerProfile) {
  currentCompilerProfile = nextProfile
}

function updateEffortLevel(nextEffort: DesktopEffortLevel) {
  currentEffortLevel = nextEffort
}

async function loadShellState() {
  try {
    const state = await desktopWindow.sentraDesktop?.getShellState?.()

    // The title bar text is static chrome ("sentra prompt console" in index.html, from
    // the pixel reference); only the OS window title follows the app name.
    if (state?.appName) {
      document.title = state.appName
    }

    if (state?.preferredProvider) {
      currentProvider = state.preferredProvider
    }

    if (state?.providerReadiness) {
      providerReadinessStatus = state.providerReadiness.status
      currentProvider = state.providerReadiness.activeProvider
    } else {
      providerReadinessStatus = state?.preferredProvider ? 'ready' : 'missing'
    }

    if (state?.preferredModel) {
      currentModelLabel = state.preferredModel
    }

    if (state?.optimizerLaneStates) {
      optimizerLaneStates = state.optimizerLaneStates
      syncOptimizerLaneModelPresentation()
    }

    // Raw badge labels from the main process (for example the FTDR score) are never
    // printed; the startup block prints the provider-missing warning from readiness.
    briefCounts = await loadBriefCounts()
    shellStateLoaded = true
    if (display) {
      printStartupBlock(display)
    }

    setExecutionState(isExecuting)
  } catch (error) {
    providerReadinessStatus = 'missing'
    currentProvider = null
    shellStateLoaded = true
    setExecutionState(isExecuting)
    const message = error instanceof Error ? error.message : strings.shellStateUnavailable
    if (display) {
      printStartupBlock(display)
      appendConsoleLine(display, 'sys', `[WARN] ${message}`)
      appendBlankLine(display)
    }
  }
}

/** Today's brief counts from the workspace store; null (row omitted) when unreadable. */
async function loadBriefCounts(): Promise<BriefCounts | null> {
  try {
    const recentRuns = await desktopWindow.sentraDesktop?.workspace?.listRecentRuns?.()
    if (!Array.isArray(recentRuns)) {
      return null
    }
    return countTodaysBriefs(normalizeRecentRuns({ recentRuns }))
  } catch {
    return null
  }
}

// ═══ CONSOLE COMMAND LANGUAGE ═══

function splitBareCommand(value: string) {
  const match = /^(\S+)\s*([\s\S]*)$/.exec(value)
  return {
    word: (match?.[1] ?? '').toLowerCase(),
    rest: (match?.[2] ?? '').trim(),
  }
}

function stripQuotes(value: string) {
  const trimmed = value.trim()

  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")))
  ) {
    return trimmed.slice(1, -1).trim()
  }

  return trimmed
}

/** One help row: the command run is green, the summary is body text; the text is the same label-column row. */
function appendHelpRow(container: HTMLElement, usage: string, summary: string) {
  const line = document.createElement('div')
  line.className = 'line help-row'
  const command = document.createElement('span')
  command.className = 'seg-cmd'
  command.textContent = usage
  line.append(command, formatLabelColumns([usage, summary]).slice(usage.length))
  insertBeforePrompt(container, line)
  container.scrollTop = container.scrollHeight
}

function printHelp(container: HTMLElement) {
  for (const entry of strings.bareCommandCatalog) {
    appendHelpRow(container, entry.usage, entry.summary)
  }

  for (const entry of COMMAND_CATALOG) {
    appendHelpRow(container, entry.slash, entry.summary)
  }
}

function printModeLine(container: HTMLElement) {
  appendMetaLine(
    container,
    formatLabelColumns([
      `mode=${currentMode}`,
      `lane=${currentOptimizerLane.toLowerCase()}`,
      `profile=${currentCompilerProfile}`,
      `effort=${currentEffortLevel}`,
      `output=${currentOutputKind.toLowerCase()}`,
    ])
  )
}

function runLaneCommand(container: HTMLElement, rest: string) {
  const value = rest.trim().toLowerCase()

  if (value !== 'interactive' && value !== 'deep') {
    appendConsoleLine(container, 'sys', strings.laneOptionsError)
    return
  }

  updateOptimizerLane(value === 'deep' ? 'DEEP' : 'INTERACTIVE')
  appendConsoleLine(container, 'sys', `[DONE] lane=${currentOptimizerLane.toLowerCase()}`)
}

function runProfileCommand(container: HTMLElement, rest: string) {
  const value = rest.trim().toLowerCase() as DesktopCompilerProfile

  if (!COMPILER_PROFILES.includes(value)) {
    appendConsoleLine(container, 'sys', strings.profileOptionsError(COMPILER_PROFILES.join(', ')))
    return
  }

  updateCompilerProfile(value)
  appendConsoleLine(container, 'sys', `[DONE] profile=${currentCompilerProfile}`)
}

function runEffortCommand(container: HTMLElement, rest: string) {
  const value = rest.trim().toLowerCase() as DesktopEffortLevel

  if (!EFFORT_LEVELS.includes(value)) {
    appendConsoleLine(container, 'sys', strings.effortOptionsError(EFFORT_LEVELS.join(', ')))
    return
  }

  updateEffortLevel(value)
  appendConsoleLine(container, 'sys', `[DONE] effort=${currentEffortLevel}`)
}

function runCopyCommand(container: HTMLElement) {
  if (!lastCopyText) {
    appendConsoleLine(container, 'sys', strings.nothingToCopy)
    return
  }

  void navigator.clipboard
    .writeText(extractCopyableText(lastCopyText))
    .then(() => {
      appendConsoleLine(container, 'sys', strings.copiedNotice)
    })
    .catch(() => {
      appendConsoleLine(container, 'sys', strings.clipboardRejected)
    })
}

async function runKeyCommand(container: HTMLElement, rest: string) {
  const parts = rest.split(/\s+/).filter(Boolean)
  const provider = (parts[0] ?? '').toUpperCase()
  const apiKey = parts.slice(1).join(' ')

  const invocation: DesktopInvocation =
    provider && apiKey
      ? {
          channel: 'desktop:command',
          payload: {
            command: 'provider:save',
            payload: { provider, apiKey },
          },
        }
      : {
          channel: 'desktop:command',
          payload: {
            command: 'provider:list',
            payload: {},
          },
        }

  // Reference: `ok    provider=openai saved`; a listing prints each provider's key
  // source in label columns. The result payload is never echoed as JSON.
  setExecutionState(true)
  try {
    const result = await desktopWindow.sentraDesktop?.invoke?.(
      invocation.channel,
      invocation.payload
    )
    if (provider && apiKey) {
      appendConsoleLine(container, 'sys', strings.providerKeySaved(provider))
    } else {
      const providers =
        isObjectRecord(result) && Array.isArray(result.providers)
          ? result.providers.filter(isObjectRecord)
          : []
      const flags = providers
        .filter((entry) => typeof entry.provider === 'string' && typeof entry.source === 'string')
        .map((entry) => `${String(entry.provider).toLowerCase()}=${String(entry.source).toLowerCase()}`)
      appendConsoleLine(
        container,
        'sys',
        flags.length > 0 ? `[DONE] ${formatLabelColumns(flags)}` : strings.providerKeysNone
      )
    }
  } catch (error) {
    appendConsoleLine(container, 'sys', `[ERROR] ${formatDesktopErrorMessage(error)}`)
  } finally {
    setExecutionState(false)
    input?.focus()
  }
}

async function runStatCommand(container: HTMLElement) {
  try {
    const stats = await desktopWindow.sentraDesktop?.invoke?.('system:stats')

    if (!isSystemStats(stats)) {
      appendConsoleLine(container, 'sys', strings.telemetryUnavailable)
      return
    }

    appendConsoleLine(
      container,
      'sys',
      `[DONE] ${formatLabelColumns(
        [
          `heap=${stats.heapMb.toFixed(1)} MB`,
          `cpu=${stats.cpuPercent.toFixed(1)}%`,
          `mem=${stats.usedMemGb.toFixed(1)} / ${Math.round(stats.totalMemGb)} GB`,
          `uptime=${formatUptime(stats.uptimeSeconds)}`,
        ],
        STATUS_TEXT_COLUMN
      )}`
    )
  } catch (error) {
    appendConsoleLine(container, 'sys', `[ERROR] ${formatDesktopErrorMessage(error)}`)
  }
}

async function runLogCommand(container: HTMLElement) {
  try {
    const [recentResult, benchmarkResult] = await Promise.all([
      desktopWindow.sentraDesktop?.invoke?.('desktop:command', {
        command: 'recent:list',
        payload: {},
      }),
      desktopWindow.sentraDesktop?.invoke?.('desktop:command', {
        command: 'benchmark:list',
        payload: {},
      }),
    ])
    const recentRuns = normalizeRecentRuns(recentResult)
    const benchmarks = normalizeBenchmarkRecords(benchmarkResult)
    const compareGroups = buildCompareGroups(recentRuns).slice(0, 4)

    for (const group of compareGroups) {
      appendConsoleLine(
        container,
        'sys',
        strings.compareReadyLine(group[0]?.rawInput.slice(0, 120) ?? '')
      )
    }

    if (recentRuns.length === 0 && benchmarks.length === 0) {
      appendConsoleLine(container, 'sys', strings.noRecentRuns)
      return
    }

    for (const record of recentRuns.slice(0, 8)) {
      appendConsoleLine(
        container,
        'sys',
        `${record.sourceMode.toUpperCase()} · ${record.id}  ${record.rawInput.slice(0, 120)}`
      )
      appendActionLine(container, [
        {
          label: strings.actionRerunLabel,
          ariaLabel: strings.actionRerunAria,
          handler: async () => {
            await rerunRecentRecord(record)
          },
        },
        {
          label: strings.actionEvaluateLabel,
          ariaLabel: strings.actionEvaluateAria,
          handler: async () => {
            await evaluateRecentRecord(record)
          },
        },
      ])
    }

    for (const record of benchmarks.slice(0, 8)) {
      appendConsoleLine(
        container,
        'sys',
        `BENCHMARK · ${record.id} · ${record.lanes.join(' + ')}  ${record.title}`
      )
      appendActionLine(container, [
        {
          label: strings.actionRunBenchmarkLabel,
          ariaLabel: strings.actionRunBenchmarkAria,
          handler: async () => {
            await runBenchmarkRecord(record)
          },
        },
      ])
    }
  } catch (error) {
    appendConsoleLine(container, 'sys', `[ERROR] ${formatDesktopErrorMessage(error)}`)
  }
}

async function runPromptCommand(
  container: HTMLElement,
  mode: DesktopPrimaryModeId,
  outputKind: DesktopOutputKind,
  rawValue: string,
  refinement?: CodingBriefRefinementPayload
) {
  if (!rawValue) {
    appendConsoleLine(container, 'sys', strings.missingIdeaText)
    return
  }

  currentMode = mode
  currentOutputKind = outputKind

  let headerMetaLine: HTMLElement | null = null
  if (mode === 'optimize') {
    const suggestion = suggestOptimizerConfig(rawValue)
    headerMetaLine = appendMetaLine(
      container,
      formatLabelColumns(
        [
          `task=${suggestion.taskType.toLowerCase()}`,
          `lane=${currentOptimizerLane.toLowerCase()}`,
          `output=${outputKind.toLowerCase()}`,
          suggestion.templateSlug ? `template=${suggestion.templateSlug}` : null,
        ].filter((flag): flag is string => Boolean(flag))
      )
    )
  }
  // The command header (echo plus meta) is one block; the result body is the next.
  appendBlankLine(container)

  setExecutionState(true)

  const started = Date.now()
  const pendingLines = [appendConsoleLine(container, 'sys', `[WAIT] ${buildPendingLabel()}`)]
  const clearPendingLines = () => {
    for (const line of pendingLines) {
      line.remove()
    }
    pendingLines.length = 0
  }
  const heartbeat = window.setInterval(() => {
    pendingLines.push(
      appendConsoleLine(
        container,
        'sys',
        strings.stillRunning(Math.round((Date.now() - started) / 1000))
      )
    )
  }, 10000)

  try {
    if (mode === 'optimize') {
      const requestId = crypto.randomUUID()
      const invocation = buildOptimizeInvocation(rawValue, outputKind, requestId, refinement)

      if (isOptimizeInvocation(invocation)) {
        await executeOptimizeStream(
          invocation,
          requestId,
          container,
          rawValue,
          headerMetaLine,
          refinement !== undefined
        )
      }
    } else {
      const invocation = buildTransformInvocation(rawValue)
      const result = (await desktopWindow.sentraDesktop?.invoke?.(
        invocation.channel,
        invocation.payload
      )) ?? {
        status: 'pending',
        channel: invocation.channel,
      }
      const formattedText = formatDesktopResult(result)
      const runRecord = buildRunRecord('transform', rawValue, result)

      if (runRecord) {
        lastRunRecord = runRecord
      }

      appendConsoleLine(container, 'agent', formattedText, {
        copyText: formattedText,
        runRecord: runRecord ?? undefined,
      })

      if (runRecord) {
        await appendRecentRunToWorkspace({
          id: runRecord.id,
          sourceMode: runRecord.sourceMode,
          rawInput: runRecord.rawInput,
          outputText: runRecord.outputText,
        })
      }
    }

    clearPendingLines()
    // An optimize run closes with its quality verdict (ok / warn / error); the latency
    // is already in the meta block. A transform run has no verdict, so it keeps this line.
    if (mode !== 'optimize') {
      appendConsoleLine(
        container,
        'sys',
        strings.finishedIn(Math.round((Date.now() - started) / 1000))
      )
    }
  } catch (error) {
    clearPendingLines()
    appendConsoleLine(container, 'sys', `[ERROR] ${formatDesktopErrorMessage(error)}`)
  } finally {
    window.clearInterval(heartbeat)
    setExecutionState(false)
    input?.focus()
  }
}

async function runSlashInput(container: HTMLElement, value: string) {
  const parsed = parseConsoleInput(value)

  if (parsed.kind !== 'command') {
    return
  }

  if (parsed.command === 'help.show') {
    printHelp(container)
    return
  }

  if (parsed.command === 'recent.list') {
    await runLogCommand(container)
    return
  }

  setExecutionState(true)
  const started = Date.now()
  const pendingLine = appendConsoleLine(container, 'sys', `[WAIT] ${buildPendingLabel()}`)

  try {
    const invocation = buildCommandInvocation(parsed)
    const result = (await desktopWindow.sentraDesktop?.invoke?.(
      invocation.channel,
      invocation.payload
    )) ?? {
      status: 'pending',
      channel: invocation.channel,
    }
    const formattedText = formatDesktopResult(result)

    pendingLine.remove()
    appendConsoleLine(container, 'agent', formattedText)

    if (parsed.command === 'evaluate') {
      await appendRecentRunToWorkspace({
        id: crypto.randomUUID(),
        sourceMode: 'evaluate',
        rawInput: parsed.args[0] ?? '',
        outputText: formattedText,
      })
    }

    appendConsoleLine(
      container,
      'sys',
      strings.finishedIn(Math.round((Date.now() - started) / 1000))
    )
  } catch (error) {
    pendingLine.remove()
    appendConsoleLine(container, 'sys', `[ERROR] ${formatDesktopErrorMessage(error)}`)
  } finally {
    setExecutionState(false)
    input?.focus()
  }
}

async function runConsoleInput(container: HTMLElement, value: string) {
  if (value.startsWith('/')) {
    await runSlashInput(container, value)
    return
  }

  const { word, rest } = splitBareCommand(value)

  switch (word) {
    case 'help':
      printHelp(container)
      return
    case 'clear':
      resetConsoleView(container)
      return
    case 'quit':
      desktopWindow.sentraDesktop?.close?.()
      return
    case 'mode':
      printModeLine(container)
      return
    case 'copy':
      runCopyCommand(container)
      return
    case 'lane':
      runLaneCommand(container, rest)
      return
    case 'profile':
      runProfileCommand(container, rest)
      return
    case 'effort':
      runEffortCommand(container, rest)
      return
    case 'stat':
      await runStatCommand(container)
      return
    case 'log':
      await runLogCommand(container)
      return
    case 'key':
      await runKeyCommand(container, rest)
      return
    case 'brief':
      await runPromptCommand(container, 'optimize', 'CODING_BRIEF', stripQuotes(rest))
      return
    case 'super':
      await runPromptCommand(container, 'optimize', 'SUPER_PROMPT', stripQuotes(rest))
      return
    case 'transform':
      await runPromptCommand(container, 'transform', currentOutputKind, stripQuotes(rest))
      return
    default:
      // Anything the console does not recognise is a raw idea for a Coding Brief.
      await runPromptCommand(container, 'optimize', 'CODING_BRIEF', stripQuotes(value))
  }
}

function isDegradedResponse(response: unknown): boolean {
  if (!isObjectRecord(response) || !isObjectRecord(response.metadata)) {
    return false
  }
  const quality = response.metadata.quality
  return isObjectRecord(quality) && quality.degraded === true
}

/** The questions a delivered brief offers, or null when it offers none. */
function readClarificationRound(rawIdea: string, response: unknown): ClarificationRound | null {
  if (
    !isObjectRecord(response) ||
    !Array.isArray(response.clarifications) ||
    !isObjectRecord(response.superPrompt) ||
    typeof response.superPrompt.fullPrompt !== 'string'
  ) {
    return null
  }

  const items = response.clarifications
    .filter(
      (item): item is ClarificationItem =>
        isObjectRecord(item) &&
        typeof item.question === 'string' &&
        item.question !== '' &&
        typeof item.element === 'string' &&
        Object.prototype.hasOwnProperty.call(strings.clarificationHints, item.element)
    )
    .slice(0, 3)

  return items.length > 0
    ? { rawIdea, previousBrief: response.superPrompt.fullPrompt, items, answers: [] }
    : null
}

/** D1: the line itself, then how to answer it. */
function printClarificationQuestion(container: HTMLElement, round: ClarificationRound) {
  const index = round.answers.length
  const item = round.items[index]
  appendConsoleLine(
    container,
    'sys',
    strings.clarificationHeading(index + 1, round.items.length, item.question)
  )
  appendConsoleLine(container, 'sys', strings.clarificationHints[item.element])
  if (index === 0) {
    appendConsoleLine(container, 'sys', strings.clarificationSkipHint)
  }
}

/**
 * D2: the typed line answers the current question. Enter alone keeps the proposal; `skip`
 * ends the round. Once every question is answered, one refinement runs unless every
 * answer kept its proposal — then nothing would change, so no provider call is made.
 */
async function answerClarification(container: HTMLElement, round: ClarificationRound, value: string) {
  if (value.toLowerCase() === strings.clarificationSkipWord) {
    pendingClarificationRound = null
    appendConsoleLine(container, 'sys', strings.clarificationSkipped)
    return
  }

  round.answers.push(value === '' ? null : value)
  if (value === '') {
    appendConsoleLine(container, 'sys', strings.clarificationKept)
  }

  if (round.answers.length < round.items.length) {
    printClarificationQuestion(container, round)
    return
  }

  pendingClarificationRound = null
  if (round.answers.every((answer) => answer === null)) {
    appendConsoleLine(container, 'sys', strings.clarificationNoAnswers)
    return
  }

  await runPromptCommand(container, 'optimize', 'CODING_BRIEF', round.rawIdea, {
    previousBrief: round.previousBrief,
    clarifications: round.items.map((item, index) => ({ ...item, answer: round.answers[index] })),
  })
}

async function execute() {
  if (!input || !display || isExecuting) {
    return
  }

  const value = input.value.trim()
  const round = pendingClarificationRound
  // Enter on an empty line is an answer ("keep") only while a question is pending.
  if (!value && !round) {
    return
  }

  if (value) {
    appendConsoleLine(display, 'user', value)
  }
  input.value = ''

  try {
    if (round) {
      await answerClarification(display, round, value)
    } else {
      await runConsoleInput(display, value)
    }
  } finally {
    appendBlankLine(display)
    // A brief delivered by this command offers its questions after the command block.
    const offered = offeredClarificationRound
    if (offered) {
      offeredClarificationRound = null
      pendingClarificationRound = offered
      printClarificationQuestion(display, offered)
      appendBlankLine(display)
    }
    input.focus()
  }
}

closeBtn?.addEventListener('click', () => desktopWindow.sentraDesktop?.close?.())
minimizeBtn?.addEventListener('click', () => desktopWindow.sentraDesktop?.minimize?.())

input?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    input.value = ''
    return
  }

  if (event.key === 'Enter') {
    void execute()
  }
})

if (display) {
  resetConsoleView(display)
  // The web font can finish loading after the last line was appended; that reflow
  // changes scrollHeight and leaves the last line just above the fold on a cold start.
  // Re-apply the end-of-transcript scroll once the fonts are in: after the initial load,
  // and after every later load set (a weight is only fetched when first used). jsdom has
  // no document.fonts, hence the guard.
  const scrollToEnd = () => {
    display.scrollTop = display.scrollHeight
  }
  document.fonts?.ready.then(() => {
    scrollToEnd()
    void fitWindowToGrid(display)
  })
  document.fonts?.addEventListener('loadingdone', scrollToEnd)
}
setExecutionState(false)
void loadShellState()

const NODRAG_SELECTOR = 'button, input, a, label, pre, .transcript, .tx-action'

let dragStart: { mx: number; my: number; wx: number; wy: number } | null = null
let dragAttempt = 0

function cancelDrag() {
  dragAttempt += 1
  dragStart = null
}

document.addEventListener('mousedown', async (event) => {
  if (event.button !== 0 || !(event.target instanceof HTMLElement)) return

  const dragSurface = shell
  if (!dragSurface || dragSurface.hidden || !dragSurface.contains(event.target)) return
  if (event.target.closest(NODRAG_SELECTOR)) return

  const attempt = ++dragAttempt
  const pos = await desktopWindow.sentraDesktop?.getWindowPos?.()
  if (attempt !== dragAttempt || !pos) return

  dragStart = { mx: event.screenX, my: event.screenY, wx: pos[0], wy: pos[1] }
})

document.addEventListener('mousemove', (event) => {
  if (!dragStart) return
  if ((event.buttons & 1) === 0) {
    cancelDrag()
    return
  }

  const dx = event.screenX - dragStart.mx
  const dy = event.screenY - dragStart.my
  const distance = Math.hypot(dx, dy)

  if (distance <= 3) {
    return
  }

  desktopWindow.sentraDesktop?.setWindowPos?.(dragStart.wx + dx, dragStart.wy + dy)
})

document.addEventListener('mouseup', cancelDrag)
window.addEventListener('blur', cancelDrag)

interface DesktopSystemStats {
  heapMb: number
  heapLimitMb: number
  cpuPercent: number
  usedMemGb: number
  totalMemGb: number
  uptimeSeconds: number
}

function isSystemStats(payload: unknown): payload is DesktopSystemStats {
  return (
    isObjectRecord(payload) &&
    typeof payload.heapMb === 'number' &&
    typeof payload.cpuPercent === 'number' &&
    typeof payload.uptimeSeconds === 'number'
  )
}

function formatUptime(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const hh = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export {}
