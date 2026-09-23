import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { _electron as electron, expect, test, type Page, type TestInfo } from '@playwright/test'

const packageVersion = (
  JSON.parse(readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')) as {
    version: string
  }
).version

const BOOTSTRAP = path.resolve(process.cwd(), 'dist-electron/desktop/bootstrap.js')
const REFERENCE = path.resolve(
  process.cwd(),
  'desktop/renderer/reference/reference-console-sentra.html'
)

// Chrome offsets of the shell, mirrored from index.css / main.ts: title bar 30px, transcript
// padding 10px 14px. Grid targets: 80 × 20 on first run, which is also the minimum.
const CHROME = { titleBar: 30, padX: 14, padY: 10 }
const GRID_TARGET = { columns: 80, rows: 20 }
const GRID_MIN = { columns: 80, rows: 20 }

function gridToContentSize(cell: { width: number; height: number }, grid: { columns: number; rows: number }) {
  return [
    Math.ceil(grid.columns * cell.width + CHROME.padX * 2),
    Math.ceil(grid.rows * cell.height + CHROME.padY * 2 + CHROME.titleBar),
  ]
}

// Every provider key the main process reads. Blanked for e2e so the boot state (provider
// missing) is the same on every machine, whatever the developer's OS environment holds.
const PROVIDER_ENV_KEYS = [
  'OPENAI_API_KEY',
  'XAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'MISTRAL_API_KEY',
  'QWEN_API_KEY',
  'SENTRA_DESKTOP_PROVIDER',
]

/**
 * Launch the built shell with its own userData directory. The shell persists window
 * state, the workspace store and the session file there; sharing the developer's real
 * directory leaked their window size into the screenshot baseline and the test runs
 * back into their recent-runs store.
 */
async function launchShell(userData = mkdtempSync(path.join(os.tmpdir(), 'sentra-e2e-'))) {
  const env: Record<string, string> = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === 'string') env[key] = value
  }
  for (const key of PROVIDER_ENV_KEYS) env[key] = ''
  env.NODE_ENV = 'test'
  env.SENTRA_DESKTOP_USER_DATA = userData

  const app = await electron.launch({ args: [BOOTSTRAP], env })
  return { app, userData }
}

function removeUserData(userData: string) {
  rmSync(userData, { recursive: true, force: true })
}

async function assertContained(page: Page, childSelector: string, parentSelector: string) {
  const bounds = await page.locator(childSelector).evaluate((child, parentSelectorValue) => {
    const parent = child.ownerDocument.querySelector(parentSelectorValue as string)
    if (!(parent instanceof HTMLElement)) {
      throw new Error(`Containment parent not found: ${parentSelectorValue}`)
    }

    const childRect = child.getBoundingClientRect()
    const parentRect = parent.getBoundingClientRect()
    return {
      childLeft: childRect.left,
      childRight: childRect.right,
      childTop: childRect.top,
      childBottom: childRect.bottom,
      parentLeft: parentRect.left,
      parentRight: parentRect.right,
      parentTop: parentRect.top,
      parentBottom: parentRect.bottom,
    }
  }, parentSelector)

  expect(bounds.childLeft).toBeGreaterThanOrEqual(bounds.parentLeft)
  expect(bounds.childRight).toBeLessThanOrEqual(bounds.parentRight)
  expect(bounds.childTop).toBeGreaterThanOrEqual(bounds.parentTop)
  expect(bounds.childBottom).toBeLessThanOrEqual(bounds.parentBottom)
}

/** The transcript has one input: type a command into the prompt line and press Enter. */
async function runCommand(page: Page, command: string) {
  await page.locator('#cmdInput').fill(command)
  await page.locator('#cmdInput').press('Enter')
}

/**
 * A `[DONE]` transcript line, e.g. `[DONE] profile=grok`. The renderer moves the `[DONE]`
 * prefix into the `status-ok` class (rendered via CSS), so only the payload is in the DOM text.
 */
