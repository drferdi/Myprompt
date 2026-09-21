import { existsSync, readFileSync } from 'node:fs'
import path, { basename } from 'node:path'
import { parseEnv } from 'node:util'

import { loadEnvConfig } from '@next/env'

import { optimizePromptStreaming } from '@/lib/optimizer/engine'
import type {
  DesktopBenchmarkCase,
  LLMProviderName,
  OptimizeLane,
  OutputFormat,
  PromptTone,
  TaskType,
} from '@/types'

export interface AcceptanceBudget {
  maxFirstVisibleMs?: number
  maxTotalLatencyMs?: number
  minPromptChars?: number
  maxPromptChars?: number
}

export interface AcceptanceCase {
  id: string
  prompt: string
  taskType: TaskType
  tone: PromptTone
  format: OutputFormat
  lanes: OptimizeLane[]
  budgets: Partial<Record<OptimizeLane, AcceptanceBudget>>
}

export interface AcceptanceMetrics {
  firstVisibleMs: number | null
  totalLatencyMs: number
  promptChars: number
  hasVisibleOutput: boolean
}

export interface AcceptanceEvaluation {
  pass: boolean
  failures: string[]
}

export interface AcceptanceReportItem extends AcceptanceEvaluation {
  caseId: string
  lane: OptimizeLane
  provider: LLMProviderName
  model: string
  metrics: AcceptanceMetrics
}

const ACCEPTANCE_ENV_OVERRIDE_KEYS = [
  'OPENAI_API_KEY',
  'OPENAI_BASE_URL',
  'OPENAI_MODEL',
  'OPTIMIZER_INTERACTIVE_OPENAI_BASE_URL',
  'OPTIMIZER_INTERACTIVE_OPENAI_MODEL',
  'OPTIMIZER_DEEP_OPENAI_BASE_URL',
  'OPTIMIZER_DEEP_OPENAI_MODEL',
  'OPTIMIZER_OPENAI_BASE_URL',
  'OPTIMIZER_OPENAI_MODEL',
  'EVALUATOR_OPENAI_BASE_URL',
  'EVALUATOR_OPENAI_MODEL',
  'XAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'MISTRAL_API_KEY',
  'QWEN_API_KEY',
] as const

function resolveProjectDir() {
  let currentDir = process.cwd()

  while (true) {
    if (existsSync(path.join(currentDir, 'package.json'))) {
      return currentDir
    }

    const parentDir = path.dirname(currentDir)
    if (parentDir === currentDir) {
      return process.cwd()
    }

    currentDir = parentDir
  }
}

function applyAcceptanceEnvOverrides(projectDir: string) {
  if (process.env.NODE_ENV === 'test') {
    return
  }

  for (const fileName of ['.env', '.env.local']) {
    const envPath = path.join(projectDir, fileName)

    if (!existsSync(envPath)) {
      continue
    }

    const parsedEnv = parseEnv(readFileSync(envPath, 'utf8'))

    for (const key of ACCEPTANCE_ENV_OVERRIDE_KEYS) {
      const value = parsedEnv[key]
      if (typeof value === 'string' && value.trim()) {
        process.env[key] = value.trim()
      }
    }
  }
}

export function loadAcceptanceEnv() {
  const projectDir = resolveProjectDir()
  loadEnvConfig(projectDir)
  applyAcceptanceEnvOverrides(projectDir)
}

