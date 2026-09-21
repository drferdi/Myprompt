type DesktopPrimaryModeId = 'transform' | 'optimize'
type DesktopOptimizeLane = 'INTERACTIVE' | 'DEEP'
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

interface DesktopOptimizerSuggestion {
  taskType: string
  optimizerLane: DesktopOptimizeLane
  templateSlug?: string
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

const MODE_COPY: Record<
  DesktopPrimaryModeId,
  {
    title: string
    tag: string
    copy: string
    subtitle: string
    placeholder: string
  }
> = {
  transform: {
    title: 'Transform',
    tag: 'Zero Cost',
    copy: 'Wrap raw prompts into a deterministic prompt-engineering scaffold.',
    subtitle: 'Deterministic prompt shell',
    placeholder: 'Masukkan prompt mentah untuk dibungkus...',
  },
  optimize: {
    title: 'Optimizer',
    tag: 'LLM Mode',
    copy: 'Generate a provider-backed Super Prompt with structured reasoning.',
    subtitle: 'LLM-backed prompt shell',
    placeholder: 'Masukkan ide mentah untuk dioptimalkan...',
  },
}

const COMMAND_CATALOG: DesktopCommandCatalogEntry[] = [
  {
    id: 'help.show',
    slash: '/help',
    summary: 'Show available commands and badges',
    transportCommand: 'help:show',
  },
  {
    id: 'evaluate',
    slash: '/evaluate <text>',
    summary: 'Evaluate a prompt body with the current provider',
    transportCommand: 'evaluate:run',
  },
  {
    id: 'library.list',
    slash: '/library',
    summary: 'List saved library prompts',
    transportCommand: 'library:list',
  },
  {
    id: 'library.search',
    slash: '/library search <query>',
    summary: 'Search saved library prompts',
    transportCommand: 'library:search',
  },
  {
    id: 'library.save',
    slash: '/library save',
    summary: 'Save the current output to Library',
    transportCommand: 'library:save',
  },
  {
    id: 'draft.save',
    slash: '/draft save',
    summary: 'Save the current run as a local draft',
    transportCommand: 'draft:save',
  },
  {
    id: 'recent.list',
    slash: '/recent',
    summary: 'Open recent runs in the workbench',
    transportCommand: 'recent:list',
  },
  {
    id: 'benchmark.list',
    slash: '/benchmark list',
    summary: 'List saved benchmark cases',
    transportCommand: 'benchmark:list',
  },
  {
    id: 'benchmark.save',
    slash: '/benchmark save',
    summary: 'Save the current run as a benchmark case',
    transportCommand: 'benchmark:save',
  },
  {
    id: 'benchmark.run',
    slash: '/benchmark run <id>',
    summary: 'Run one saved benchmark case',
    transportCommand: 'benchmark:run',
  },
  {
    id: 'provider.list',
    slash: '/provider',
    summary: 'Show provider key status',
    transportCommand: 'provider:list',
  },
  {
    id: 'usage.summary',
    slash: '/usage',
    summary: 'Show current quota usage and tier',
    transportCommand: 'usage:summary',
  },
  {
    id: 'subscription.upgrade',
    slash: '/subscription upgrade <tier> <interval>',
    summary: 'Start a desktop upgrade checkout flow',
    transportCommand: 'subscription:upgrade',
  },
]

const OPTIMIZER_LANE_COPY: Record<
  DesktopOptimizeLane,
  {
    tag: string
    copy: string
    subtitle: string
    placeholder: string
  }
> = {
  INTERACTIVE: {
    tag: 'Fast Lane',
    copy: 'Fast default: skip retrieval, use a denser prompt, and optimize for first useful output.',
    subtitle: 'Interactive prompt shell',
    placeholder: 'Masukkan ide mentah untuk optimasi cepat...',
  },
  DEEP: {
    tag: 'Deep Lane',
    copy: 'Deeper optimization: allow richer prompt engineering and retrieval-aware guidance when needed.',
    subtitle: 'Deep prompt shell',
    placeholder: 'Masukkan ide untuk optimasi mendalam...',
  },
}

const shell = document.getElementById('consoleShell') as HTMLElement | null
const display = document.getElementById('display') as HTMLElement | null
const input = document.getElementById('cmdInput') as HTMLInputElement | null
const appTitle = document.getElementById('appTitle') as HTMLElement | null
const modelChip = document.getElementById('modelChip') as HTMLElement | null
const shellBadges = document.getElementById('shellBadges') as HTMLElement | null
const slashPalette = document.getElementById('slashPalette') as HTMLElement | null
const suggestionPanel = document.getElementById('suggestionPanel') as HTMLElement | null
const suggestionChips = document.getElementById('suggestionChips') as HTMLElement | null
const suggestionCopy = document.getElementById('suggestionCopy') as HTMLElement | null
const commandHelpPanel = document.getElementById('commandHelpPanel') as HTMLElement | null
const commandHelpBody = document.getElementById('commandHelpBody') as HTMLElement | null
const commandHelpCloseBtn = document.getElementById(
  'commandHelpCloseBtn'
) as HTMLButtonElement | null
const workbenchPanel = document.getElementById('workbenchPanel') as HTMLElement | null
const workbenchBody = document.getElementById('workbenchBody') as HTMLElement | null
const workbenchCloseBtn = document.getElementById('workbenchCloseBtn') as HTMLButtonElement | null
const closeBtn = document.getElementById('closeBtn') as HTMLElement | null
const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement | null
const runBtn = document.getElementById('runBtn') as HTMLButtonElement | null
const copyLastBtn = document.getElementById('copyLastBtn') as HTMLButtonElement | null
const miniToggleBtn = document.getElementById('miniToggleBtn') as HTMLButtonElement | null
const powerBtn = document.getElementById('powerBtn') as HTMLButtonElement | null
const consoleRig = document.getElementById('consoleRig') as HTMLElement | null
const miniWidget = document.getElementById('miniWidget') as HTMLElement | null
const miniBar = document.getElementById('miniBar') as HTMLElement | null
const miniPanel = document.getElementById('miniPanel') as HTMLElement | null
const mCollapseBtn = document.getElementById('mCollapseBtn') as HTMLButtonElement | null
const mTransformBtn = document.getElementById('mTransformBtn') as HTMLButtonElement | null
const mOptimizeBtn = document.getElementById('mOptimizeBtn') as HTMLButtonElement | null
const mCmdInput = document.getElementById('mCmdInput') as HTMLInputElement | null
const mDisplay = document.getElementById('mDisplay') as HTMLElement | null
const mRunBtn = document.getElementById('mRunBtn') as HTMLButtonElement | null
const mClearBtn = document.getElementById('mClearBtn') as HTMLButtonElement | null
const mTitle = document.getElementById('mTitle') as HTMLElement | null
const mSubtitle = document.getElementById('mSubtitle') as HTMLElement | null
const mModel = document.getElementById('mModel') as HTMLElement | null
const mStatusTitle = document.getElementById('mStatusTitle') as HTMLElement | null
const mStatusTag = document.getElementById('mStatusTag') as HTMLElement | null
const mStatusCopy = document.getElementById('mStatusCopy') as HTMLElement | null
const modeButtons = Array.from(document.querySelectorAll<HTMLElement>('.mode-btn'))
const optimizerLaneControls = document.getElementById('optimizerLaneControls') as HTMLElement | null
const optimizerLaneButtons = Array.from(
  document.querySelectorAll<HTMLElement>('.optimizer-lane-btn')
)

let currentMode: DesktopPrimaryModeId = 'transform'
let currentOptimizerLane: DesktopOptimizeLane = 'INTERACTIVE'
let currentProvider: DesktopLLMProvider = 'GROK'
let currentModelLabel = 'grok-3-fast'
type WidgetState = 'full' | 'minimized'

let widgetState: WidgetState = 'full'
let isExecuting = false
let lastRunRecord: DesktopRunRecord | null = null
let lastCopyText = ''
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
  const reasons = [
    `Task type inferred as ${taskType}.`,
    optimizerLane === 'DEEP'
      ? 'Deep lane suggested because the prompt asks for richer analysis or trade-offs.'
      : 'Interactive lane suggested because the prompt looks execution-first and short-horizon.',
  ]

