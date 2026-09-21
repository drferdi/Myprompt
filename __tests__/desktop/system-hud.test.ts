import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const rendererHtml = readFileSync(
  path.resolve(testDir, '../../desktop/renderer/index.html'),
  'utf8'
)

const STATS = {
  heapMb: 42.5,
  heapLimitMb: 85,
  cpuPercent: 12.34,
  usedMemGb: 10.4,
  totalMemGb: 32,
  uptimeSeconds: 3671, // 01:01:11
}

describe('system HUD', () => {
  let invoke: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.resetModules()
    document.open()
    document.write(rendererHtml)
    document.close()

    invoke = vi.fn(async (channel: string) => (channel === 'system:stats' ? STATS : {}))
    vi.stubGlobal('sentraDesktop', {
      getShellState: vi.fn().mockResolvedValue({}),
      invoke,
      auth: { getSession: vi.fn().mockResolvedValue(null) },
      workspace: {
        listDrafts: vi.fn().mockResolvedValue([]),
        listRecentRuns: vi.fn().mockResolvedValue([]),
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
    // Let the initial poll resolve.
    await vi.waitFor(() => expect(document.getElementById('hudUptime')?.textContent).not.toBe('—'))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    document.body.replaceChildren()
  })

  it('renders real process telemetry instead of the hardcoded placeholders', () => {
    expect(invoke).toHaveBeenCalledWith('system:stats')
    expect(document.getElementById('hudTemp')?.textContent).toBe('42.5 MB')
    expect(document.getElementById('hudLoad')?.textContent).toBe('12.3%')
    expect(document.getElementById('hudMem')?.textContent).toBe('10.4 / 32 GB')
    expect(document.getElementById('hudUptime')?.textContent).toBe('01:01:11')
  })

  it('drives the HUD bars from the same reading', () => {
    expect(document.getElementById('hudTempBar')?.style.width).toBe('50%')
    expect(document.getElementById('hudLoadBar')?.style.width).toBe('12%')
  })

  it('mirrors the reading into the mini widget HUD', () => {
    expect(document.getElementById('mHudTemp')?.textContent).toBe('42.5 MB')
    expect(document.getElementById('mHudLoad')?.textContent).toBe('12.3%')
    expect(document.getElementById('mHudMem')?.textContent).toBe('10.4/32')
  })
})