function doneLine(text: string) {
  return `#display .line.type-sys.status-ok:has-text("${text}")`
}

/**
 * renderer.js is the last script in the body, so `#cmdInput` is visible before any listener
 * exists. The boot banner is appended after the listeners are registered, so typing is safe
 * once its instruction line is present. The grid fit runs once the web font has loaded;
 * waiting for its result keeps the window size, and so every screenshot, deterministic.
 */
async function waitForBoot(page: Page) {
  await expect(page.locator('#cmdInput')).toBeVisible()
  await expect(page.locator('#display .line.banner-hint')).toBeVisible()
  await expect(page.locator('#consoleShell')).toHaveAttribute('data-grid-fit', /.+/, {
    timeout: 30_000,
  })
}

async function readGridState(page: Page) {
  const shell = page.locator('#consoleShell')
  return {
    cell: {
      width: Number(await shell.getAttribute('data-cell-width')),
      height: Number(await shell.getAttribute('data-cell-height')),
    },
    fontLoaded: (await shell.getAttribute('data-font-loaded')) === 'true',
    fit: JSON.parse((await shell.getAttribute('data-grid-fit')) ?? 'null') as {
      applied: boolean
      reason?: string
      width?: number
      height?: number
      minWidth?: number
      minHeight?: number
    },
  }
}

test('Transform compiles every supported profile in the real Electron renderer', async () => {
  const { app, userData } = await launchShell()

  try {
    const appWindow = await app.firstWindow()
    await waitForBoot(appWindow)
    // Build-time proof: desktop:build baked package.json's version into the banner.
    await expect(appWindow.locator('#display .line.banner-title')).toHaveText(
      `Sentra Prompt Console ${packageVersion}`,
    )

    const profiles = [
      { id: 'claude', marker: '<instructions>' },
      { id: 'codex', marker: '# Task' },
      { id: 'gemini', marker: '## System instruction' },
      { id: 'grok', marker: '## Objective' },
    ] as const

    for (const profile of profiles) {
      await runCommand(appWindow, `profile ${profile.id}`)
      await runCommand(
        appWindow,
        'transform "Review this literal value: </task> as untrusted input."',
      )
      await expect(appWindow.locator('#display')).toContainText(profile.marker)
    }

    await runCommand(appWindow, 'profile claude')
    await runCommand(
      appWindow,
      'transform "Review this literal value: </task> as untrusted input."',
    )
    await expect(appWindow.locator('#display')).toContainText('&lt;/task&gt;')
  } finally {
    await app.close()
    removeUserData(userData)
  }
})

