import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const packageVersion = (
  JSON.parse(readFileSync(path.resolve(testDir, '../../package.json'), 'utf8')) as {
    version: string
  }
).version
// desktop:build substitutes the placeholder with the package.json version; mirror that here.
const rendererHtml = readFileSync(
  path.resolve(testDir, '../../desktop/renderer/index.html'),
  'utf8'
).replace('__SENTRA_VERSION__', packageVersion)

function type(command: string) {
  const field = document.getElementById('cmdInput') as HTMLInputElement
  field.value = command
  field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
}

function transcriptLines() {
  return Array.from(document.querySelectorAll<HTMLElement>('#display .line'))
}

function findLine(fragment: string) {
  return transcriptLines().find((line) => line.textContent?.includes(fragment))
}

describe('console transcript command language', () => {
  let invoke: ReturnType<typeof vi.fn>
  let close: ReturnType<typeof vi.fn>
  let writeText: ReturnType<typeof vi.fn>
  let onStream: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.resetModules()
    document.open()
    document.write(rendererHtml)
    document.close()

    invoke = vi.fn().mockResolvedValue({})
    close = vi.fn()
    writeText = vi.fn().mockResolvedValue(undefined)
    onStream = vi.fn()
    vi.stubGlobal('sentraDesktop', {
      getShellState: vi.fn().mockResolvedValue({
        providerReadiness: {
          status: 'ready',
          availableProviders: ['OPENAI'],
          activeProvider: 'OPENAI',
        },
        preferredProvider: 'OPENAI',
      }),
      invoke,
      auth: { getSession: vi.fn().mockResolvedValue(null) },
      workspace: {
        listDrafts: vi.fn().mockResolvedValue([]),
        saveDraft: vi.fn().mockResolvedValue({}),
        listRecentRuns: vi.fn().mockResolvedValue([]),
        listBenchmarks: vi.fn().mockResolvedValue([]),
      },
      onStream,
      offStream: vi.fn(),
      close,
      minimize: vi.fn(),
      getWindowPos: vi.fn().mockResolvedValue([0, 0]),
      setWindowPos: vi.fn(),
    })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    await import('../../desktop/renderer/renderer')
    // The prompt is disabled until provider readiness resolves.
    await vi.waitFor(() =>
      expect((document.getElementById('cmdInput') as HTMLInputElement).disabled).toBe(false)
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    document.body.replaceChildren()
  })

  async function expectDesktopCommand(command: string, payload?: unknown) {
    await vi.waitFor(() =>
      expect(invoke).toHaveBeenCalledWith(
        'desktop:command',
        payload === undefined
          ? expect.objectContaining({ command })
          : expect.objectContaining({ command, payload })
      )
    )
  }

  it('routes the former transform tab to the transform handler', async () => {
    type('transform "x"')

    await expectDesktopCommand(
      'transform:run',
      expect.objectContaining({ prompt: 'x', effort: 'high', maxTokens: 1800 })
    )
  })

  it('routes super to an optimize run that asks for a Super Prompt', async () => {
    type('super "x"')

    await expectDesktopCommand(
      'optimize:run',
      expect.objectContaining({ rawIdea: 'x', outputKind: 'SUPER_PROMPT' })
    )
  })

  it('routes brief to an optimize run that asks for a Coding Brief', async () => {
    type('brief "x"')

    await expectDesktopCommand(
      'optimize:run',
      expect.objectContaining({ rawIdea: 'x', outputKind: 'CODING_BRIEF' })
    )
  })

  it('treats an unknown bare word as a Coding Brief idea', async () => {
    type('halo')

    await expectDesktopCommand(
      'optimize:run',
      expect.objectContaining({ rawIdea: 'halo', outputKind: 'CODING_BRIEF' })
    )
  })

  it('carries the selected lane into the next optimize payload', async () => {
    type('lane deep')
    type('super x')

    await expectDesktopCommand('optimize:run', expect.objectContaining({ optimizerLane: 'DEEP' }))
  })

  it('carries the selected profile and effort into the next transform payload', async () => {
    type('profile codex')
    type('effort low')
    type('transform x')

    await expectDesktopCommand(
      'transform:run',
      expect.objectContaining({ profile: 'codex', effort: 'low', maxTokens: 700 })
    )
  })

  it('prints the slash command catalog from help', async () => {
    type('help')

    await vi.waitFor(() => expect(findLine('/evaluate')).toBeTruthy())
  })

  it('lists recent runs and benchmarks from log', async () => {
    type('log')

    await expectDesktopCommand('recent:list')
    await expectDesktopCommand('benchmark:list')
  })

  it('saves a provider key and lists providers from key', async () => {
    type('key OPENAI sk-test')

    await expectDesktopCommand('provider:save', { provider: 'OPENAI', apiKey: 'sk-test' })

    await vi.waitFor(() =>
      expect((document.getElementById('cmdInput') as HTMLInputElement).disabled).toBe(false)
    )
    type('key')

    await expectDesktopCommand('provider:list')
  })

  it('reads process telemetry from stat', async () => {
    type('stat')

    await vi.waitFor(() => expect(invoke).toHaveBeenCalledWith('system:stats'))
  })

  it('clears the transcript but keeps the prompt line', async () => {
    type('transform x')
    await expectDesktopCommand('transform:run')
    await vi.waitFor(() => expect(findLine('Finished in')).toBeTruthy())

    type('clear')

    await vi.waitFor(() => expect(findLine('Finished in')).toBeUndefined())
    expect(document.querySelectorAll('#display .line.type-user')).toHaveLength(0)
    const transcript = document.getElementById('display') as HTMLElement
    expect(transcript.lastElementChild?.id).toBe('promptLine')
  })

  it('closes the desktop window from quit', () => {
    type('quit')

    expect(close).toHaveBeenCalledOnce()
  })

  it('marks pending, resolved and failed runs with status prefixes', async () => {
    let resolveTransform: ((value: unknown) => void) | undefined
    invoke.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveTransform = resolve
        })
    )

    type('transform x')

    await vi.waitFor(() =>
      expect(document.querySelector('#display .line.status-warn')).toBeTruthy()
    )

    resolveTransform?.({ transformedPrompt: 'x' })

    await vi.waitFor(() => expect(document.querySelector('#display .line.status-ok')).toBeTruthy())

    invoke.mockRejectedValueOnce(new Error('bridge down'))
    await vi.waitFor(() =>
      expect((document.getElementById('cmdInput') as HTMLInputElement).disabled).toBe(false)
    )
    type('transform y')

    await vi.waitFor(() =>
      expect(document.querySelector('#display .line.status-error')).toBeTruthy()
    )
  })

  it('prints a thin brief (V11) as a warn line with the two missing answers, never as ok', async () => {
    type('brief x')

    await expectDesktopCommand('optimize:run')

    const handleDone = onStream.mock.calls.find(([channel]) => channel === 'optimize:done')?.[1] as
      | ((payload: unknown) => void)
      | undefined
    const sentRequestId = (
      invoke.mock.calls.find(
        ([channel, payload]) =>
          channel === 'desktop:command' &&
          (payload as { command?: string }).command === 'optimize:run'
      )?.[1] as { payload: { requestId: string } }
    ).payload.requestId

    handleDone?.({
      requestId: sentRequestId,
      response: {
        superPrompt: { fullPrompt: '## GOAL\nMake the application faster.' },
        metadata: {
          outputKind: 'CODING_BRIEF',
          quality: { complete: false, degraded: false, thin: true, attempts: 1 },
        },
      },
    })

    const qualityLine = document.querySelector<HTMLElement>('#display .line.quality-line')
    expect(qualityLine?.textContent).toBe('thin brief — add where to work and how to check it')
    expect(qualityLine?.classList.contains('status-warn')).toBe(true)
    expect(qualityLine?.classList.contains('quality-ok')).toBe(false)
    expect(qualityLine?.classList.contains('quality-degraded')).toBe(false)
  })

  it('closes a streamed optimize run with the result and its action line', async () => {
    type('brief x')

    await expectDesktopCommand('optimize:run')

    const handleDone = onStream.mock.calls.find(([channel]) => channel === 'optimize:done')?.[1] as
      | ((payload: unknown) => void)
      | undefined
    expect(handleDone).toBeTypeOf('function')

    const sentRequestId = (
      invoke.mock.calls.find(
        ([channel, payload]) =>
          channel === 'desktop:command' &&
          (payload as { command?: string }).command === 'optimize:run'
      )?.[1] as { payload: { requestId: string } }
    ).payload.requestId

    handleDone?.({
      requestId: sentRequestId,
      response: { superPrompt: { fullPrompt: '## ROLE\nx' }, metadata: {} },
    })

    const streamLine = document.querySelector<HTMLElement>(
      `#display .line[data-request-id="${sentRequestId}"]`
    )
    expect(streamLine?.textContent).toContain('## ROLE')
    // Result block order: body, one blank line, trailing meta line, then the action line.
    const blank = streamLine?.nextElementSibling
    expect(blank?.classList.contains('blank-line')).toBe(true)
    expect(blank?.nextElementSibling?.classList.contains('meta-line')).toBe(true)
    expect(blank?.nextElementSibling?.nextElementSibling?.classList.contains('tx-actions')).toBe(
      true
    )
    expect(document.querySelector('#display .line[data-request-status-id]')).toBeNull()
  })

  it('colours headings, paths and backticked commands in a result body without changing its text', async () => {
    const body = [
      '## GOAL',
      'Fix the parser in lib/optimizer/engine.ts and desktop/preload.ts.',
      '',
      '## CONTEXT',
      '`lib/optimizer/engine.ts`',
      'lib/transform/**',
      'See https://example.com/docs/guide.md and README.md.',
      '',
      '## DONE WHEN',
      '`pnpm run test` passes.',
    ].join('\n')
    invoke.mockResolvedValue({ transformedPrompt: body })

    type('transform x')
    const line = await vi.waitFor(() => {
      const found = document.querySelector<HTMLElement>('#display .line.type-agent')
      expect(found).toBeTruthy()
      return found as HTMLElement
    })

    // Text is unchanged (copy and the store see the plain body).
    expect(line.textContent).toBe(`# Transformed Prompt\n\n${body}`)
    const runs = (tone: string) =>
      Array.from(line.querySelectorAll(`.seg-${tone}`)).map((span) => span.textContent)
    expect(runs('heading')).toEqual(['# Transformed Prompt', '## GOAL', '## CONTEXT', '## DONE WHEN'])
    expect(runs('dir')).toEqual(['lib/optimizer/', 'desktop/', 'lib/optimizer/', 'lib/transform/'])
    expect(runs('file')).toEqual(['engine.ts', 'preload.ts', 'engine.ts', '**', 'README.md'])
    // A backticked path keeps the path colours; a backticked command is green; URLs stay plain.
    expect(runs('cmd')).toEqual(['`pnpm run test`'])
    expect(line.textContent).toContain('https://example.com/docs/guide.md')
    expect(runs('dir')).not.toContain('example.com/docs/')
  })

  it('separates blocks with exactly one blank line, never two, never zero', async () => {
    invoke.mockResolvedValue({ transformedPrompt: 'x' })

    type('lane deep')
    await vi.waitFor(() => expect(findLine('lane=deep')).toBeTruthy())
    type('transform x')
    await vi.waitFor(() => expect(findLine('Finished in')).toBeTruthy())
    type('clear')
    await vi.waitFor(() => expect(findLine('Finished in')).toBeUndefined())
    type('mode')
    await vi.waitFor(() => expect(findLine('mode=transform')).toBeTruthy())

    const isBlank = (line: HTMLElement) =>
      line.classList.contains('blank-line') || line.classList.contains('banner-blank')
    const lines = transcriptLines()
    // Never two: no blank line directly follows another.
    for (let index = 1; index < lines.length; index += 1) {
      expect(isBlank(lines[index]) && isBlank(lines[index - 1])).toBe(false)
    }
    // Never zero: every echoed command is preceded by a blank line, and the last block
    // (the mode line) is closed by one before the prompt.
    for (const echo of lines.filter((line) => line.classList.contains('type-user'))) {
      expect(isBlank(echo.previousElementSibling as HTMLElement)).toBe(true)
    }
    const promptLine = document.getElementById('promptLine') as HTMLElement
    expect(isBlank(promptLine.previousElementSibling as HTMLElement)).toBe(true)
  })

  it('lays label/value pairs out in fixed columns, the second pair at column 40', async () => {
    // Content starts at screen column 2 (two-space margin), so column 40 is text index 38.
    type('mode')
    const modeLine = await vi.waitFor(() => {
      const line = findLine('mode=optimize')
      expect(line).toBeTruthy()
      return line as HTMLElement
    })
    // Two pairs per row: the window is 84 columns, so a third column would not fit.
    const [firstRow, secondRow, thirdRow] = (modeLine.textContent ?? '').split('\n')
    expect(firstRow.indexOf('lane=')).toBe(38)
    expect(secondRow.indexOf('profile=')).toBe(0)
    expect(secondRow.indexOf('effort=')).toBe(38)
    expect(thirdRow.indexOf('output=')).toBe(0)

    type('help')
    const helpLine = await vi.waitFor(() => {
      const line = findLine('Build a Coding Brief from a raw idea')
      expect(line).toBeTruthy()
      return line as HTMLElement
    })
    expect((helpLine.textContent ?? '').indexOf('Build a Coding Brief')).toBe(38)
  })

  it('renders result actions as accessible plain-text buttons', async () => {
    invoke.mockResolvedValue({ transformedPrompt: 'x' })

    type('transform x')

    const copyButton = await vi.waitFor(() => {
      const button = Array.from(
        document.querySelectorAll<HTMLButtonElement>('#display .tx-action')
      ).find((element) => element.textContent === '[c] copy')
      expect(button).toBeTruthy()
      return button as HTMLButtonElement
    })

    expect(copyButton.tagName).toBe('BUTTON')
    expect(copyButton.tabIndex).toBe(0)
    expect(copyButton.getAttribute('aria-label')).toBeTruthy()

    copyButton.click()

    expect(writeText).toHaveBeenCalledWith('x')
  })

  it('prints the boot banner without status prefixes', () => {
    const banner = transcriptLines().slice(0, 4)

    expect(banner.map((line) => line.className)).toEqual([
      'line banner-title',
      'line banner-subtitle',
      'line banner-rule',
      'line banner-blank',
    ])
    expect(banner.map((line) => line.textContent)).toEqual([
      `Sentra Prompt Console  ${packageVersion}`,
      'Sentra Artificial Intelligence \u00b7 prompt engineering workspace',
      '\u2500'.repeat(72),
      '\u00a0',
    ])
    // The version is a dim run after the bright title, as in the startup reference.
    expect(banner[0].querySelector('.seg-dim')?.textContent).toBe(packageVersion)
    for (const line of banner) {
      expect(line.className).not.toMatch(/status-/)
    }
  })

  it('prints the startup block from real state: session, instruction, examples, hints, ok lines', () => {
    const classes = transcriptLines().map((line) => line.className)
    // reference-console-startup.html, top to bottom (banner-blank rows separate blocks).
    expect(classes.slice(4)).toEqual([
      'line banner-session',
      'line banner-session',
      'line banner-session',
      'line blank-line',
      'line banner-hint',
      'line blank-line',
      'line banner-example',
      'line banner-example',
      'line blank-line',
      'line banner-command',
      'line banner-command',
      'line blank-line',
      'line type-sys status-ok',
      'line type-sys status-ok',
      'line blank-line',
    ])

    const session = transcriptLines()
      .filter((line) => line.classList.contains('banner-session'))
      .map((line) => line.textContent ?? '')
    // Left column: provider only (the mocked state has no model); right column: lane,
    // profile, effort. No agent row: the shell has no such setting, so nothing is printed.
    expect(session[0].startsWith('provider   openai')).toBe(true)
    expect(session[0].indexOf('lane      interactive')).toBe(38)
    expect(session[1].indexOf('profile   default')).toBe(38)
    expect(session[2].indexOf('effort    high')).toBe(38)
    expect(session.join('\n')).not.toMatch(/agent|model|—|unknown|n\/a/)
    for (const line of transcriptLines().filter((line) => line.classList.contains('banner-session'))) {
      expect(Array.from(line.querySelectorAll('.seg-label')).length).toBeGreaterThan(0)
    }

    expect(findLine('Type an idea and press Enter. It becomes a Coding Brief.')).toBeTruthy()
    const examples = transcriptLines().filter((line) => line.classList.contains('banner-example'))
    expect(examples[0].querySelector('.seg-cmd')?.textContent).toBe('brief')
    expect(examples[1].querySelector('.seg-cmd')?.textContent).toBe('super')

    const hints = transcriptLines()
      .filter((line) => line.classList.contains('banner-command'))
      .map((line) => line.textContent ?? '')
    expect(hints[0].startsWith('log')).toBe(true)
    expect(hints[0].indexOf('key')).toBe(29)
    expect(hints[1].startsWith('help')).toBe(true)
    expect(hints[1].indexOf('stat')).toBe(29)

    const okLines = transcriptLines().filter((line) => line.classList.contains('status-ok'))
    expect(okLines.map((line) => line.textContent)).toEqual(['0 briefs today', 'ready'])
  })

  it('reprints the startup block from current state after clear', async () => {
    type('lane deep')
    await vi.waitFor(() => expect(findLine('lane=deep')).toBeTruthy())
    type('clear')
    await vi.waitFor(() => expect(findLine('lane=deep')).toBeUndefined())

    const session = transcriptLines()
      .filter((line) => line.classList.contains('banner-session'))
      .map((line) => line.textContent ?? '')
    expect(session[0].indexOf('lane      deep')).toBe(38)
    expect(findLine('ready')).toBeTruthy()
  })

  it('prints the banner before the first status line, unprefixed and in English', async () => {
    const indonesian = /\b(siap|ketik|tidak|tambahkan|jalankan|salin)\b/i

    // The first status line the shell can print: a [DONE] echo of a setting command.
    type('lane deep')
    await vi.waitFor(() => expect(findLine('lane=deep')).toBeTruthy())

    const lines = transcriptLines()
    const firstStatusIndex = lines.findIndex((line) => /\bstatus-/.test(line.className))
    const bannerIndices = lines
      .map((line, index) => (/\bbanner-/.test(line.className) ? index : -1))
      .filter((index) => index >= 0)

    // Banner rows are contiguous from the top and all sit before the first status line.
    expect(bannerIndices[0]).toBe(0)
    expect(bannerIndices.length).toBeGreaterThanOrEqual(4)
    expect(bannerIndices.every((index) => index < firstStatusIndex)).toBe(true)
    expect(firstStatusIndex).toBeGreaterThan(4)
    for (const index of bannerIndices) {
      expect(lines[index].className).not.toMatch(/\bstatus-/)
      expect(lines[index].textContent ?? '').not.toMatch(indonesian)
    }
  })

  it('never prints Indonesian text on a system line', async () => {
    const indonesian = /\b(siap|ketik|tidak|tambahkan|lalu|jalankan|ulang|susun|salin)\b/i
    const idle = () =>
      vi.waitFor(() =>
        expect((document.getElementById('cmdInput') as HTMLInputElement).disabled).toBe(false)
      )

    invoke.mockImplementation(async (_channel: string, payload?: unknown) => {
      const command = (payload as { command?: string } | undefined)?.command
      if (command === 'transform:run') return { transformedPrompt: 'x' }
      if (command === 'recent:list') return { runs: [] }
      if (command === 'benchmark:list') return { benchmarks: [] }
      if (command === 'provider:list') return { providers: [] }
      throw new Error('bridge down')
    })

    for (const command of [
      'help',
      'mode',
      'lane nowhere',
      'lane deep',
      'profile nowhere',
      'profile codex',
      'effort nowhere',
      'effort low',
      'copy',
      'brief',
      'stat',
      'log',
      'key',
      'transform x',
      'copy',
    ]) {
      type(command)
      await idle()
    }
    await vi.waitFor(() => expect(findLine('Finished in')).toBeTruthy())

    const systemText = Array.from(
      document.querySelectorAll<HTMLElement>(
        '#display .line.type-sys, #display .line.meta-line, #display .line[class*="banner-"], #display .tx-action'
      )
    ).flatMap((element) => [element.textContent ?? '', element.getAttribute('aria-label') ?? ''])

    expect(systemText.length).toBeGreaterThan(20)
    for (const text of systemText) {
      expect(text).not.toMatch(indonesian)
    }
    expect(document.querySelector('#display .line.status-error')).toBeTruthy()
  })
})