export const DEFAULT_ACCEPTANCE_SUITE: AcceptanceCase[] = [
  {
    id: 'copywriting-instagram',
    prompt:
      "Buatkan 3 variasi copywriting untuk iklan Instagram yang mempromosikan aplikasi fitness baru bernama 'FitNow'. Target audiens adalah pekerja kantoran yang sibuk.",
    taskType: 'MARKETING',
    tone: 'PERSUASIVE',
    format: 'STRUCTURED',
    lanes: ['INTERACTIVE', 'DEEP'],
    budgets: {
      INTERACTIVE: {
        maxFirstVisibleMs: 5000,
        maxTotalLatencyMs: 12000,
        minPromptChars: 250,
        maxPromptChars: 2200,
      },
      DEEP: {
        maxFirstVisibleMs: 20000,
        maxTotalLatencyMs: 45000,
        minPromptChars: 300,
      },
    },
  },
  {
    id: 'revenue-table-analysis',
    prompt:
      'Berikut adalah data penjualan fiktif bulan lalu: Sepatu A (150 unit, Rp200.000/unit), Sepatu B (85 unit, Rp350.000/unit), Sandal C (200 unit, Rp75.000/unit). Buatkan tabel rincian pendapatan per produk, lalu hitung total pendapatan, dan berikan rekomendasi singkat strategi penjualan untuk bulan depan berdasarkan data tersebut.',
    taskType: 'ANALYSIS',
    tone: 'PROFESSIONAL',
    format: 'STRUCTURED',
    lanes: ['INTERACTIVE', 'DEEP'],
    budgets: {
      INTERACTIVE: {
        maxFirstVisibleMs: 5000,
        maxTotalLatencyMs: 12000,
        minPromptChars: 250,
        maxPromptChars: 2400,
      },
      DEEP: {
        maxFirstVisibleMs: 20000,
        maxTotalLatencyMs: 45000,
        minPromptChars: 320,
      },
    },
  },
  {
    id: 'ops-brief',
    prompt:
      'Susun brief operasional singkat untuk onboarding staf admin klinik baru selama 7 hari, lengkap dengan prioritas tugas harian, output yang harus dikumpulkan, dan checkpoint supervisor.',
    taskType: 'BUSINESS',
    tone: 'PROFESSIONAL',
    format: 'STRUCTURED',
    lanes: ['INTERACTIVE', 'DEEP'],
    budgets: {
      INTERACTIVE: {
        maxFirstVisibleMs: 5000,
        maxTotalLatencyMs: 12000,
        minPromptChars: 240,
        maxPromptChars: 2300,
      },
      DEEP: {
        maxFirstVisibleMs: 20000,
        maxTotalLatencyMs: 45000,
        minPromptChars: 320,
      },
    },
  },
  {
    id: 'deep-strategy-brief',
    prompt:
      'Buat prompt untuk menyusun market-entry strategy 12 bulan bagi startup healthtech B2B yang ingin masuk ke 3 kota besar Indonesia, dengan trade-off distribusi, compliance, GTM, dan staffing.',
    taskType: 'BUSINESS',
    tone: 'PROFESSIONAL',
    format: 'STRUCTURED',
    lanes: ['DEEP'],
    budgets: {
      DEEP: {
        maxFirstVisibleMs: 35000,
        maxTotalLatencyMs: 45000,
        minPromptChars: 350,
      },
    },
  },
  {
    id: 'deep-architecture-review',
    prompt:
      'Susun super-prompt untuk mereview arsitektur event-driven multi-tenant system yang mengalami latency spike, dengan fokus observability, failure domain, concurrency, backpressure, dan rollback plan.',
    taskType: 'CODING',
    tone: 'TECHNICAL',
    format: 'STRUCTURED',
    lanes: ['DEEP'],
    budgets: {
      DEEP: {
        maxFirstVisibleMs: 35000,
        maxTotalLatencyMs: 45000,
        minPromptChars: 350,
      },
    },
  },
]

export function toAcceptanceSuite(benchmarks: DesktopBenchmarkCase[]): AcceptanceCase[] {
  return benchmarks.map((item) => ({
    id: item.id,
    prompt: item.prompt,
    taskType: item.taskType,
    tone: item.tone,
    format: item.format,
    lanes: item.lanes,
    budgets: item.budgets,
  }))
}

export function evaluateAcceptanceBudget(
  metrics: AcceptanceMetrics,
  budget: AcceptanceBudget
): AcceptanceEvaluation {
  const failures: string[] = []

  if (!metrics.hasVisibleOutput) {
    failures.push('visible-output')
  }

  if (
    typeof budget.maxFirstVisibleMs === 'number' &&
    (metrics.firstVisibleMs === null || metrics.firstVisibleMs > budget.maxFirstVisibleMs)
  ) {
    failures.push('first-visible')
  }

  if (
    typeof budget.maxTotalLatencyMs === 'number' &&
    metrics.totalLatencyMs > budget.maxTotalLatencyMs
  ) {
    failures.push('total-latency')
  }

  if (typeof budget.minPromptChars === 'number' && metrics.promptChars < budget.minPromptChars) {
    failures.push('prompt-too-short')
  }

  if (typeof budget.maxPromptChars === 'number' && metrics.promptChars > budget.maxPromptChars) {
    failures.push('prompt-too-long')
  }

  return {
    pass: failures.length === 0,
    failures,
  }
}