  if (templateSlug) {
    reasons.push(`Template hint: ${templateSlug}.`)
  }

  return {
    taskType,
    optimizerLane,
    templateSlug,
    reasons,
  }
}

function joinArgs(parts: string[]) {
  const value = parts.join(' ').trim()
  return value ? [value] : []
}

function getModeCopy(
  mode: DesktopPrimaryModeId,
  optimizerLane: DesktopOptimizeLane = currentOptimizerLane
) {
  if (mode === 'transform') {
    return MODE_COPY.transform
  }

  return {
    ...MODE_COPY.optimize,
    ...OPTIMIZER_LANE_COPY[optimizerLane],
  }
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

function hideSlashPalette() {
  if (slashPalette) {
    slashPalette.hidden = true
    slashPalette.innerHTML = ''
  }
}

function hideSuggestionPanel() {
  suggestionPanel?.setAttribute('hidden', '')
  if (suggestionChips) {
    suggestionChips.innerHTML = ''
  }
  if (suggestionCopy) {
    suggestionCopy.textContent = ''
  }
}

function renderSuggestionPanel(rawIdea: string) {
  if (!suggestionPanel || !suggestionChips || !suggestionCopy) {
    return
  }

  const normalized = rawIdea.trim()
  if (currentMode !== 'optimize' || !normalized) {
    hideSuggestionPanel()
    return
  }

  const suggestion = suggestOptimizerConfig(normalized)
  suggestionChips.innerHTML = [
    `Task · ${suggestion.taskType}`,
    `Lane · ${suggestion.optimizerLane}`,
    suggestion.templateSlug ? `Template · ${suggestion.templateSlug}` : null,
  ]
    .filter((item): item is string => Boolean(item))
    .map((item) => `<span class="suggestion-chip">${item}</span>`)
    .join('')
  suggestionCopy.textContent = suggestion.reasons.join(' ')
  suggestionPanel.removeAttribute('hidden')
}

function hideOverlayPanels() {
  commandHelpPanel?.setAttribute('hidden', '')
  workbenchPanel?.setAttribute('hidden', '')
}

function renderShellBadges(badges: NonNullable<DesktopShellState['badges']> = []) {
  if (!shellBadges) {
    return
  }

  shellBadges.innerHTML = badges
    .map((badge) => `<span class="shell-badge tone-${badge.tone}">${badge.label}</span>`)
    .join('')
}

function buildCatalogItemMarkup(slash: string, summary: string) {
  return `<strong>${slash}</strong><span>${summary}</span>`
}

function filterCommandCatalog(query: string) {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return COMMAND_CATALOG.slice(0, 8)
  }

  return COMMAND_CATALOG.filter(
    (entry) =>
      entry.slash.toLowerCase().includes(normalized) ||
      entry.summary.toLowerCase().includes(normalized)
  ).slice(0, 8)
}

function renderSlashPalette(query: string) {
  if (!slashPalette) {
    return
  }

  const normalized = query.trim()
  if (!normalized.startsWith('/')) {
    hideSlashPalette()
    return
  }

  const items = filterCommandCatalog(normalized)
  if (items.length === 0) {
    hideSlashPalette()
    return
  }

  slashPalette.innerHTML = ''
  for (const item of items) {
    const button = document.createElement('button')
    button.className = 'catalog-item'
    button.type = 'button'
    button.innerHTML = buildCatalogItemMarkup(item.slash, item.summary)
    button.addEventListener('click', () => {
      if (!input) {
        return
      }

      input.value = item.slash
      input.focus()
      hideSlashPalette()

      if (item.id === 'help.show') {
        renderCommandHelpPanel('')
        commandHelpPanel?.removeAttribute('hidden')
      }
    })
    slashPalette.appendChild(button)
  }

  slashPalette.hidden = false
}

