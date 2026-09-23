/**
 * Every system-facing string the desktop renderer emits.
 *
 * The renderer keeps logic only and reads its text from here via
 * `import * as strings from './strings'`. Text the user typed and text the
 * provider returned are never routed through this module.
 *
 * This module must stay import-free: `index.html` resolves the id `'./strings'`
 * through a small require shim, so it has no module graph of its own.
 */

// ── Boot banner ──────────────────────────────────────────────────────────────

export const bannerTitle = 'Sentra Prompt Console'

export const bannerSubtitle = 'Sentra Artificial Intelligence · prompt engineering workspace'

/** Decorative rules are 72 characters (the prose width), never the window width. */
export const bannerRule = '─'.repeat(72)

/** A non-breaking space so the blank banner row keeps its line box. */
export const bannerBlank = ' '

// ── Startup block (reference-console-startup.html) ───────────────────────────
// Every value printed next to these labels comes from real shell state; a row whose
// value is unavailable is omitted, never filled with a placeholder.

export const sessionLabelAgent = 'agent'
export const sessionLabelProvider = 'provider'
export const sessionLabelModel = 'model'
export const sessionLabelLane = 'lane'
export const sessionLabelProfile = 'profile'
export const sessionLabelEffort = 'effort'

export const startupInstruction = 'Type an idea and press Enter. It becomes a Coding Brief.'

export const startupExamples: Array<{ command: string; argument: string }> = [
  { command: 'brief', argument: '"the optimizer returns truncated prompts as successful results"' },
  { command: 'super', argument: '"write the launch note for the September release"' },
]

/** Two rows of two command hints each: [command, description]. */
export const startupCommandHints: Array<Array<[string, string]>> = [
  [
    ['log', 'recent briefs'],
    ['key', 'provider keys'],
  ],
  [
    ['help', 'all commands'],
    ['stat', 'system snapshot'],
  ],
]

export function briefCountsLine(total: number, complete: number, needsCheck: number): string {
  const briefs = `${total} ${total === 1 ? 'brief' : 'briefs'} today`
  if (total === 0) {
    return `[DONE] ${briefs}`
  }
  return `[DONE] ${briefs} · ${complete} complete · ${needsCheck} needs check`
}

export const readyLine = '[DONE] ready'

// ── Bare (non-slash) command catalog ─────────────────────────────────────────

export const bareCommandCatalog: Array<{ usage: string; summary: string }> = [
  { usage: 'brief <text>', summary: 'Build a Coding Brief from a raw idea' },
  { usage: 'super <text>', summary: 'Build a Super Prompt from a raw idea' },
  { usage: 'transform <text>', summary: 'Wrap a raw prompt in a deterministic scaffold' },
  { usage: 'lane <interactive|deep>', summary: 'Choose the optimizer lane' },
  { usage: 'profile <default|claude|codex|gemini|grok>', summary: 'Choose the compiler profile' },
  { usage: 'effort <low|medium|high|xhigh|max>', summary: 'Choose the transform effort level' },
  { usage: 'log', summary: 'Show recent runs and saved benchmarks' },
  { usage: 'key <PROVIDER> <apiKey>', summary: 'Save a provider key, or show key status' },
  { usage: 'stat', summary: 'Show desktop process telemetry once' },
  { usage: 'mode', summary: 'Show the active mode, lane, profile, effort, and output' },
  { usage: 'copy', summary: 'Copy the last result to the clipboard' },
  { usage: 'clear', summary: 'Clear the transcript' },
  { usage: 'help', summary: 'Show the command list' },
  { usage: 'quit', summary: 'Close the desktop window' },
]

// ── Slash command summaries ──────────────────────────────────────────────────

