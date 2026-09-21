import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const rendererHtml = readFileSync(
  path.resolve(testDir, '../../desktop/renderer/index.html'),
  'utf8'
)

function createDesktopBridge() {
  return {
    getShellState: vi.fn().mockResolvedValue({}),
    invoke: vi.fn().mockResolvedValue({}),
    auth: {
      getSession: vi.fn().mockResolvedValue(null),
      setSession: vi.fn().mockResolvedValue({}),
      login: vi.fn().mockResolvedValue({}),
      register: vi.fn().mockResolvedValue({}),
      logout: vi.fn().mockResolvedValue({}),
    },
    workspace: {
      listDrafts: vi.fn().mockResolvedValue([]),
      saveDraft: vi.fn().mockResolvedValue({}),
      listRecentRuns: vi.fn().mockResolvedValue([]),
      listBenchmarks: vi.fn().mockResolvedValue([]),
    },
    onStream: vi.fn(),
    offStream: vi.fn(),
    close: vi.fn(),
    minimize: vi.fn(),
    getWindowPos: vi.fn().mockResolvedValue([100, 200]),
    setWindowPos: vi.fn(),
  }
}

function mouseEvent(type: string, screenX: number, screenY: number, buttons = 0) {
  return new MouseEvent(type, { bubbles: true, button: 0, buttons, screenX, screenY })
}