test('Transform controls and extreme output remain inside the default window', async () => {
  const { app, userData } = await launchShell()

  try {
    const appWindow = await app.firstWindow()
    await waitForBoot(appWindow)

    // Profile and effort are commands now; their echo lines must stay inside the transcript.
    for (const command of ['profile default', 'profile grok', 'effort low', 'effort max']) {
      await runCommand(appWindow, command)
      await expect(appWindow.locator(doneLine(command.replace(' ', '=')))).toBeVisible()
      await assertContained(appWindow, doneLine(command.replace(' ', '=')), '#display')
    }

    const shellLayout = await appWindow.locator('#consoleShell').evaluate((shell) => {
      const rect = shell.getBoundingClientRect()
      return {
        top: rect.top,
        bottom: rect.bottom,
        viewportHeight: window.innerHeight,
        documentScrollHeight: document.documentElement.scrollHeight,
        documentClientHeight: document.documentElement.clientHeight,
      }
    })
    expect(shellLayout.top).toBeGreaterThanOrEqual(0)
    expect(shellLayout.bottom).toBeLessThanOrEqual(shellLayout.viewportHeight)
    expect(shellLayout.documentScrollHeight).toBeLessThanOrEqual(shellLayout.documentClientHeight)

    await runCommand(appWindow, 'profile codex')
    await runCommand(appWindow, 'effort max')
    await runCommand(
      appWindow,
      `transform "Audit this mixed-direction input: ${'UNBROKEN'.repeat(70)} العربية 日本語 🚀"`,
    )

    await expect(appWindow.locator('#display')).toContainText(
      'Produce each requested deliverable exactly once.',
    )
    await expect(appWindow.locator(doneLine('Finished in'))).toBeVisible()

    const containment = await appWindow.locator('#display').evaluate((element) => {
      const style = element.ownerDocument.defaultView?.getComputedStyle(element)
      if (!style) throw new Error('Renderer window is unavailable.')
      return {
        maxInlineSize: style.maxInlineSize,
        overflowWrap: style.overflowWrap,
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      }
    })

    expect(containment.maxInlineSize).toBe('100%')
    expect(containment.overflowWrap).toBe('anywhere')
    expect(containment.scrollWidth).toBeLessThanOrEqual(containment.clientWidth)

    const postRunLayout = await appWindow.locator('#consoleShell').evaluate((shell) => {
      const rect = shell.getBoundingClientRect()
      return {
        top: rect.top,
        bottom: rect.bottom,
        viewportHeight: window.innerHeight,
        scrollY: window.scrollY,
      }
    })
    expect(postRunLayout.top).toBeGreaterThanOrEqual(0)
    expect(postRunLayout.bottom).toBeLessThanOrEqual(postRunLayout.viewportHeight)
    expect(postRunLayout.scrollY).toBe(0)
    for (const selector of ['#appTitle', '#titleBar', '#promptLine', '#cmdInput']) {
      await assertContained(appWindow, selector, '#consoleShell')
    }
    // Pin the screenshot state. The web font can finish loading after the renderer's last
    // scroll-to-bottom; that reflow leaves the transcript short of its end by a few pixels
    // and made the baseline non-deterministic. Wait for fonts, then re-apply the renderer's
    // own end-of-transcript scroll.
    await appWindow.evaluate(async () => {
      await document.fonts.ready
      const display = document.getElementById('display')
      if (display) display.scrollTop = display.scrollHeight
    })
    await expect(appWindow).toHaveScreenshot('transform-controls-contained.png', {
      maxDiffPixelRatio: 0.01,
    })
  } finally {
    await app.close()
    removeUserData(userData)
  }
})

test('Optimizer stage selection is contained and does not invoke a provider', async () => {
  const { app, userData } = await launchShell()

  try {
    const appWindow = await app.firstWindow()
    await waitForBoot(appWindow)

    // Every provider call in the main process goes through one of these compiled exports:
    // the optimizer and evaluator engines that desktop/ipc/core.ts invokes, and getProvider,
    // which every engine must call before it can reach a provider. Spy on the exact module
    // objects the app loaded (shared require cache) so the claim "no provider call" is
    // asserted at the provider boundary, not through a rendered side effect.
    // (window.sentraDesktop is frozen by contextBridge, so the renderer bridge cannot be wrapped.)
    const spied = await app.evaluate(() => {
      const nodeModule = (process as unknown as { getBuiltinModule: (id: string) => unknown })
        .getBuiltinModule('node:module') as {
        createRequire: (from: string) => ((id: string) => Record<string, unknown>) & {
          resolve: (id: string) => string
          cache: Record<string, unknown>
        }
      }
      const mainRequire = nodeModule.createRequire(
        `${process.cwd()}/dist-electron/desktop/main.js`,
      )
      const calls: string[] = []
      ;(globalThis as unknown as { __sentraProviderCalls: string[] }).__sentraProviderCalls = calls
      const targets: Array<[string, string[]]> = [
        ['../lib/optimizer/engine', ['optimizePrompt', 'optimizePromptStreaming']],
        ['../lib/evaluator/engine', ['evaluatePrompt']],
        ['../lib/llm/provider-registry', ['getProvider']],
      ]
      const patched: string[] = []
      for (const [id, names] of targets) {
        // Patch only a module the app has already loaded. A fresh copy would be spied on
        // while core.ts keeps calling the original, and the assertion would pass vacuously.
        const resolved = mainRequire.resolve(id)
        if (!(resolved in mainRequire.cache)) {
          throw new Error(`Provider spy: ${id} is not in the app's module cache (${resolved})`)
        }
        const moduleExports = mainRequire(id)
        for (const name of names) {
          const original = moduleExports[name]
          if (typeof original !== 'function') continue
          moduleExports[name] = (...args: unknown[]) => {
            calls.push(name)
            return (original as (...inner: unknown[]) => unknown)(...args)
          }
          patched.push(name)
        }
      }
      return patched
    })
    expect(spied).toEqual(['optimizePrompt', 'optimizePromptStreaming', 'evaluatePrompt', 'getProvider'])

    await runCommand(appWindow, 'lane interactive')
    await expect(appWindow.locator(doneLine('lane=interactive'))).toBeVisible()
    await assertContained(appWindow, doneLine('lane=interactive'), '#display')

    await runCommand(appWindow, 'lane deep')
    await expect(appWindow.locator(doneLine('lane=deep'))).toBeVisible()
    await assertContained(appWindow, doneLine('lane=deep'), '#display')

    // Selecting a lane must not start a run: no provider boundary function may have been called.
    const providerCalls = await app.evaluate(
      () => (globalThis as unknown as { __sentraProviderCalls: string[] }).__sentraProviderCalls,
    )
    expect(providerCalls).toEqual([])
  } finally {
    await app.close()
    removeUserData(userData)
  }
})