export function summarizeAcceptanceReport(report: AcceptanceReportItem[]) {
  const passed = report.filter((item) => item.pass).length
  const failed = report.length - passed
  const lines = [`Acceptance Report`, `Passed: ${passed}`, `Failed: ${failed}`]

  for (const item of report) {
    lines.push(
      [
        `${item.caseId} [${item.lane}]`,
        item.pass ? 'PASS' : `FAIL (${item.failures.join(', ')})`,
        `${item.provider}/${item.model}`,
        `firstVisible=${item.metrics.firstVisibleMs ?? 'none'}ms`,
        `total=${item.metrics.totalLatencyMs}ms`,
        `chars=${item.metrics.promptChars}`,
      ].join(' | ')
    )
  }

  return lines.join('\n')
}

function parseArgs(argv: string[]) {
  const args = new Map<string, string | true>()

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]

    if (!value.startsWith('--')) {
      continue
    }

    const nextValue = argv[index + 1]
    if (!nextValue || nextValue.startsWith('--')) {
      args.set(value, true)
      continue
    }

    args.set(value, nextValue)
    index += 1
  }

  return args
}

function resolveProvider(args: Map<string, string | true>): LLMProviderName {
  const fromArg = args.get('--provider')
  if (typeof fromArg === 'string') {
    return fromArg.toUpperCase() as LLMProviderName
  }

  if (process.env.OPENAI_API_KEY?.trim()) {
    return 'OPENAI'
  }

  if (process.env.XAI_API_KEY?.trim()) {
    return 'GROK'
  }

  return 'OPENAI'
}

function filterSuite(suite: AcceptanceCase[], args: Map<string, string | true>) {
  const caseFilter = args.get('--case')
  const laneFilter = args.get('--lane')

  return suite
    .filter((testCase) => (typeof caseFilter === 'string' ? testCase.id === caseFilter : true))
    .map((testCase) => ({
      ...testCase,
      lanes:
        typeof laneFilter === 'string'
          ? testCase.lanes.filter((lane) => lane === laneFilter.toUpperCase())
          : testCase.lanes,
    }))
    .filter((testCase) => testCase.lanes.length > 0)
}

export async function runAcceptanceSuite(
  suite: AcceptanceCase[],
  options: {
    provider: LLMProviderName
    apiKey?: string
  }
) {
  const report: AcceptanceReportItem[] = []

  for (const testCase of suite) {
    for (const lane of testCase.lanes) {
      const startedAt = Date.now()
      let firstVisibleMs: number | null = null
      let visibleChars = 0

      const response = await optimizePromptStreaming(
        {
          rawIdea: testCase.prompt,
          taskType: testCase.taskType,
          tone: testCase.tone,
          format: testCase.format,
          targetLlm: options.provider,
          provider: options.provider,
          apiKey: options.apiKey,
          optimizerLane: lane,
        },
        (delta) => {
          const visibleDelta = delta.trim()
          if (visibleDelta.length > 0) {
            visibleChars += visibleDelta.length
            if (firstVisibleMs === null) {
              firstVisibleMs = Date.now() - startedAt
            }
          }
        }
      )

      const metrics: AcceptanceMetrics = {
        firstVisibleMs,
        totalLatencyMs: response.metadata.latencyMs,
        promptChars: response.superPrompt.fullPrompt.trim().length,
        hasVisibleOutput: response.superPrompt.fullPrompt.trim().length > 0 || visibleChars > 0,
      }
      const evaluation = evaluateAcceptanceBudget(metrics, testCase.budgets[lane] ?? {})

      report.push({
        caseId: testCase.id,
        lane,
        provider: response.metadata.provider,
        model: response.metadata.model,
        metrics,
        ...evaluation,
      })
    }
  }

  return report
}

async function main() {
  loadAcceptanceEnv()
  const args = parseArgs(process.argv.slice(2))
  const suite = filterSuite(DEFAULT_ACCEPTANCE_SUITE, args)

  if (args.has('--dry-run')) {
    console.log(
      JSON.stringify(
        suite.map((testCase) => ({
          id: testCase.id,
          lanes: testCase.lanes,
          budgets: testCase.budgets,
        })),
        null,
        2
      )
    )
    return
  }

  const report = await runAcceptanceSuite(suite, {
    provider: resolveProvider(args),
    apiKey:
      typeof args.get('--api-key') === 'string' ? (args.get('--api-key') as string) : undefined,
  })

  if (args.has('--json')) {
    console.log(JSON.stringify(report, null, 2))
    return
  }

  console.log(summarizeAcceptanceReport(report))

  if (report.some((item) => !item.pass)) {
    process.exitCode = 1
  }
}

const entrypoint = basename(process.argv[1] ?? '')

if (entrypoint === 'optimizer-acceptance.ts' || entrypoint === 'optimizer-acceptance.js') {
  void main()
}
