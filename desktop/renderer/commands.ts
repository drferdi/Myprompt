import type { DesktopCommandId, DesktopPrimaryModeId } from './modes'

import type { OptimizeLane, TaskType } from '@/types'

interface DesktopOptimizerSuggestion {
  taskType: TaskType
  optimizerLane: OptimizeLane
  templateSlug?: string
  reasons: string[]
}

export type ParsedConsoleInput =
  | { kind: 'prompt'; value: string }
  | { kind: 'command'; command: DesktopCommandId; args: string[] }

interface DesktopInvocation {
  channel: string
  payload?: unknown
}

type DesktopOptimizeProvider = 'CLAUDE' | 'OPENAI' | 'MISTRAL' | 'QWEN' | 'GROK'

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

function joinArgs(parts: string[]) {
  const value = parts.join(' ').trim()
  return value ? [value] : []
}

function requireNonEmptyArg(command: string, value: string | undefined, message: string) {
  const normalized = value?.trim()

  if (!normalized) {
    throw new Error(`${command} ${message}`)
  }

  return normalized
}

export function inferOptimizeTaskType(value: string): TaskType {
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

function inferTemplateSlug(value: string, taskType: TaskType) {
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

export function suggestOptimizerConfig(rawIdea: string): DesktopOptimizerSuggestion {
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

function buildVisiblePromptText(superPrompt: Record<string, unknown>) {
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

  return sections.join('\n\n').trim() || '[No visible prompt content returned by provider.]'
}

export function parseConsoleInput(input: string): ParsedConsoleInput {
  const value = input.trim()

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

  if (rawCommand === 'library' && subcommand === 'search') {
    return {
      kind: 'command',
      command: 'library.search',
      args: joinArgs(rest.slice(1)),
    }
  }

  if (rawCommand === 'library' && subcommand === 'save') {
    return { kind: 'command', command: 'library.save', args: [] }
  }

  if (rawCommand === 'library' && (subcommand === 'open' || subcommand === 'get')) {
    return {
      kind: 'command',
      command: 'library.get',
      args: rest.slice(1),
    }
  }

  if (rawCommand === 'library') {
    return { kind: 'command', command: 'library.list', args: [] }
  }

  if ((rawCommand === 'drafts' || rawCommand === 'draft') && subcommand === 'save') {
    return { kind: 'command', command: 'draft.save', args: [] }
  }

  if (
    (rawCommand === 'drafts' || rawCommand === 'draft') &&
    (subcommand === 'open' || subcommand === 'get')
  ) {
    return {
      kind: 'command',
      command: 'draft.get',
      args: rest.slice(1),
    }
  }

  if (rawCommand === 'drafts' || rawCommand === 'draft') {
    return { kind: 'command', command: 'draft.list', args: [] }
  }

  if (rawCommand === 'recent') {
    return { kind: 'command', command: 'recent.list', args: [] }
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

export function buildPromptInvocation(
  mode: DesktopPrimaryModeId,
  value: string,
  provider: DesktopOptimizeProvider = 'GROK',
  requestId?: string,
  optimizerLane: OptimizeLane = 'INTERACTIVE'
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

  return {
    channel: 'desktop:command',
    payload: {
      command: 'optimize:run',
      payload: {
        rawIdea: value,
        taskType: suggestOptimizerConfig(value).taskType,
        tone: 'PROFESSIONAL',
        format: 'STRUCTURED',
        targetLlm: provider,
        provider,
        optimizerLane,
        requestId,
      },
    },
  }
}

export function buildCommandInvocation(
  parsed: Extract<ParsedConsoleInput, { kind: 'command' }>,
  provider: DesktopOptimizeProvider = 'GROK'
): DesktopInvocation {
  if (parsed.command === 'help.show') {
    return {
      channel: 'desktop:command',
      payload: {
        command: 'help:show',
        payload: {},
      },
    }
  }

  if (parsed.command === 'evaluate') {
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
    throw new Error('library.save requires current-run context before it can build a valid payload')
  }

  if (parsed.command === 'library.get') {
    return {
      channel: 'desktop:command',
      payload: {
        command: 'library:get',
        payload: {
          id: parsed.args[0] ?? '',
        },
      },
    }
  }

  if (parsed.command === 'draft.list') {
    return {
      channel: 'desktop:command',
      payload: {
        command: 'draft:list',
        payload: {},
      },
    }
  }

  if (parsed.command === 'draft.save') {
    return {
      channel: 'desktop:command',
      payload: {
        command: 'draft:save',
        payload: {},
      },
    }
  }

  if (parsed.command === 'draft.get') {
    return {
      channel: 'desktop:command',
      payload: {
        command: 'draft:get',
        payload: {
          id: parsed.args[0] ?? '',
        },
      },
    }
  }

  if (parsed.command === 'recent.list') {
    return {
      channel: 'desktop:command',
      payload: {
        command: 'recent:list',
        payload: {},
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
    return {
      channel: 'desktop:command',
      payload: {
        command: 'benchmark:save',
        payload: {},
      },
    }
  }

  if (parsed.command === 'benchmark.run') {
    const id = requireNonEmptyArg('benchmark.run', parsed.args[0], 'requires a benchmark id')

    return {
      channel: 'desktop:command',
      payload: {
        command: 'benchmark:run',
        payload: {
          id,
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

export function formatDesktopResult(result: unknown): string {
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
    const lines = ['# Optimized Prompt', '', buildVisiblePromptText(superPrompt)]
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