function renderCommandHelpPanel(query: string) {
  if (!commandHelpBody) {
    return
  }

  const items = filterCommandCatalog(query)
  commandHelpBody.innerHTML = ''

  for (const item of items) {
    const button = document.createElement('button')
    button.className = 'catalog-item'
    button.type = 'button'
    button.innerHTML = buildCatalogItemMarkup(item.slash, item.summary)
    button.addEventListener('click', () => {
      if (!input) {
        return
      }

      input.value = item.slash
      input.focus()
      hideSlashPalette()
    })
    commandHelpBody.appendChild(button)
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
  })
}

async function rerunRecentRecord(record: DesktopRecentRunRecord) {
  if (!input || isExecuting) {
    return
  }

  if (record.sourceMode === 'optimize') {
    updateMode('optimize')
    input.value = record.rawInput
  } else if (record.sourceMode === 'transform') {
    updateMode('transform')
    input.value = record.rawInput
  } else {
    input.value = `/evaluate ${record.rawInput}`
  }

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
  appendConsoleLine(display, 'sys', '[WAIT] Evaluator sedang memproses output tersimpan...')

  try {
    const result = await desktopWindow.sentraDesktop?.invoke?.('desktop:command', {
      command: 'evaluate:run',
      payload: {
        promptText: record.outputText,
        provider: currentProvider,
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
      `[DONE] Evaluasi selesai dalam ${Math.round((Date.now() - started) / 1000)}s`
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
  appendConsoleLine(display, 'sys', '[WAIT] Benchmark sedang menjalankan acceptance harness...')

  try {
    const result = await desktopWindow.sentraDesktop?.invoke?.('desktop:command', {
      command: 'benchmark:run',
      payload: {
        id: record.id,
        provider: currentProvider,
      },
    })

    appendConsoleLine(display, 'agent', formatDesktopResult(result))
    appendConsoleLine(
      display,
      'sys',
      `[DONE] Benchmark selesai dalam ${Math.round((Date.now() - started) / 1000)}s`
    )
  } catch (error) {
    appendConsoleLine(display, 'sys', `[ERROR] ${formatDesktopErrorMessage(error)}`)
  } finally {
    setExecutionState(false)
    input?.focus()
  }
}

async function openWorkbenchPanel() {
  if (!workbenchPanel || !workbenchBody) {
    return
  }

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

  workbenchBody.innerHTML = ''

  if (compareGroups.length > 0) {
    for (const group of compareGroups) {
      const summary = document.createElement('div')
      summary.className = 'catalog-item'
      summary.innerHTML = buildCatalogItemMarkup(
        'COMPARE READY · Transform + Optimizer',
        group[0]?.rawInput.slice(0, 120) ?? ''
      )
      workbenchBody.appendChild(summary)
    }
  }

  if (recentRuns.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'workbench-empty'
    empty.textContent = 'No recent runs yet.'
    workbenchBody.appendChild(empty)
  } else {
    for (const record of recentRuns.slice(0, 8)) {
      const card = document.createElement('div')
      card.className = 'catalog-item'
      card.innerHTML = buildCatalogItemMarkup(
        `${record.sourceMode.toUpperCase()} · ${record.id}`,
        record.rawInput.slice(0, 120)
      )

      const actionRow = document.createElement('div')
      actionRow.className = 'output-action-row'
      actionRow.appendChild(
        createActionButton('Re-run', async () => {
          await rerunRecentRecord(record)
        })
      )
      actionRow.appendChild(
        createActionButton('Evaluate', async () => {
          await evaluateRecentRecord(record)
        })
      )
      card.appendChild(actionRow)
      workbenchBody.appendChild(card)
    }
  }

  if (benchmarks.length > 0) {
    const benchmarkHeader = document.createElement('div')
    benchmarkHeader.className = 'catalog-item'
    benchmarkHeader.innerHTML = buildCatalogItemMarkup(
      'BENCHMARKS',
      'Saved canonical prompts for acceptance comparison.'
    )
    workbenchBody.appendChild(benchmarkHeader)

    for (const record of benchmarks.slice(0, 8)) {
      const card = document.createElement('div')
      card.className = 'catalog-item'
      card.innerHTML = buildCatalogItemMarkup(
        `${record.id} · ${record.lanes.join(' + ')}`,
        record.title
      )

      const actionRow = document.createElement('div')
      actionRow.className = 'output-action-row'
      actionRow.appendChild(
        createActionButton('Run Benchmark', async () => {
          await runBenchmarkRecord(record)
        })
      )
      card.appendChild(actionRow)
      workbenchBody.appendChild(card)
    }
  }

  workbenchPanel.removeAttribute('hidden')
}

function buildPromptInvocation(
  mode: DesktopPrimaryModeId,
  value: string,
  requestId?: string
): DesktopInvocation {
  if (mode === 'transform') {
    return {
      channel: 'desktop:command',
      payload: {
        command: 'transform:run',
        payload: {
          prompt: value,
          model: 'claude-sonnet',
          mode: 'professional',
          temperature: 0.7,
          maxTokens: 1024,
          locale: 'id',
        },
      },
    }
  }

  const suggestion = suggestOptimizerConfig(value)

  return {
    channel: 'desktop:command',
    payload: {
      command: 'optimize:run',
      payload: {
        rawIdea: value,
        taskType: suggestion.taskType,
        tone: 'PROFESSIONAL',
        format: 'STRUCTURED',
        targetLlm: currentProvider,
        provider: currentProvider,
        optimizerLane: currentOptimizerLane,
        requestId,
      },
    },
  }
}

function buildCommandInvocation(
  parsed: Extract<ParsedConsoleInput, { kind: 'command' }>
): DesktopInvocation {
  if (parsed.command === 'evaluate') {
    return {
      channel: 'desktop:command',
      payload: {
        command: 'evaluate:run',
        payload: {
          promptText: parsed.args[0] ?? '',
          provider: currentProvider,
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
      throw new Error('Tidak ada output terbaru untuk disimpan ke library.')
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
      throw new Error('Tidak ada output terbaru untuk disimpan sebagai draft.')
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
      throw new Error('Tidak ada output terbaru untuk disimpan sebagai benchmark.')
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
      throw new Error('Benchmark run memerlukan benchmark id.')
    }

    return {
      channel: 'desktop:command',
      payload: {
        command: 'benchmark:run',
        payload: {
          id: benchmarkId,
          provider: currentProvider,
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

  throw new Error(`Unsupported command: ${parsed.command}`)
}

function extractCopyableText(formattedText: string): string {
  let text = formattedText
  text = text.replace(/^# (?:Optimized|Transformed) Prompt\n\n/, '')
  const metaIdx = text.indexOf('\n\n## Metadata\n')
  if (metaIdx !== -1) {
    text = text.slice(0, metaIdx)
  }
  return text.trim()
}

function attachCopyButton(line: HTMLElement, textToCopy: string) {
  lastCopyText = textToCopy
  if (copyLastBtn) {
    copyLastBtn.disabled = false
  }
  line.classList.add('line-has-copy')

  const btn = document.createElement('button')
  btn.className = 'copy-line-btn'
  btn.type = 'button'
  btn.title = 'Copy output'
  btn.textContent = 'COPY'
  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    navigator.clipboard
      .writeText(extractCopyableText(textToCopy))
      .then(() => {
        btn.textContent = 'COPIED'
        setTimeout(() => {
          btn.textContent = 'COPY'
        }, 1500)
      })
      .catch(() => {
        btn.textContent = 'FAILED'
      })
  })
  line.appendChild(btn)
}

function createActionButton(
  label: string,
  handler: (button: HTMLButtonElement) => Promise<void> | void
) {
  const button = document.createElement('button')
  button.className = 'output-action-btn'
  button.type = 'button'
  button.textContent = label
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

function attachOutputActions(line: HTMLElement, runRecord: DesktopRunRecord) {
  const row = document.createElement('div')
  row.className = 'output-action-row'

  row.appendChild(
    createActionButton('Save to Library', async (button) => {
      if (!desktopWindow.sentraDesktop?.invoke || !display) {
        return
      }

      const originalLabel = button.textContent ?? 'Save to Library'
      button.disabled = true
      button.textContent = 'Saving...'

      try {
        const result = await desktopWindow.sentraDesktop.invoke('desktop:command', {
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

        button.textContent = 'Saved'
        appendConsoleLine(display, 'sys', `[SAVED] Library item ${promptId} created.`)
      } catch (error) {
        button.textContent = 'Failed'
        appendConsoleLine(display, 'sys', `[ERROR] ${formatDesktopErrorMessage(error)}`)
      } finally {
        window.setTimeout(() => {
          button.disabled = false
          button.textContent = originalLabel
        }, 1500)
      }
    })
  )

  row.appendChild(
    createActionButton('Save as Draft', async (button) => {
      if (!desktopWindow.sentraDesktop?.invoke || !display) {
        return
      }

      const originalLabel = button.textContent ?? 'Save as Draft'
      button.disabled = true
      button.textContent = 'Saving...'

      try {
        const result = await desktopWindow.sentraDesktop.invoke('desktop:command', {
          command: 'draft:save',
          payload: {
            id: `draft-${runRecord.id}`,
            rawInput: runRecord.rawInput,
            optimizedText: runRecord.outputText,
            sourceMode: runRecord.sourceMode,
          },
        })
        const draftId =
          isObjectRecord(result) &&
          isObjectRecord(result.draft) &&
          typeof result.draft.id === 'string'
            ? result.draft.id
            : 'draft'

        button.textContent = 'Saved'
        appendConsoleLine(display, 'sys', `[DRAFT] Saved as ${draftId}.`)
      } catch (error) {
        button.textContent = 'Failed'
        appendConsoleLine(display, 'sys', `[ERROR] ${formatDesktopErrorMessage(error)}`)
      } finally {
        window.setTimeout(() => {
          button.disabled = false
          button.textContent = originalLabel
        }, 1500)
      }
    })
  )

  row.appendChild(
    createActionButton('Save as Benchmark', async (button) => {
      if (!desktopWindow.sentraDesktop?.invoke || !display) {
        return
      }

      const originalLabel = button.textContent ?? 'Save as Benchmark'
      button.disabled = true
      button.textContent = 'Saving...'

      try {
        const result = await desktopWindow.sentraDesktop.invoke('desktop:command', {
          command: 'benchmark:save',
          payload: {
            id: `bench-${runRecord.id}`,
            title: runRecord.rawInput.slice(0, 72),
            prompt: runRecord.rawInput,
            taskType: runRecord.taskType,
            tone: runRecord.tone,
            format: runRecord.format,
            optimizerLane: runRecord.optimizerLane ?? 'INTERACTIVE',
          },
        })
        const benchmarkId =
          isObjectRecord(result) &&
          isObjectRecord(result.benchmark) &&
          typeof result.benchmark.id === 'string'
            ? result.benchmark.id
            : 'benchmark'

        button.textContent = 'Saved'
        appendConsoleLine(
          display,
          'sys',
          `[BENCHMARK] Saved as ${benchmarkId}. Jalankan /benchmark run ${benchmarkId} kapan saja.`
        )
      } catch (error) {
        button.textContent = 'Failed'
        appendConsoleLine(display, 'sys', `[ERROR] ${formatDesktopErrorMessage(error)}`)
      } finally {
        window.setTimeout(() => {
          button.disabled = false
          button.textContent = originalLabel
        }, 1500)
      }
    })
  )

  row.appendChild(
    createActionButton('Re-run', () => {
      if (!input || isExecuting) {
        return
      }

      currentProvider = runRecord.targetLlm
      if (runRecord.sourceMode === 'optimize') {
        updateMode('optimize')
        if (runRecord.optimizerLane) {
          updateOptimizerLane(runRecord.optimizerLane)
        }
      } else {
        updateMode('transform')
      }

      input.value = runRecord.rawInput
      input.focus()
      void execute()
    })
  )

  row.appendChild(
    createActionButton('Evaluate', async (button) => {
      if (!desktopWindow.sentraDesktop?.invoke || !display || isExecuting) {
        return
      }

      const originalLabel = button.textContent ?? 'Evaluate'
      button.disabled = true
      button.textContent = 'Running...'
      setExecutionState(true)

      const started = Date.now()
      appendConsoleLine(display, 'user', '/evaluate saved output')
      appendConsoleLine(display, 'sys', '[WAIT] Evaluator sedang memproses output tersimpan...')

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
          `[DONE] Evaluasi selesai dalam ${Math.round((Date.now() - started) / 1000)}s`
        )
      } catch (error) {
        appendConsoleLine(display, 'sys', `[ERROR] ${formatDesktopErrorMessage(error)}`)
      } finally {
        setExecutionState(false)
        button.disabled = false
        button.textContent = originalLabel
        input?.focus()
      }
    })
  )

  line.appendChild(row)
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
      targetLlm: currentProvider,
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
        : currentProvider

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

function appendConsoleLine(
  container: HTMLElement,
  type: 'sys' | 'user' | 'agent',
  text: string,
  options: AppendConsoleLineOptions = {}
) {
  const line = document.createElement('div')
  line.className = `line type-${type}`
  line.textContent = text
  if (type === 'agent') {
    attachCopyButton(line, options.copyText ?? text)
    if (options.runRecord) {
      attachOutputActions(line, options.runRecord)
    }
  }
  container.appendChild(line)
  container.scrollTop = container.scrollHeight
  return line
}

function syncOptimizerLaneModelPresentation() {
  const laneState = optimizerLaneStates[currentOptimizerLane]

  if (typeof laneState?.preferredModel === 'string' && laneState.preferredModel.trim()) {
    currentModelLabel = laneState.preferredModel
  }

  if (modelChip && typeof laneState?.modelChip === 'string' && laneState.modelChip.trim()) {
    modelChip.textContent = laneState.modelChip
  }
}

function setExecutionState(running: boolean) {
  isExecuting = running

  if (input) {
    input.disabled = running
  }

  if (runBtn) {
    runBtn.disabled = running
    runBtn.textContent = running ? 'WAIT' : 'EXEC'
  }

  if (clearBtn) {
    clearBtn.disabled = running
  }

  for (const button of modeButtons) {
    button.toggleAttribute('disabled', running)
  }

  for (const button of optimizerLaneButtons) {
    button.toggleAttribute('disabled', running)
  }
}

function buildPendingLabel() {
  if (currentMode === 'transform') {
    return 'Transform sedang memproses prompt...'
  }

  const laneLabel = currentOptimizerLane === 'INTERACTIVE' ? 'Interactive' : 'Deep'
  return `Optimizer ${laneLabel} berjalan di ${currentProvider}/${currentModelLabel}...`
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
  container.appendChild(line)
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
  line.className = 'line type-sys'
  line.dataset.requestStatusId = requestId
  line.textContent = '[STATE] Menyiapkan Optimizer...'
  container.appendChild(line)
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
  rawInput: string
) {
  const streamLine = ensureOptimizeStreamLine(container, requestId)
  const statusLine = ensureOptimizeStatusLine(container, requestId)
  const onStream = desktopWindow.sentraDesktop?.onStream
  const offStream = desktopWindow.sentraDesktop?.offStream

  if (!onStream || !offStream) {
    throw new Error('Desktop stream bridge not ready yet.')
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
    container.appendChild(line)
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

      statusLine.textContent = `[STATE] ${payload.message}`
      if (payload.message === 'waiting') {
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
      const formattedText = formatDesktopResult(payload.response)
      streamLine.textContent = formattedText
      attachCopyButton(streamLine, formattedText)
      const runRecord = buildRunRecord('optimize', rawInput, payload.response, requestId)
      if (runRecord) {
        lastRunRecord = runRecord
        attachOutputActions(streamLine, runRecord)
        void appendRecentRunToWorkspace({
          id: runRecord.id,
          sourceMode: runRecord.sourceMode,
          rawInput: runRecord.rawInput,
          outputText: runRecord.outputText,
        })
      }
      removeOptimizeStreamArtifacts(requestId, {
        removeStatusLine: true,
      })
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
      reject(new Error(payload.message))
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
          reject(new Error('Desktop stream request mismatch.'))
        }
      } catch (error) {
        clearOptimizeTransientFailureArtifacts(requestId)
        cleanup()
        reject(error instanceof Error ? error : new Error('Desktop stream bridge not ready yet.'))
      }
    })()
  })
}

function applyMode(
  container: HTMLElement,
  mode: DesktopPrimaryModeId,
  buttons: HTMLElement[],
  inputElement?: HTMLInputElement | null
) {
  const copy = getModeCopy(mode)
  const modeSubtitle = document.getElementById('modeSubtitle') as HTMLElement | null
  const statusTitle = document.getElementById('statusTitle') as HTMLElement | null
  const statusTag = document.getElementById('statusTag') as HTMLElement | null
  const statusCopy = document.getElementById('statusCopy') as HTMLElement | null

  container.dataset.mode = mode

  if (modeSubtitle) {
    modeSubtitle.textContent = copy.subtitle
  }

  if (statusTitle) {
    statusTitle.textContent = copy.title
  }

  if (statusTag) {
    statusTag.textContent = copy.tag
  }

  if (statusCopy) {
    statusCopy.textContent = copy.copy
  }

  if (inputElement) {
    inputElement.placeholder = copy.placeholder
  }

  if (optimizerLaneControls) {
    optimizerLaneControls.hidden = mode !== 'optimize'
  }

  for (const button of optimizerLaneButtons) {
    button.classList.toggle('active', button.dataset.lane === currentOptimizerLane)
  }

  for (const button of buttons) {
    button.classList.toggle('active', button.dataset.mode === mode)
  }
}

function resetConsoleView(container: HTMLElement, mode: DesktopPrimaryModeId) {
  container.innerHTML = ''
  appendConsoleLine(container, 'sys', '[BOOT] Sentra Prompt Console ready.')
  appendConsoleLine(container, 'agent', `${MODE_COPY[mode].title} mode active.`)
  if (mode === 'optimize') {
    appendConsoleLine(
      container,
      'sys',
      `[INFO] Lane aktif: ${currentOptimizerLane === 'INTERACTIVE' ? 'Interactive' : 'Deep'}`
    )
  }
  appendConsoleLine(
    container,
    'sys',
    '[INFO] Guest-ready: prompt, /evaluate, /templates list. Account commands: /library search, /usage summary, /auth login.'
  )
}

function formatDesktopErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : 'Desktop command bridge not ready yet.'

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
    return `Provider ${provider} diminta, tetapi ${envKey} tidak terdeteksi di runtime desktop. Set ${envKey} lalu jalankan ulang desktop shell.`
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

function formatMetadataList(metadata: Record<string, unknown>) {
  const lines: string[] = []

  if (typeof metadata.provider === 'string') {
    lines.push(`- Provider: ${metadata.provider}`)
  }

  if (typeof metadata.model === 'string') {
    lines.push(`- Model: ${metadata.model}`)
  }

  if (typeof metadata.taskType === 'string') {
    lines.push(`- Task Type: ${metadata.taskType}`)
  }

  if (typeof metadata.tone === 'string') {
    lines.push(`- Tone: ${metadata.tone}`)
  }

  if (typeof metadata.format === 'string') {
    lines.push(`- Format: ${metadata.format}`)
  }

  if (typeof metadata.latencyMs === 'number') {
    lines.push(`- Latency: ${metadata.latencyMs}ms`)
  }

  return lines
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
    const metadataLines = metadata ? formatMetadataList(metadata) : []

    if (typeof failure?.code === 'string') {
      metadataLines.unshift(`- Code: ${failure.code}`)
    }

    if (metadataLines.length > 0) {
      lines.push('', '## Metadata', ...metadataLines)
    }

    lines.push('', '## Retry', '- Re-run with the same provider from the action row.')
    return lines.join('\n')
  }

  if (superPrompt && typeof superPrompt.fullPrompt === 'string') {
    const promptBody = buildOptimizePromptText(superPrompt)

    const lines = [
      '# Optimized Prompt',
      '',
      promptBody || '[No visible prompt content returned by provider.]',
    ]
    const metadataLines = metadata ? formatMetadataList(metadata) : []

    if (metadataLines.length > 0) {
      lines.push('', '## Metadata', ...metadataLines)
    }

    return lines.join('\n')
  }

  if (typeof result.transformedPrompt === 'string') {
    const lines = ['# Transformed Prompt', '', result.transformedPrompt.trim()]

    if (typeof result.tokensEstimate === 'number') {
      lines.push('', '## Metadata', `- Tokens Estimate: ${result.tokensEstimate}`)
    }

    return lines.join('\n')
  }

  return JSON.stringify(result, null, 2)
}

function updateMiniPanel() {
  if (!mTitle || !mSubtitle || !mModel || !mStatusTitle || !mStatusTag || !mStatusCopy) {
    return
  }

  const copy = {
    transform: {
      title: 'Transform',
      tag: 'Default Mode',
      copy: 'Wrap raw prompts into a deterministic prompt-engineering scaffold.',
      subtitle: 'Desktop prompt shell',
    },
    optimize: {
      title: 'Optimizer',
      tag: 'drferdiskandar',
      copy: 'LLM-backed super-prompt editor.',
      subtitle: 'LLM editor',
    },
  }[currentMode]

  mTitle.textContent = 'Sentra Prompt Console'
  mSubtitle.textContent = copy.subtitle
  mModel.textContent = currentModelLabel
  mStatusTitle.textContent = copy.title
  mStatusTag.textContent = copy.tag
  mStatusCopy.textContent = copy.copy

  mTransformBtn?.classList.toggle('active', currentMode === 'transform')
  mOptimizeBtn?.classList.toggle('active', currentMode === 'optimize')
}

function updateMode(mode: DesktopPrimaryModeId) {
  currentMode = mode

  if (!shell || !display || isExecuting) {
    updateMiniPanel()
    return
  }

  applyMode(shell, mode, modeButtons, input)
  resetConsoleView(display, mode)
  renderSuggestionPanel(input?.value ?? '')
  updateMiniPanel()
}

function updateOptimizerLane(lane: DesktopOptimizeLane) {
  currentOptimizerLane = lane
  syncOptimizerLaneModelPresentation()

  if (!shell || !display || isExecuting || currentMode !== 'optimize') {
    return
  }

  applyMode(shell, currentMode, modeButtons, input)
  resetConsoleView(display, currentMode)
  renderSuggestionPanel(input?.value ?? '')
}

async function loadShellState() {
  try {
    const state = await desktopWindow.sentraDesktop?.getShellState?.()

    if (state?.appName) {
      document.title = state.appName
      if (appTitle) {
        appTitle.textContent = state.appName
      }
    }

    if (state?.modelChip && modelChip) {
      modelChip.textContent = state.modelChip
    }

    if (state?.preferredProvider) {
      currentProvider = state.preferredProvider
    }

    if (state?.preferredModel) {
      currentModelLabel = state.preferredModel
    }

    renderShellBadges(state?.badges ?? [])

    if (state?.optimizerLaneStates) {
      optimizerLaneStates = state.optimizerLaneStates
      syncOptimizerLaneModelPresentation()
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load desktop shell state.'
    if (display) {
      appendConsoleLine(display, 'sys', `[WARN] ${message}`)
    }
  }
}

async function executeMini() {
  if (!mCmdInput || !mDisplay) {
    return
  }

  const value = mCmdInput.value.trim()
  if (!value) {
    return
  }

  appendConsoleLine(mDisplay, 'user', value)
  mCmdInput.value = ''

  const parsed = parseConsoleInput(value)
  if (parsed.kind === 'command') {
    appendConsoleLine(mDisplay, 'sys', `[CMD] ${parsed.command}`)
    return
  }

  const promptValue = parsed.value
  const requestId = currentMode === 'optimize' ? crypto.randomUUID() : undefined
  const invocation = buildPromptInvocation(currentMode, promptValue, requestId)

  if (mRunBtn) {
    mRunBtn.disabled = true
    mRunBtn.textContent = 'WAIT'
  }
  if (mClearBtn) {
    mClearBtn.disabled = true
  }
  mCmdInput.disabled = true

  try {
    if (requestId && isOptimizeInvocation(invocation)) {
      await executeOptimizeStream(invocation, requestId, mDisplay, promptValue)
    } else {
      const result = (await desktopWindow.sentraDesktop?.invoke?.(
        invocation.channel,
        invocation.payload
      )) ?? {
        status: 'pending',
        channel: invocation.channel,
      }
      const formattedText = formatDesktopResult(result)
      appendConsoleLine(mDisplay, 'agent', formattedText)
    }
  } catch (error) {
    appendConsoleLine(mDisplay, 'sys', `[ERROR] ${formatDesktopErrorMessage(error)}`)
  } finally {
    if (mRunBtn) {
      mRunBtn.disabled = false
      mRunBtn.textContent = 'EXEC'
    }
    if (mClearBtn) {
      mClearBtn.disabled = false
    }
    mCmdInput.disabled = false
    mCmdInput.focus()
  }
}

async function execute() {
  if (!input || !display) {
    return
  }

  const value = input.value.trim()
  if (!value) {
    return
  }

  appendConsoleLine(display, 'user', value)
  input.value = ''
  hideSlashPalette()
  hideSuggestionPanel()

  const parsed = parseConsoleInput(value)
  if (parsed.kind === 'command' && parsed.command === 'help.show') {
    renderCommandHelpPanel('')
    commandHelpPanel?.removeAttribute('hidden')
    appendConsoleLine(display, 'sys', '[HELP] Command panel opened.')
    input.focus()
    return
  }

  if (parsed.kind === 'command' && parsed.command === 'recent.list') {
    await openWorkbenchPanel()
    appendConsoleLine(display, 'sys', '[WORKBENCH] Recent runs opened.')
    input.focus()
    return
  }

  setExecutionState(true)

  const started = Date.now()
  const pendingLines = [appendConsoleLine(display, 'sys', `[WAIT] ${buildPendingLabel()}`)]
  const clearPendingLines = () => {
    for (const line of pendingLines) {
      line.remove()
    }
    pendingLines.length = 0
  }
  const heartbeat = window.setInterval(() => {
    pendingLines.push(
      appendConsoleLine(
        display,
        'sys',
        `[WAIT] Masih berjalan... ${Math.round((Date.now() - started) / 1000)}s`
      )
    )
  }, 10000)

  try {
    const promptValue = parsed.kind === 'prompt' ? parsed.value : null
    const requestId =
      promptValue !== null && currentMode === 'optimize' ? crypto.randomUUID() : undefined
    const invocation =
      promptValue !== null
        ? buildPromptInvocation(currentMode, promptValue, requestId)
        : buildCommandInvocation(parsed as Extract<ParsedConsoleInput, { kind: 'command' }>)

    if (requestId && isOptimizeInvocation(invocation)) {
      await executeOptimizeStream(invocation, requestId, display, promptValue ?? '')
    } else {
      const result = (await desktopWindow.sentraDesktop?.invoke?.(
        invocation.channel,
        invocation.payload
      )) ?? {
        status: 'pending',
        channel: invocation.channel,
      }
      const formattedText = formatDesktopResult(result)
      const runRecord =
        promptValue !== null && currentMode === 'transform'
          ? buildRunRecord('transform', promptValue, result)
          : null

      if (runRecord) {
        lastRunRecord = runRecord
      }

      appendConsoleLine(display, 'agent', formattedText, {
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
      } else if (parsed.kind === 'command' && parsed.command === 'evaluate') {
        await appendRecentRunToWorkspace({
          id: crypto.randomUUID(),
          sourceMode: 'evaluate',
          rawInput: parsed.args[0] ?? '',
          outputText: formattedText,
        })
      }
    }

    clearPendingLines()
    appendConsoleLine(
      display,
      'sys',
      `[DONE] Selesai dalam ${Math.round((Date.now() - started) / 1000)}s`
    )
  } catch (error) {
    const message = formatDesktopErrorMessage(error)
    clearPendingLines()
    appendConsoleLine(display, 'sys', `[ERROR] ${message}`)
  } finally {
    window.clearInterval(heartbeat)
    setExecutionState(false)
    input.focus()
  }
}

for (const button of modeButtons) {
  button.addEventListener('click', () => {
    const nextMode = button.dataset.mode === 'optimize' ? 'optimize' : 'transform'
    updateMode(nextMode)
  })
}

for (const button of optimizerLaneButtons) {
  button.addEventListener('click', () => {
    const nextLane = button.dataset.lane === 'DEEP' ? 'DEEP' : 'INTERACTIVE'
    updateOptimizerLane(nextLane)
  })
}

closeBtn?.addEventListener('click', () => desktopWindow.sentraDesktop?.close?.())
powerBtn?.addEventListener('click', () => desktopWindow.sentraDesktop?.close?.())
clearBtn?.addEventListener('click', () => {
  if (display) {
    resetConsoleView(display, currentMode)
  }
  hideOverlayPanels()
  hideSlashPalette()
  if (input) {
    input.value = ''
  }
  hideSuggestionPanel()
  lastCopyText = ''
  if (copyLastBtn) {
    copyLastBtn.disabled = true
  }
})
runBtn?.addEventListener('click', () => {
  void execute()
})
copyLastBtn?.addEventListener('click', () => {
  if (!lastCopyText) return
  navigator.clipboard.writeText(extractCopyableText(lastCopyText)).then(() => {
    if (copyLastBtn) {
      copyLastBtn.textContent = 'COPIED'
      setTimeout(() => {
        copyLastBtn.textContent = 'COPY'
      }, 1500)
    }
  })
})

function exitMiniMode() {
  if (!consoleRig || !miniWidget || !miniPanel) return
  const desktop = (window as DesktopWindow).sentraDesktop
  widgetState = 'full'
  miniWidget.setAttribute('hidden', '')
  miniPanel.setAttribute('hidden', '')
  miniPanel.classList.remove('open')
  consoleRig.removeAttribute('hidden')
  // Reset native drag position if needed
  void desktop?.invoke?.('desktop:toggle-mini', { mode: 'normal' })
  input?.focus()
}

miniToggleBtn?.addEventListener('click', () => {
  desktopWindow.sentraDesktop?.minimize?.()
})
miniBar?.addEventListener('click', (e) => {
  if (widgetState === 'minimized' && !dragDetected) {
    e.stopPropagation()
    exitMiniMode()
  }
})
mCollapseBtn?.addEventListener('click', () => exitMiniMode())

commandHelpCloseBtn?.addEventListener('click', () => {
  commandHelpPanel?.setAttribute('hidden', '')
})
workbenchCloseBtn?.addEventListener('click', () => {
  workbenchPanel?.setAttribute('hidden', '')
})
input?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    hideOverlayPanels()
    hideSlashPalette()
    return
  }

  if (event.key === 'Enter') {
    void execute()
  }
})
input?.addEventListener('input', () => {
  renderSlashPalette(input.value)
  renderSuggestionPanel(input.value)

  if (!commandHelpPanel?.hasAttribute('hidden')) {
    renderCommandHelpPanel(input.value)
  }
})

mTransformBtn?.addEventListener('click', () => updateMode('transform'))
mOptimizeBtn?.addEventListener('click', () => updateMode('optimize'))
mRunBtn?.addEventListener('click', () => void executeMini())
mClearBtn?.addEventListener('click', () => {
  if (mDisplay) {
    resetConsoleView(mDisplay, currentMode)
  }
  if (mCmdInput) {
    mCmdInput.value = ''
  }
})
mCmdInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    void executeMini()
  }
})

if (shell && display) {
  applyMode(shell, currentMode, modeButtons, input)
  resetConsoleView(display, currentMode)
  renderSuggestionPanel(input?.value ?? '')
}
void loadShellState()

const NODRAG_SELECTOR =
  'button, input, a, select, textarea, label, span, strong, svg, path, [contenteditable="true"], .console-box, .mini-console, .overlay-panel, .slash-palette, .suggestion-panel, .mode-bar, .mode-btn, .command-bar, .cmd-input, .secondary-btn, .action-btn, .optimizer-lane-switch, .optimizer-lane-btn, .window-controls, .close-btn, .mini-toggle-btn, .mini-mode-bar, .mini-mode-btn, .mini-cmd-bar, .mini-cmd-input, .mini-btn-sm'

let dragStart: { mx: number; my: number; wx: number; wy: number } | null = null
let dragAttempt = 0
let dragDetected = false

function cancelDrag() {
  dragAttempt += 1
  dragStart = null
}

document.addEventListener('mousedown', async (event) => {
  if (event.button !== 0 || !(event.target instanceof HTMLElement)) return

  const dragSurface = widgetState === 'minimized' ? miniWidget : shell
  if (!dragSurface || dragSurface.hidden || !dragSurface.contains(event.target)) return
  if (event.target.closest(NODRAG_SELECTOR)) return

  dragDetected = false

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

  if (widgetState === 'minimized') {
    dragDetected = true
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

const HUD_POLL_MS = 1000

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

function setHudText(id: string, text: string) {
  const element = document.getElementById(id)
  if (element) {
    element.textContent = text
  }
}

function setHudBar(id: string, ratio: number) {
  const element = document.getElementById(id)
  if (element) {
    element.style.width = `${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%`
  }
}

function applySystemStats(stats: DesktopSystemStats) {
  const heapLabel = `${stats.heapMb.toFixed(1)} MB`
  const cpuLabel = `${stats.cpuPercent.toFixed(1)}%`

  setHudText('hudTemp', heapLabel)
  setHudText('hudLoad', cpuLabel)
  setHudText('hudMem', `${stats.usedMemGb.toFixed(1)} / ${Math.round(stats.totalMemGb)} GB`)
  setHudText('hudUptime', formatUptime(stats.uptimeSeconds))
  setHudBar('hudTempBar', stats.heapLimitMb > 0 ? stats.heapMb / stats.heapLimitMb : 0)
  setHudBar('hudLoadBar', stats.cpuPercent / 100)

  setHudText('mHudTemp', heapLabel)
  setHudText('mHudLoad', cpuLabel)
  setHudText('mHudMem', `${stats.usedMemGb.toFixed(1)}/${Math.round(stats.totalMemGb)}`)
}

async function pollSystemStats() {
  const stats = await desktopWindow.sentraDesktop?.invoke?.('system:stats').catch(() => null)

  if (isSystemStats(stats)) {
    applySystemStats(stats)
  }
}

if (document.getElementById('systemHud')) {
  void pollSystemStats()
  window.setInterval(() => {
    void pollSystemStats()
  }, HUD_POLL_MS)
}

export {}