async function settleDragStart() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('native window dragging', () => {
  let bridge: ReturnType<typeof createDesktopBridge>
  let documentListeners: Array<
    [string, EventListenerOrEventListenerObject, boolean | AddEventListenerOptions | undefined]
  >
  let windowListeners: Array<
    [string, EventListenerOrEventListenerObject, boolean | AddEventListenerOptions | undefined]
  >

  beforeEach(async () => {
    vi.resetModules()
    document.open()
    document.write(rendererHtml)
    document.close()
    bridge = createDesktopBridge()
    vi.stubGlobal('sentraDesktop', bridge)
    documentListeners = []
    windowListeners = []
    const addDocumentListener = document.addEventListener.bind(document)
    const addWindowListener = window.addEventListener.bind(window)
    const documentAddEventListenerSpy = vi
      .spyOn(document, 'addEventListener')
      .mockImplementation((type, listener, options) => {
        documentListeners.push([type, listener, options])
        addDocumentListener(type, listener, options)
      })
    const windowAddEventListenerSpy = vi
      .spyOn(window, 'addEventListener')
      .mockImplementation((type, listener, options) => {
        windowListeners.push([type, listener, options])
        addWindowListener(type, listener, options)
      })
    await import('../../desktop/renderer/renderer')
    documentAddEventListenerSpy.mockRestore()
    windowAddEventListenerSpy.mockRestore()
  })

  afterEach(() => {
    documentListeners.forEach(([type, listener, options]) =>
      document.removeEventListener(type, listener, options)
    )
    windowListeners.forEach(([type, listener, options]) =>
      window.removeEventListener(type, listener, options)
    )
    vi.unstubAllGlobals()
    document.body.replaceChildren()
  })

  it('moves the native window when dragging a full-mode status panel', async () => {
    const statusPanel = document.querySelector<HTMLElement>('.status-panel')
    expect(statusPanel).not.toBeNull()

    statusPanel?.dispatchEvent(mouseEvent('mousedown', 100, 200, 1))
    await settleDragStart()
    document.dispatchEvent(mouseEvent('mousemove', 120, 230, 1))

    expect(bridge.getWindowPos).toHaveBeenCalledOnce()
    expect(bridge.setWindowPos).toHaveBeenCalledTimes(1)
    expect(bridge.setWindowPos).toHaveBeenLastCalledWith(120, 230)
    document.dispatchEvent(mouseEvent('mouseup', 120, 230))
  })

  it('moves the native window when dragging the card header', async () => {
    const cardHeader = document.querySelector<HTMLElement>('.card-header')
    expect(cardHeader).not.toBeNull()

    cardHeader?.dispatchEvent(mouseEvent('mousedown', 300, 400, 1))
    await settleDragStart()
    document.dispatchEvent(mouseEvent('mousemove', 320, 440, 1))
    document.dispatchEvent(mouseEvent('mouseup', 320, 440))

    expect(bridge.setWindowPos).toHaveBeenCalledTimes(1)
    expect(bridge.setWindowPos).toHaveBeenLastCalledWith(120, 240)
  })

  it('minimizes the native window from the header minimize button', () => {
    const consoleRig = document.querySelector<HTMLElement>('#consoleRig')
    const miniWidget = document.querySelector<HTMLElement>('#miniWidget')

    document.querySelector<HTMLButtonElement>('#miniToggleBtn')?.click()

    expect(bridge.minimize).toHaveBeenCalledOnce()
    // The shell must stay in full mode: minimize is an OS-level action, not a widget swap.
    expect(consoleRig?.hidden).toBe(false)
    expect(miniWidget?.hidden).toBe(true)
    expect(bridge.invoke).not.toHaveBeenCalledWith('desktop:toggle-mini', expect.anything())
  })

  it('does not initiate a drag from an interactive descendant', async () => {
    const clearButton = document.querySelector<HTMLButtonElement>('#clearBtn')
    expect(clearButton).not.toBeNull()

    clearButton?.dispatchEvent(mouseEvent('mousedown', 100, 200, 1))
    await settleDragStart()
    document.dispatchEvent(mouseEvent('mousemove', 120, 230, 1))
    document.dispatchEvent(mouseEvent('mouseup', 120, 230))

    expect(bridge.getWindowPos).not.toHaveBeenCalled()
    expect(bridge.setWindowPos).not.toHaveBeenCalled()
  })

  it('closes the desktop window from the rack power button', () => {
    const powerButton = document.querySelector<HTMLButtonElement>('#powerBtn')
    expect(powerButton).not.toBeNull()

    powerButton?.click()

    expect(bridge.close).toHaveBeenCalledOnce()
  })

  it('cancels an active drag when the window blurs', async () => {
    const statusPanel = document.querySelector<HTMLElement>('.status-panel')
    statusPanel?.dispatchEvent(mouseEvent('mousedown', 100, 200, 1))
    await settleDragStart()
    window.dispatchEvent(new Event('blur'))
    document.dispatchEvent(mouseEvent('mousemove', 120, 230, 1))
    document.dispatchEvent(mouseEvent('mouseup', 120, 230))

    expect(bridge.setWindowPos).not.toHaveBeenCalled()
  })

  it('cancels a pending drag when the window blurs', async () => {
    let resolvePosition: ((position: number[]) => void) | undefined
    bridge.getWindowPos.mockImplementationOnce(
      () =>
        new Promise<number[]>((resolve) => {
          resolvePosition = resolve
        })
    )
    const statusPanel = document.querySelector<HTMLElement>('.status-panel')
    statusPanel?.dispatchEvent(mouseEvent('mousedown', 100, 200, 1))
    window.dispatchEvent(new Event('blur'))
    resolvePosition?.([100, 200])
    await settleDragStart()
    document.dispatchEvent(mouseEvent('mousemove', 120, 230, 1))
    document.dispatchEvent(mouseEvent('mouseup', 120, 230))

    expect(bridge.setWindowPos).not.toHaveBeenCalled()
  })

  it('cancels a drag when a mousemove has no primary button', async () => {
    const statusPanel = document.querySelector<HTMLElement>('.status-panel')
    statusPanel?.dispatchEvent(mouseEvent('mousedown', 100, 200, 1))
    await settleDragStart()
    document.dispatchEvent(mouseEvent('mousemove', 120, 230))
    document.dispatchEvent(mouseEvent('mousemove', 140, 260, 1))
    document.dispatchEvent(mouseEvent('mouseup', 140, 260))

    expect(bridge.setWindowPos).not.toHaveBeenCalled()
  })
})
