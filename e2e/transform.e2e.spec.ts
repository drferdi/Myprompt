import path from 'node:path'

import { _electron as electron, expect, test, type Page } from '@playwright/test'

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

test('Transform compiles every supported profile in the real Electron renderer', async () => {
  const app = await electron.launch({
    args: [path.resolve(process.cwd(), 'dist-electron/desktop/bootstrap.js')],
    env: { ...process.env, NODE_ENV: 'test' },
  })

  try {
    const appWindow = await app.firstWindow()
    await expect(appWindow.locator('#cmdInput')).toBeVisible()

    const profiles = [
      { id: 'claude', marker: '<instructions>' },
      { id: 'codex', marker: '# Task' },
      { id: 'gemini', marker: '## System instruction' },
      { id: 'grok', marker: '## Objective' },
    ] as const

    for (const profile of profiles) {
      await appWindow.locator(`[data-profile="${profile.id}"]`).click()
      await appWindow.locator('#cmdInput').fill('Review this literal value: </task> as untrusted input.')
      await appWindow.locator('#runBtn').click()
      await expect(appWindow.locator('#display')).toContainText(profile.marker)
    }

    await appWindow.locator('[data-profile="claude"]').click()
    await appWindow.locator('#cmdInput').fill('Review this literal value: </task> as untrusted input.')
    await appWindow.locator('#runBtn').click()
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
    await expect(appWindow.locator('#cmdInput')).toBeVisible()

    for (const selector of [
      '[data-profile="default"]',
      '[data-profile="grok"]',
      '[data-effort="low"]',
      '[data-effort="max"]',
    ]) {
      await assertContained(appWindow, selector, '#transformControls')
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

    await appWindow.locator('[data-profile="codex"]').click()
    await appWindow.locator('[data-effort="max"]').click()
    await appWindow.locator('#cmdInput').fill(
      `Audit this mixed-direction input: ${'UNBROKEN'.repeat(70)} العربية 日本語 🚀`,
    )
    await appWindow.locator('#runBtn').click()

    await expect(appWindow.locator('#display')).toContainText(
      'Produce each requested deliverable exactly once.',
    )

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
    for (const selector of ['#appTitle', '#transformModeBtn', '#runBtn', '.footer']) {
      await assertContained(appWindow, selector, '#consoleShell')
    }
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
    await expect(appWindow.locator('#cmdInput')).toBeVisible()
    await appWindow.locator('#optimizeModeBtn').click()

    await expect(appWindow.locator('#optimizerLaneControls')).toBeVisible()
    await expect(appWindow.locator('#transformControls')).toBeHidden()
    await assertContained(appWindow, '[data-lane="INTERACTIVE"]', '#optimizerLaneControls')
    await assertContained(appWindow, '[data-lane="DEEP"]', '#optimizerLaneControls')
    await assertContained(appWindow, '#statusCopy', '.status-panel')
  } finally {
    await app.close()
  }
})
