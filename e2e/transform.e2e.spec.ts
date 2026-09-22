import { readFileSync } from 'node:fs'
import path from 'node:path'

import { _electron as electron, expect, test, type Page } from '@playwright/test'

const packageVersion = (
  JSON.parse(readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')) as {
    version: string
  }
).version

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
 * once its instruction line is present.
 */
async function waitForBoot(page: Page) {
  await expect(page.locator('#cmdInput')).toBeVisible()
  await expect(page.locator('#display .line.banner-hint')).toBeVisible()
}

test('Transform compiles every supported profile in the real Electron renderer', async () => {
  const app = await electron.launch({
    args: [path.resolve(process.cwd(), 'dist-electron/desktop/bootstrap.js')],
    env: { ...process.env, NODE_ENV: 'test' },
  })

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
  }
})

test('Transform controls and extreme output remain inside the default window', async () => {
  const app = await electron.launch({
    args: [path.resolve(process.cwd(), 'dist-electron/desktop/bootstrap.js')],
    env: { ...process.env, NODE_ENV: 'test' },
  })

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
  }
})

test('Optimizer stage selection is contained and does not invoke a provider', async () => {
  const app = await electron.launch({
    args: [path.resolve(process.cwd(), 'dist-electron/desktop/bootstrap.js')],
    env: { ...process.env, NODE_ENV: 'test' },
  })

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
  }
})
