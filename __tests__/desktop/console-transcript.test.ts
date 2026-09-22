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
    // Result block order: body, trailing meta line, then the action line.
    expect(streamLine?.nextElementSibling?.classList.contains('meta-line')).toBe(true)
    expect(
      streamLine?.nextElementSibling?.nextElementSibling?.classList.contains('tx-actions')
    ).toBe(true)
    expect(document.querySelector('#display .line[data-request-status-id]')).toBeNull()
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
    const banner = transcriptLines().slice(0, 5)

    expect(banner.map((line) => line.className)).toEqual([
      'line banner-title',
      'line banner-subtitle',
      'line banner-rule',
      'line banner-hint',
      'line banner-blank',
    ])
    expect(banner.map((line) => line.textContent)).toEqual([
      `Sentra Prompt Console ${packageVersion}`,
      'Sentra Artificial Intelligence \u00b7 prompt engineering workspace',
      '\u2500'.repeat(59),
      "Type your idea to build a Coding Brief, or 'help' for the command list.",
      '\u00a0',
    ])
    for (const line of banner) {
      expect(line.className).not.toMatch(/status-/)
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
