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

function typeCommand(command: string) {
  const field = document.getElementById('cmdInput') as HTMLInputElement
  field.value = command
  field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
}

async function waitForStatLine() {
  return vi.waitFor(() => {
    const line = Array.from(document.querySelectorAll<HTMLElement>('.line')).find((element) =>
      element.textContent?.includes('heap=')
    )
    expect(line).toBeTruthy()
    return line as HTMLElement
  })
}

describe('system telemetry', () => {
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
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    document.body.replaceChildren()
  })

  it('prints process telemetry on demand instead of polling', async () => {
    expect(invoke).not.toHaveBeenCalledWith('system:stats')

    typeCommand('stat')
    const line = await waitForStatLine()

    expect(line.textContent).toContain('heap=42.5 MB')
    expect(line.textContent).toContain('cpu=12.3%')
    expect(line.textContent).toContain('mem=10.4 / 32 GB')
    expect(line.textContent).toContain('uptime=01:01:11')
    // Text after the six-character status prefix starts at screen column 6, so the second
    // pair (column 40) sits at text index 34 and the fourth pair opens the second row.
    const [firstRow, secondRow] = (line.textContent ?? '').split('\n')
    expect(firstRow.indexOf('cpu=')).toBe(34)
    expect(secondRow.indexOf('uptime=')).toBe(0)
  })

  it('invokes system:stats exactly once per stat command', async () => {
    typeCommand('stat')
    await waitForStatLine()

    const statsCalls = () => invoke.mock.calls.filter(([channel]) => channel === 'system:stats')
    expect(statsCalls()).toHaveLength(1)

    typeCommand('stat')
    await vi.waitFor(() => expect(statsCalls()).toHaveLength(2))
  })

  it('marks the stat line as ok', async () => {
    typeCommand('stat')
    const line = await waitForStatLine()

    expect(line.classList.contains('status-ok')).toBe(true)
  })
})