test('The window is sized in columns and rows: 80×20 on first run, the user’s size afterwards', async ({}, testInfo: TestInfo) => {
  const first = await launchShell()
  let userSize: number[] = []

  try {
    const appWindow = await first.app.firstWindow()
    await waitForBoot(appWindow)

    const grid = await readGridState(appWindow)
    const contentSize = await first.app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].getContentSize(),
    )
    const minimumSize = await first.app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].getMinimumSize(),
    )
    const transcript = await appWindow.locator('#display').evaluate((display) => ({
      clientWidth: display.clientWidth,
      clientHeight: display.clientHeight,
    }))
    const report = {
      cellWidth: grid.cell.width,
      cellHeight: grid.cell.height,
      fontLoaded: grid.fontLoaded,
      fit: grid.fit,
      contentSize,
      minimumSize,
      columnsThatFit: (transcript.clientWidth - CHROME.padX * 2) / grid.cell.width,
      rowsThatFit: (transcript.clientHeight - CHROME.padY * 2) / grid.cell.height,
    }
    writeFileSync(testInfo.outputPath('grid-fit.json'), JSON.stringify(report, null, 2))
    console.log(`grid-fit ${JSON.stringify(report)}`)

    expect(grid.cell.width).toBeGreaterThan(0)
    expect(grid.cell.height).toBeGreaterThan(0)
    expect(grid.fit.applied).toBe(true)
    expect(contentSize).toEqual(gridToContentSize(grid.cell, GRID_TARGET))
    expect(minimumSize).toEqual(gridToContentSize(grid.cell, GRID_MIN))
    expect(report.columnsThatFit).toBeGreaterThanOrEqual(GRID_TARGET.columns - 0.01)
    expect(report.rowsThatFit).toBeGreaterThanOrEqual(GRID_TARGET.rows - 0.01)

    // The user resizes; that size is what the next launch must keep.
    userSize = await first.app.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0]
      win.setContentSize(1100, 700)
      return win.getContentSize()
    })
    expect(userSize).toEqual([1100, 700])
  } finally {
    await first.app.close()
  }

  const second = await launchShell(first.userData)
  try {
    const appWindow = await second.app.firstWindow()
    await waitForBoot(appWindow)

    const grid = await readGridState(appWindow)
    const contentSize = await second.app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].getContentSize(),
    )
    expect(grid.fit.applied).toBe(false)
    expect(grid.fit.reason).toBe('persisted')
    expect(contentSize).toEqual(userSize)
  } finally {
    await second.app.close()
    removeUserData(second.userData)
  }
})