export const summaryHelpShow = 'Show available commands and badges'
export const summaryEvaluate = 'Evaluate a prompt body with the current provider'
export const summaryLibraryList = 'List saved library prompts'
export const summaryLibrarySearch = 'Search saved library prompts'
export const summaryLibrarySave = 'Save the current output to Library'
export const summaryDraftSave = 'Save the current run as a local draft'
export const summaryRecentList = 'Show recent runs and saved benchmarks'
export const summaryBenchmarkList = 'List saved benchmark cases'
export const summaryBenchmarkSave = 'Save the current run as a benchmark case'
export const summaryBenchmarkRun = 'Run one saved benchmark case'
export const summaryProviderList = 'Show provider key status'
export const summaryUsageSummary = 'Show current quota usage and tier'
export const summarySubscriptionUpgrade = 'Start a desktop upgrade checkout flow'

// ── Action buttons ───────────────────────────────────────────────────────────

export const actionCopyLabel = '[c] copy'
export const actionCopyAria = 'Copy result'
export const actionCopiedLabel = '[c] copied'
export const actionCopyFailedLabel = '[c] failed'

export const actionLibraryLabel = '[l] library'
export const actionLibraryAria = 'Save to library'

export const actionDraftLabel = '[d] draft'
export const actionDraftAria = 'Save as draft'

export const actionBenchmarkLabel = '[b] benchmark'
export const actionBenchmarkAria = 'Save as benchmark'

export const actionRerunLabel = '[r] rerun'
export const actionRerunAria = 'Rerun'

export const actionEvaluateLabel = '[e] evaluate'
export const actionEvaluateAria = 'Evaluate result'

export const actionRunBenchmarkLabel = '[b] run'
export const actionRunBenchmarkAria = 'Run benchmark'

export const transientSaving = 'Saving...'
export const transientSaved = 'Saved'
export const transientFailed = 'Failed'
export const transientRunning = 'Running...'

// ── Completion lines ─────────────────────────────────────────────────────────

export function finishedIn(seconds: number): string {
  return `[DONE] Finished in ${seconds}s`
}

export function evaluationFinishedIn(seconds: number): string {
  return `[DONE] Evaluation finished in ${seconds}s`
}

export function benchmarkFinishedIn(seconds: number): string {
  return `[DONE] Benchmark finished in ${seconds}s`
}

export const copiedNotice = '[DONE] copied'

export const noRecentRuns = '[DONE] No recent runs.'

// ── Pending lines ────────────────────────────────────────────────────────────

export const transformPendingLabel = 'Transform is processing the prompt...'

export const laneLabelInteractive = 'Interactive'
export const laneLabelDeep = 'Deep'

export function optimizerPendingLabel(
  laneLabel: string,
  provider: string,
  model: string
): string {
  return `Optimizer ${laneLabel} running on ${provider}/${model}...`
}

export const preparingOptimizer = 'Preparing Optimizer...'

export function stillRunning(seconds: number): string {
  return `[WAIT] Still running... ${seconds}s`
}

export const evaluatorPending = '[WAIT] Evaluator is processing the saved output...'

export const benchmarkPending = '[WAIT] Benchmark is running the acceptance harness...'

// ── Save notices ─────────────────────────────────────────────────────────────

export function benchmarkSavedNotice(benchmarkId: string): string {
  return `[BENCHMARK] Saved as ${benchmarkId}. Run /benchmark run ${benchmarkId} at any time.`
}

export function libraryItemCreatedNotice(promptId: string): string {
  return `[SAVED] Library item ${promptId} created.`
}

export function draftSavedNotice(draftId: string): string {
  return `[DRAFT] Saved as ${draftId}.`
}

// ── Badges ───────────────────────────────────────────────────────────────────

export const providerMissingBadge =
  "[WARN] Provider missing — add a provider key with 'key <provider> <apikey>'"

// ── Errors ───────────────────────────────────────────────────────────────────

export const laneOptionsError = '[ERROR] lane accepts only: interactive, deep.'

export function profileOptionsError(options: string): string {
  return `[ERROR] profile accepts only: ${options}.`
}

export function effortOptionsError(options: string): string {
  return `[ERROR] effort accepts only: ${options}.`
}

export const nothingToCopy = '[ERROR] Nothing to copy yet.'

export const clipboardRejected = '[ERROR] Clipboard rejected the copy request.'

