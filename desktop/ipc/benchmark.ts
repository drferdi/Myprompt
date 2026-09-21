import { randomUUID } from 'node:crypto'

import type { createWorkspaceStore } from './workspace-store'

import {
  loadAcceptanceEnv,
  runAcceptanceSuite,
  summarizeAcceptanceReport,
  toAcceptanceSuite,
} from '@/scripts/optimizer-acceptance'
import type {
  DesktopBenchmarkBudgets,
  DesktopBenchmarkCase,
  LLMProviderName,
  OptimizeLane,
  OutputFormat,
  PromptTone,
  TaskType,
} from '@/types'

type DesktopWorkspaceStore = ReturnType<typeof createWorkspaceStore>

const DEFAULT_BENCHMARK_BUDGETS: Record<OptimizeLane, DesktopBenchmarkBudgets[OptimizeLane]> = {
  INTERACTIVE: {
    maxFirstVisibleMs: 5000,
    maxTotalLatencyMs: 12000,
    minPromptChars: 240,
    maxPromptChars: 2400,
  },
  DEEP: {
    maxFirstVisibleMs: 15000,
    maxTotalLatencyMs: 45000,
    minPromptChars: 320,
  },
}

function normalizeBenchmarkLanes(value: unknown): OptimizeLane[] {
  if (!Array.isArray(value)) {
    return ['INTERACTIVE']
  }

  const lanes = value.filter(
    (lane): lane is OptimizeLane => lane === 'INTERACTIVE' || lane === 'DEEP'
  )

  return lanes.length > 0 ? lanes : ['INTERACTIVE']
}

function buildDefaultBudgets(lanes: OptimizeLane[]): DesktopBenchmarkBudgets {
  const budgets: DesktopBenchmarkBudgets = {}

  for (const lane of lanes) {
    budgets[lane] = DEFAULT_BENCHMARK_BUDGETS[lane]
  }

  return budgets
}

function inferBenchmarkTitle(prompt: string) {
  const normalized = prompt.trim().replace(/\s+/g, ' ')
  return normalized.slice(0, 72) || 'Saved benchmark'
}

export async function listDesktopBenchmarks(store: DesktopWorkspaceStore) {
  return {
    benchmarks: await store.listBenchmarks(),
  }
}

export async function saveDesktopBenchmark(
  store: DesktopWorkspaceStore,
  payload: Record<string, unknown>
) {
  const prompt =
    typeof payload.prompt === 'string'
      ? payload.prompt.trim()
      : typeof payload.rawInput === 'string'
        ? payload.rawInput.trim()
        : ''

  if (!prompt) {
    throw new Error('Benchmark save requires a prompt or raw input.')
  }

  const lanes = normalizeBenchmarkLanes(
    Array.isArray(payload.lanes)
      ? payload.lanes
      : typeof payload.optimizerLane === 'string'
        ? [payload.optimizerLane]
        : undefined
  )

  const benchmark = await store.saveBenchmarkCase({
    id:
      typeof payload.id === 'string' && payload.id.trim()
        ? payload.id.trim()
        : `bench-${randomUUID()}`,
    title:
      typeof payload.title === 'string' && payload.title.trim()
        ? payload.title.trim()
        : inferBenchmarkTitle(prompt),
    prompt,
    taskType: typeof payload.taskType === 'string' ? (payload.taskType as TaskType) : 'GENERAL',
    tone: typeof payload.tone === 'string' ? (payload.tone as PromptTone) : 'PROFESSIONAL',
    format: typeof payload.format === 'string' ? (payload.format as OutputFormat) : 'STRUCTURED',
    lanes,
    budgets:
      typeof payload.budgets === 'object' && payload.budgets !== null
        ? (payload.budgets as DesktopBenchmarkBudgets)
        : buildDefaultBudgets(lanes),
  })

  return { benchmark }
}

export async function runDesktopBenchmark(
  store: DesktopWorkspaceStore,
  payload: Record<string, unknown>,
  options: {
    provider: LLMProviderName
    apiKey?: string
  }
) {
  const benchmarkId = typeof payload.id === 'string' ? payload.id.trim() : ''

  if (!benchmarkId) {
    throw new Error('Benchmark run requires a benchmark id.')
  }

  const benchmarks = await store.listBenchmarks()
  const benchmark = benchmarks.find((item) => item.id === benchmarkId)

  if (!benchmark) {
    throw new Error(`Benchmark ${benchmarkId} tidak ditemukan.`)
  }

  loadAcceptanceEnv()
  const report = await runAcceptanceSuite(toAcceptanceSuite([benchmark]), options)

  return {
    benchmark,
    report,
    summary: summarizeAcceptanceReport(report),
  }
}

export type { DesktopBenchmarkCase }