describe('console startup block state variants', () => {
  async function boot(options: {
    shellState: Record<string, unknown>
    recentRuns?: unknown[] | Error
  }) {
    vi.resetModules()
    document.open()
    document.write(rendererHtml)
    document.close()

    vi.stubGlobal('sentraDesktop', {
      getShellState: vi.fn().mockResolvedValue(options.shellState),
      invoke: vi.fn().mockResolvedValue({}),
      auth: { getSession: vi.fn().mockResolvedValue(null) },
      workspace: {
        listDrafts: vi.fn().mockResolvedValue([]),
        saveDraft: vi.fn().mockResolvedValue({}),
        listRecentRuns:
          options.recentRuns instanceof Error
            ? vi.fn().mockRejectedValue(options.recentRuns)
            : vi.fn().mockResolvedValue(options.recentRuns ?? []),
        listBenchmarks: vi.fn().mockResolvedValue([]),
      },
      onStream: vi.fn(),
      offStream: vi.fn(),
      close: vi.fn(),
      minimize: vi.fn(),
      getWindowPos: vi.fn().mockResolvedValue([0, 0]),
      setWindowPos: vi.fn(),
    })

    await import('../../desktop/renderer/renderer')
    await vi.waitFor(() =>
      expect(document.querySelector('#display .line.banner-command')).toBeTruthy()
    )
  }

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    document.body.replaceChildren()
  })

  const sessionRows = () =>
    transcriptLines()
      .filter((line) => line.classList.contains('banner-session'))
      .map((line) => line.textContent ?? '')

  it('prints the model row when the shell resolved a model', async () => {
    await boot({
      shellState: {
        providerReadiness: { status: 'ready', availableProviders: ['OPENAI'], activeProvider: 'OPENAI' },
        preferredProvider: 'OPENAI',
        preferredModel: 'openai/gpt-5.6-luna',
      },
    })

    const rows = sessionRows()
    expect(rows[0].startsWith('provider   openai')).toBe(true)
    expect(rows[1].startsWith('model      openai/gpt-5.6-luna')).toBe(true)
    expect(rows[1].indexOf('profile   default')).toBe(38)
  })

  it('omits provider and model rows and warns when no provider is loaded', async () => {
    await boot({
      shellState: {
        providerReadiness: { status: 'missing', availableProviders: [], activeProvider: null },
        preferredModel: 'grok-3-fast',
      },
    })

    const rows = sessionRows()
    expect(rows).toHaveLength(3)
    expect(rows.join('\n')).not.toMatch(/provider|model|agent/)
    expect(rows[0].indexOf('lane      interactive')).toBe(38)
    expect(document.querySelector('#display .line.status-warn')?.textContent).toContain(
      'Provider missing'
    )
    expect(findLine('ready')).toBeUndefined()
  })

  it('counts today\u2019s briefs by outcome from stored runs only', async () => {
    const today = new Date().toISOString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const run = (overrides: Record<string, unknown>) => ({
      id: Math.random().toString(16).slice(2),
      sourceMode: 'optimize',
      rawInput: 'x',
      outputText: '## GOAL\nx',
      createdAt: today,
      outputKind: 'CODING_BRIEF',
      quality: { complete: true, degraded: false },
      ...overrides,
    })
    await boot({
      shellState: {
        providerReadiness: { status: 'ready', availableProviders: ['OPENAI'], activeProvider: 'OPENAI' },
        preferredProvider: 'OPENAI',
      },
      recentRuns: [
        run({}),
        run({ quality: { complete: false, degraded: true } }),
        // A thin brief (V11) is valid but never complete: it needs a check.
        run({ quality: { complete: false, degraded: false, thin: true } }),
        run({ createdAt: yesterday }),
        run({ outputKind: 'SUPER_PROMPT' }),
        run({ quality: undefined }),
        run({ sourceMode: 'transform' }),
      ],
    })

    expect(findLine('3 briefs today \u00b7 1 complete \u00b7 2 needs check')).toBeTruthy()
  })

  it('omits the counts row when the workspace store cannot be read', async () => {
    await boot({
      shellState: {
        providerReadiness: { status: 'ready', availableProviders: ['OPENAI'], activeProvider: 'OPENAI' },
        preferredProvider: 'OPENAI',
      },
      recentRuns: new Error('store locked'),
    })

    expect(findLine('ready')).toBeTruthy()
    expect(findLine('briefs today')).toBeUndefined()
  })
})