function hexToRgb(hex: string) {
  const value = hex.trim().replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return `rgb(${r}, ${g}, ${b})`
}

test('Console colours and measurements match the reference :root block', async ({}, testInfo: TestInfo) => {
  const reference = readFileSync(REFERENCE, 'utf8')
  const root = Object.fromEntries(
    Array.from(reference.matchAll(/--term-([\w-]+):\s*([^;]+);/g)).map((match) => [
      match[1],
      match[2].trim(),
    ]),
  ) as Record<string, string>
  const ruleColour = (selector: string) =>
    reference.match(new RegExp(`\\.${selector}\\s*\\{[^}]*?color:\\s*([^;]+);`))?.[1].trim() ?? ''

  const { app, userData } = await launchShell()

  try {
    const appWindow = await app.firstWindow()
    await waitForBoot(appWindow)

    // One line of each status prefix: warn from the provider-missing boot badge (keys are
    // blanked in launchShell), ok and error from a setting command and its rejection.
    await expect(appWindow.locator('#display .line.status-warn')).toBeVisible()
    await runCommand(appWindow, 'lane interactive')
    await expect(appWindow.locator(doneLine('lane=interactive'))).toBeVisible()
    await runCommand(appWindow, 'lane nowhere')
    await expect(appWindow.locator('#display .line.status-error')).toBeVisible()
    // A result body with a heading, a path and a backticked command, for the body runs.
    await runCommand(appWindow, 'transform "Review lib/optimizer/engine.ts, then run `pnpm run test`."')
    await expect(appWindow.locator('#display .line.type-agent .seg-dir')).toBeVisible()

    const computed = await appWindow.evaluate(() => {
      const read = (selector: string, property: string, pseudo?: string) => {
        const element = document.querySelector(selector)
        if (!element) return `missing: ${selector}`
        return getComputedStyle(element, pseudo).getPropertyValue(property).trim()
      }
      return {
        windowBackground: read('#consoleShell', 'background-color'),
        windowRadius: read('#consoleShell', 'border-top-left-radius'),
        titleBarBackground: read('#titleBar', 'background-color'),
        titleColour: read('#appTitle', 'color'),
        titleFontSize: read('#appTitle', 'font-size'),
        transcriptBackground: read('#display', 'background-color'),
        transcriptColour: read('#display', 'color'),
        transcriptPaddingLeft: read('#display', 'padding-left'),
        transcriptPaddingTop: read('#display', 'padding-top'),
        transcriptFontSize: read('#display', 'font-size'),
        transcriptLineHeight: read('#display', 'line-height'),
        bannerTitleColour: read('#display .line.banner-title', 'color'),
        okPrefixColour: read('#display .line.status-ok', 'color', '::before'),
        warnPrefixColour: read('#display .line.status-warn', 'color', '::before'),
        errorPrefixColour: read('#display .line.status-error', 'color', '::before'),
        headingColour: read('#display .line.type-agent .seg-heading', 'color'),
        dirColour: read('#display .line.type-agent .seg-dir', 'color'),
        dirWeight: read('#display .line.type-agent .seg-dir', 'font-weight'),
        fileColour: read('#display .line.type-agent .seg-file', 'color'),
        cmdColour: read('#display .line.type-agent .seg-cmd', 'color'),
      }
    })

    const lineHeightPx = (parseFloat(root['font-size']) * parseFloat(root.line)).toFixed(2)
    const rows: Array<{ property: string; reference: string; computed: string; match: boolean | null }> = [
      { property: '--term-bg → window background', reference: root.bg, computed: computed.windowBackground, match: hexToRgb(root.bg) === computed.windowBackground },
      { property: '--term-bg → transcript background', reference: root.bg, computed: computed.transcriptBackground, match: hexToRgb(root.bg) === computed.transcriptBackground },
      { property: '--term-chrome → title bar background', reference: root.chrome, computed: computed.titleBarBackground, match: hexToRgb(root.chrome) === computed.titleBarBackground },
      { property: '--term-text → transcript colour', reference: root.text, computed: computed.transcriptColour, match: hexToRgb(root.text) === computed.transcriptColour },
      { property: '--term-bright → banner title colour', reference: root.bright, computed: computed.bannerTitleColour, match: hexToRgb(root.bright) === computed.bannerTitleColour },
      { property: '--term-dim → title colour', reference: root.dim, computed: computed.titleColour, match: hexToRgb(root.dim) === computed.titleColour },
      { property: '--term-green → ok prefix', reference: root.green, computed: computed.okPrefixColour, match: hexToRgb(root.green) === computed.okPrefixColour },
      { property: '.warn → warn prefix', reference: ruleColour('warn'), computed: computed.warnPrefixColour, match: hexToRgb(ruleColour('warn')) === computed.warnPrefixColour },
      { property: '.err → error prefix', reference: ruleColour('err'), computed: computed.errorPrefixColour, match: hexToRgb(ruleColour('err')) === computed.errorPrefixColour },
      { property: '--term-radius → window radius', reference: root.radius, computed: computed.windowRadius, match: root.radius === computed.windowRadius },
      { property: '--term-pad-x → transcript padding-left', reference: root['pad-x'], computed: computed.transcriptPaddingLeft, match: root['pad-x'] === computed.transcriptPaddingLeft },
      { property: '--term-pad-y → transcript padding-top', reference: root['pad-y'], computed: computed.transcriptPaddingTop, match: root['pad-y'] === computed.transcriptPaddingTop },
      { property: '--term-font-size → transcript font-size', reference: root['font-size'], computed: computed.transcriptFontSize, match: root['font-size'] === computed.transcriptFontSize },
      { property: '--term-font-size → title font-size (one size everywhere)', reference: root['font-size'], computed: computed.titleFontSize, match: root['font-size'] === computed.titleFontSize },
      { property: '--term-line → transcript line-height', reference: `${root.line} (${lineHeightPx}px)`, computed: computed.transcriptLineHeight, match: Math.abs(parseFloat(computed.transcriptLineHeight) - parseFloat(lineHeightPx)) < 0.05 },
      { property: '--term-dir → directory run colour', reference: root.dir, computed: computed.dirColour, match: hexToRgb(root.dir) === computed.dirColour },
      { property: '.dir → directory run weight', reference: '700', computed: computed.dirWeight, match: computed.dirWeight === '700' },
      { property: '--term-bright → file run colour', reference: root.bright, computed: computed.fileColour, match: hexToRgb(root.bright) === computed.fileColour },
      { property: '.seg-b → backticked command colour', reference: root.green, computed: computed.cmdColour, match: hexToRgb(root.green) === computed.cmdColour },
      { property: '--term-cyan (path segment)', reference: root.cyan, computed: 'not rendered by the app', match: null },
      { property: '--term-yellow (git branch)', reference: root.yellow, computed: 'not rendered by the app', match: null },
      { property: '--term-page (outside the window)', reference: root.page, computed: 'outside the app window', match: null },
      { property: '.head → heading run colour', reference: ruleColour('head'), computed: computed.headingColour, match: hexToRgb(ruleColour('head')) === computed.headingColour },
    ]

    const table = [
      '| property | reference | computed | match |',
      '| --- | --- | --- | --- |',
      ...rows.map(
        (row) =>
          `| ${row.property} | ${row.reference} | ${row.computed} | ${row.match === null ? 'n/a' : row.match ? 'yes' : 'NO'} |`,
      ),
    ].join('\n')
    writeFileSync(testInfo.outputPath('colour-table.md'), `${table}\n`)
    console.log(`colour-table\n${table}`)

    const mismatches = rows.filter((row) => row.match === false)
    expect(mismatches, table).toEqual([])
  } finally {
    await app.close()
    removeUserData(userData)
  }
})