export const telemetryUnavailable = '[ERROR] Process telemetry is unavailable.'

export const missingIdeaText = '[ERROR] This command needs idea text.'

export const noOutputForLibrary = 'No recent output to save to the library.'

export const noOutputForDraft = 'No recent output to save as a draft.'

export const noOutputForBenchmark = 'No recent output to save as a benchmark.'

export const benchmarkRunNeedsId = 'Benchmark run needs a benchmark id.'

export const providerResolving =
  'Desktop provider is still being verified. Wait until the provider status is ready.'

export const providerUnavailable =
  'No desktop provider is ready. Add a provider key, then restart the shell.'

export function providerEnvKeyMissing(provider: string, envKey: string): string {
  return `Provider ${provider} was requested, but ${envKey} was not detected in the desktop runtime. Set ${envKey}, then restart the desktop shell.`
}

export const bridgeNotReady = 'Desktop command bridge not ready yet.'

export const streamBridgeNotReady = 'Desktop stream bridge not ready yet.'

export const streamRequestMismatch = 'Desktop stream request mismatch.'

export const shellStateUnavailable = 'Unable to load desktop shell state.'

export function unsupportedCommand(command: string): string {
  return `Unsupported command: ${command}`
}

// ── Log listing ──────────────────────────────────────────────────────────────

export function compareReadyLine(rawInput: string): string {
  return `COMPARE READY · transform + optimize  ${rawInput}`
}

// ── Quality line fragments ───────────────────────────────────────────────────

/**
 * Verdict words that open a quality line; the renderer keys its parser on these. The
 * ok / warn / error prefix comes from the status style (reference-console-sentra.html:
 * `ok    complete · 5 sections · 1 attempt`), so it is not part of the text.
 */
export const qualityOk = 'complete'
export const qualityNeedsReview = 'needs review'
/**
 * A thin brief (V11, docs/CODING_BRIEF_STANDARD.md §8.3): valid, but CONTEXT and DONE WHEN
 * both defer to the user. Printed as a warn line, never as ok; the `warn` prefix comes from
 * the status-warn style, so it is not part of this text.
 */
export const qualityThin = 'thin brief — add where to work and how to check it'

export function sectionsCount(count: number): string {
  return `${count} ${count === 1 ? 'section' : 'sections'}`
}

export function attemptsCount(count: number): string {
  return `${count} ${count === 1 ? 'attempt' : 'attempts'}`
}

// ── Clarification round (docs/CODING_BRIEF_STANDARD.md §6 P5) ─────────────────
// Questions come after a delivered brief and only refine it. While a question is pending,
// every typed line is its answer; Enter alone keeps the proposal; `skip` ends the round.

export const clarificationSkipWord = 'skip'

export function clarificationHeading(index: number, total: number, line: string): string {
  return `question ${index} of ${total}  ${line}`
}

/** The hint under each question, by the element the line comes from. */
export const clarificationHints = {
  ASSUMPTION: 'Correct? Type the right value, or press Enter to keep it.',
  CONTEXT: 'Where should the agent work? Type a folder, file or screen, or press Enter to let it explore.',
  DONE_WHEN: 'How will you check it is done? Type the check, or press Enter to leave it to the agent.',
  SCOPE: 'Type the answer, or press Enter to leave it open.',
} as const

export const clarificationSkipHint = 'Type skip to keep the brief as it is.'

export const clarificationKept = 'kept as proposed'

/** Skipping and keeping every proposal are ordinary choices, so these carry no status. */
export const clarificationSkipped = 'questions skipped — the brief above is unchanged'

export const clarificationNoAnswers = 'no answers — the brief above is unchanged'

export const clarificationRefineFailed =
  '[WARN] the refined brief failed validation — the brief above is unchanged'

// ── Provider keys ─────────────────────────────────────────────────────────────

export function providerKeySaved(provider: string): string {
  return `[DONE] provider=${provider.toLowerCase()} saved`
}

export const providerKeysNone = '[DONE] no provider keys'
