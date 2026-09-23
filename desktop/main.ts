import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parseEnv } from 'node:util'

import { loadEnvConfig } from '@next/env'
import { app, BrowserWindow, ipcMain, screen } from 'electron'

import { registerAuthIpc } from './ipc/auth'
import { registerCoreIpc } from './ipc/core'
import { registerWorkspaceIpc } from './ipc/workspace'

import { DEFAULT_MODEL_MAP } from '@/lib/constants'
import { loadDesktopSession } from '@/lib/desktop/session-store'
import { getAvailableProviders, getScopedProviderOverrides } from '@/lib/llm/provider-registry'
import {
  createProviderReadiness,
  type ProviderReadiness,
} from '@/lib/llm/provider-readiness'

let mainWindow: BrowserWindow | null = null
const isSmokeMode =
  process.env.SENTRA_DESKTOP_SMOKE === '1' ||
  process.argv.includes('--smoke') ||
  app.commandLine.hasSwitch('smoke')

app.commandLine.appendSwitch('disable-features', 'DirectCompositionVideoOverlays')
app.commandLine.appendSwitch('log-level', '3')

function resolveDesktopProjectDir() {
  const sourceProjectDir = path.resolve(__dirname, '..')
  if (existsSync(path.join(sourceProjectDir, 'package.json'))) {
    return sourceProjectDir
  }

  const bundledProjectDir = path.resolve(__dirname, '..', '..')
  if (existsSync(path.join(bundledProjectDir, 'package.json'))) {
    return bundledProjectDir
  }

  return process.cwd()
}

const DESKTOP_ENV_OVERRIDE_KEYS = [
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
  'SENTRA_DESKTOP_PROVIDER',
] as const

function applyDesktopEnvOverrides(projectDir: string) {
  if (process.env.NODE_ENV === 'test') {
    return
  }

  for (const fileName of ['.env', '.env.local']) {
    const envPath = path.join(projectDir, fileName)

    if (!existsSync(envPath)) {
      continue
    }

    const parsedEnv = parseEnv(readFileSync(envPath, 'utf8'))

    for (const key of DESKTOP_ENV_OVERRIDE_KEYS) {
      const value = parsedEnv[key]
      if (typeof value === 'string' && value.trim()) {
        process.env[key] = value.trim()
      }
    }
  }
}

function loadDesktopEnv() {
  const projectDir = resolveDesktopProjectDir()
  loadEnvConfig(projectDir)
  applyDesktopEnvOverrides(projectDir)
}

loadDesktopEnv()

type DesktopProviderName = 'CLAUDE' | 'OPENAI' | 'MISTRAL' | 'QWEN' | 'GROK'

interface DesktopShellProviderState {
  modelChip: string
  preferredModel: string
  preferredProvider: DesktopProviderName
  providerReadiness: ProviderReadiness
  optimizerLaneStates?: Record<
    'INTERACTIVE' | 'DEEP',
    {
      modelChip: string
      preferredModel: string
    }
  >
}

interface DesktopShellBadge {
  id: string
  label: string
  tone: 'muted' | 'danger'
}

type DesktopOptimizerLane = 'INTERACTIVE' | 'DEEP'

function getOptimizerOpenAiOverrides(lane?: DesktopOptimizerLane) {
  return getScopedProviderOverrides('OPENAI', 'OPTIMIZER', lane)
}

function resolveOpenAiModel(lane?: DesktopOptimizerLane) {
  const { model: configuredModel, baseUrl } = getOptimizerOpenAiOverrides(lane)

  if (configuredModel) {
    return configuredModel
  }

  const usesExplicitCompatBaseUrl = Boolean(baseUrl)

  if (usesExplicitCompatBaseUrl) {
    return null
  }

  return DEFAULT_MODEL_MAP.OPENAI
}

function usesPioneerOpenAiCompat(lane?: DesktopOptimizerLane) {
  const baseUrl = getOptimizerOpenAiOverrides(lane).baseUrl || ''
  return /api\.pioneer\.ai\/v1\/?$/i.test(baseUrl)
}

function buildOpenAiLaneState(lane: DesktopOptimizerLane) {
  const model = resolveOpenAiModel(lane)
  const isPioneer = usesPioneerOpenAiCompat(lane)

  return {
    preferredModel: model ?? 'model-required',
    modelChip: model
      ? isPioneer
        ? `pioneer/${model.replace(/^MiniMaxAI\//, '').toLowerCase()}`
        : model
      : isPioneer
        ? 'pioneer/model-required'
        : 'openai-compatible/model-required',
  }
}

function getPreferredLoadedProvider(): DesktopProviderName | null {
  if (process.env.XAI_API_KEY?.trim()) return 'GROK'
  if (process.env.OPENAI_API_KEY?.trim()) return 'OPENAI'
  if (process.env.ANTHROPIC_API_KEY?.trim()) return 'CLAUDE'
  if (process.env.MISTRAL_API_KEY?.trim()) return 'MISTRAL'
  if (process.env.QWEN_API_KEY?.trim()) return 'QWEN'
  return null
}

function getShellProviderState(): DesktopShellProviderState {
  const providerReadiness = createProviderReadiness(
    getAvailableProviders(),
    getPreferredLoadedProvider()
  )

  if (providerReadiness.status === 'missing') {
    return {
      preferredProvider: 'GROK',
      preferredModel: 'grok-3-fast',
      modelChip: 'env-required',
      providerReadiness,
    }
  }

  if (providerReadiness.activeProvider === 'OPENAI' && usesPioneerOpenAiCompat('INTERACTIVE')) {
    const interactiveLaneState = buildOpenAiLaneState('INTERACTIVE')
    const deepLaneState = buildOpenAiLaneState('DEEP')
    return {
      preferredProvider: 'OPENAI',
      preferredModel: interactiveLaneState.preferredModel,
      modelChip: interactiveLaneState.modelChip,
      optimizerLaneStates: {
        INTERACTIVE: interactiveLaneState,
        DEEP: deepLaneState,
      },
      providerReadiness,
    }
  }

  if (providerReadiness.activeProvider === 'GROK') {
    return {
      preferredProvider: 'GROK',
      preferredModel: 'grok-3-fast',
      modelChip: 'grok-3-fast',
      providerReadiness,
    }
  }

  if (providerReadiness.activeProvider === 'OPENAI') {
    const interactiveLaneState = buildOpenAiLaneState('INTERACTIVE')
    const deepLaneState = buildOpenAiLaneState('DEEP')
    return {
      preferredProvider: 'OPENAI',
      preferredModel: interactiveLaneState.preferredModel,
      modelChip: interactiveLaneState.modelChip,
      optimizerLaneStates: {
        INTERACTIVE: interactiveLaneState,
        DEEP: deepLaneState,
      },
      providerReadiness,
    }
  }

  if (providerReadiness.activeProvider === 'CLAUDE') {
    return {
      preferredProvider: 'CLAUDE',
      preferredModel: 'claude-sonnet-4',
      modelChip: 'claude-ready',
      providerReadiness,
    }
  }

  return {
    preferredProvider: providerReadiness.activeProvider,
    preferredModel: DEFAULT_MODEL_MAP[providerReadiness.activeProvider],
    modelChip: `${providerReadiness.activeProvider.toLowerCase()}/${DEFAULT_MODEL_MAP[providerReadiness.activeProvider]}`,
    providerReadiness,
  }
}

async function buildShellBadges(
  providerState: DesktopShellProviderState
): Promise<DesktopShellBadge[]> {
  const badges: DesktopShellBadge[] = []
  const session = await loadDesktopSession().catch(() => null)

  if (!session?.access_token) {
    badges.push({
      id: 'guest',
      label: 'FTDRᵢ(t,h)',
      tone: 'muted',
    })
  }

  if (providerState.providerReadiness.status === 'missing') {
    badges.push({
      id: 'provider-missing',
      label: 'Provider Missing',
      tone: 'danger',
    })
  }

  return badges
}

function appendDesktopEnvWarning() {
  if (isSmokeMode) {
    return
  }

  const providerState = getShellProviderState()
  const hasAnyDesktopProvider =
    process.env.XAI_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.ANTHROPIC_API_KEY?.trim()

  if (hasAnyDesktopProvider) {
    return
  }

  console.warn(
    `[sentra-desktop] No desktop LLM provider key is loaded. ` +
      `Current fallback provider is ${providerState.preferredProvider}. ` +
      `Set the matching key in .env.local, process env, or OS env before using Optimizer/Evaluator.`
  )
}

// The window is sized in transcript columns and rows, never in fixed pixels. The renderer
// measures the real character cell once its fonts are loaded and reports it over
// 'window:fit-grid'; the chrome offsets below mirror index.css (title bar 28px, transcript
// padding 10px 14px) so that columns × cell width + padding is the content width.
// The target sits on the floor Chief set (80 × 20): prose (72) plus the margin (2) still
// fits with room for a scrollbar. Smaller than this needs a new minimum and prose width.
const GRID_TARGET = { columns: 80, rows: 20 }
const GRID_MIN = { columns: 80, rows: 20 }
const CHROME = { titleBar: 28, padX: 14, padY: 10 }
// JetBrains Mono at 11px / 1.45 measures 6.6 × 15.95; used when measurement fails (556×367).
const FALLBACK_CELL = { width: 6.6, height: 15.95 }

interface GridCell {
  width: number
  height: number
}

function gridToContentSize(cell: GridCell, grid: { columns: number; rows: number }) {
  return {
    // Ceil, never round: the requested grid must always fit in whole pixels.
    width: Math.ceil(grid.columns * cell.width + CHROME.padX * 2),
    height: Math.ceil(grid.rows * cell.height + CHROME.padY * 2 + CHROME.titleBar),
  }
}

const DEFAULT_WINDOW = { ...gridToContentSize(FALLBACK_CELL, GRID_TARGET), x: 0, y: 0 }
const FALLBACK_MIN_SIZE = gridToContentSize(FALLBACK_CELL, GRID_MIN)

// Bumped whenever the default shell size changes, so a persisted size from an older
// layout is discarded instead of pinning the window to the previous dimensions.
// v4: the stored 1280×860 from the pixel-sized era is discarded for the grid fit.
// v5: the grid target halved to 84 × 21; the stored 964×616 is discarded.
// v6: the grid target is the 80 × 20 floor; the stored 684×446 is discarded.
// v7: the face shrank from 13px to 11px; the 13px-era fit is discarded and measured again.
const WINDOW_STATE_VERSION = 7

// The grid fit runs once, on the first launch with no persisted state at the current
// version. After that the user's own size always wins.
let windowStatePersisted = false
let gridFitApplied = false

function parseGridCell(payload: unknown): GridCell | null {
  if (typeof payload !== 'object' || payload === null) return null
  const { cellWidth, cellHeight } = payload as { cellWidth?: unknown; cellHeight?: unknown }
  if (typeof cellWidth !== 'number' || typeof cellHeight !== 'number') return null
  if (!Number.isFinite(cellWidth) || !Number.isFinite(cellHeight)) return null
  // Sane monospace cells only: an 11px face is roughly 5–8px wide and 13–19px tall.
  if (cellWidth < 3 || cellWidth > 30 || cellHeight < 6 || cellHeight > 60) return null
  return { width: cellWidth, height: cellHeight }
}

function resolveWindowStatePath() {
  const baseDir = app.getPath('userData')
  return path.join(baseDir, 'sentra-desktop-window-state.json')
}

function loadWindowState(): typeof DEFAULT_WINDOW {
  const statePath = resolveWindowStatePath()
  if (existsSync(statePath)) {
    try {
      const content = readFileSync(statePath, 'utf8')
      const saved = JSON.parse(content)
      if (saved?.version === WINDOW_STATE_VERSION) {
        windowStatePersisted = true
        return {
          width: typeof saved.width === 'number' ? saved.width : DEFAULT_WINDOW.width,
          height: typeof saved.height === 'number' ? saved.height : DEFAULT_WINDOW.height,
          x: typeof saved.x === 'number' ? saved.x : DEFAULT_WINDOW.x,
          y: typeof saved.y === 'number' ? saved.y : DEFAULT_WINDOW.y,
        }
      }
    } catch {
      // fall through to default
    }
  }
  // Position at top-right of primary display
  try {
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenW } = primaryDisplay.workAreaSize
    return {
      ...DEFAULT_WINDOW,
      x: screenW - DEFAULT_WINDOW.width - 20,
      y: 20,
    }
  } catch {
    return { ...DEFAULT_WINDOW }
  }
}

function saveWindowState(bounds: { x: number; y: number; width: number; height: number }) {
  const statePath = resolveWindowStatePath()
  try {
    writeFileSync(statePath, JSON.stringify({ ...bounds, version: WINDOW_STATE_VERSION }))
  } catch {
    // ignore
  }
}

function resolveDesktopWorkspaceFilePath() {
  const baseDir =
    typeof app.getPath === 'function'
      ? app.getPath('userData')
      : path.join(resolveDesktopProjectDir(), '.desktop-runtime')

  return path.join(baseDir, 'sentra-desktop-workspace.json')
}

const isWindows = process.platform === 'win32'

function createWindow() {
  const winState = loadWindowState()

  mainWindow = new BrowserWindow({
    width: winState.width,
    height: winState.height,
    ...(winState.x !== undefined && winState.y !== undefined
      ? { x: winState.x, y: winState.y }
      : {}),
    resizable: true,
    minWidth: FALLBACK_MIN_SIZE.width,
    minHeight: FALLBACK_MIN_SIZE.height,
    frame: false,
    // On Windows a transparent window disables ClearType (sub-pixel antialiasing), so small
    // text rendered greyscale and soft: measured 0% sub-pixel edge pixels transparent vs
    // 82% opaque. The window is opaque there in the console colour (--console-bg-window);
    // Windows 11 still rounds frameless corners natively. Elsewhere it stays transparent
    // for the CSS radius and the window shadow.
    transparent: !isWindows,
    backgroundColor: isWindows ? '#16191d' : '#00000000',
    roundedCorners: true,
    show: !isSmokeMode,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.setIgnoreMouseEvents(false)
  mainWindow.setFocusable(true)
  mainWindow.focus()

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'))

  if (process.env.SENTRA_DESKTOP_DEBUG === '1') {
    mainWindow.webContents.on('console-message', (_event, level, message, line, source) => {
      console.error(`[renderer:${level}] ${source}:${line} ${message}`)
    })
    mainWindow.webContents.on('did-fail-load', (_event, code, description, url) => {
      console.error(`[renderer:did-fail-load] ${code} ${description} ${url}`)
    })
    mainWindow.webContents.on('render-process-gone', (_event, details) => {
      console.error(`[renderer:gone] ${details.reason} ${details.exitCode}`)
    })
  }

  if (isSmokeMode) {
    const exitSmokeMode = () => {
      setTimeout(() => {
        app.exit(0)
      }, 250)
    }

    mainWindow.webContents.once('did-finish-load', () => {
      exitSmokeMode()
    })
    setTimeout(exitSmokeMode, 2000)
    return
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('close', () => {
    if (mainWindow) saveWindowState(mainWindow.getBounds())
  })
}

app.whenReady().then(() => {
  registerWorkspaceIpc(resolveDesktopWorkspaceFilePath())

  ipcMain.handle('app:get-shell-state', async () => {
    const providerState = getShellProviderState()
    const badges = await buildShellBadges(providerState)

    return {
      appName: 'Sentra Prompt Console',
      modelChip: providerState.modelChip,
      preferredModel: providerState.preferredModel,
      preferredProvider: providerState.preferredProvider,
      providerReadiness: providerState.providerReadiness,
      ...(providerState.optimizerLaneStates
        ? { optimizerLaneStates: providerState.optimizerLaneStates }
        : {}),
      ...(badges.length > 0 ? { badges } : {}),
    }
  })

  // Real process/OS numbers only — the HUD must never render invented telemetry.
  let lastCpuSample = process.cpuUsage()
  let lastCpuSampleAt = Date.now()

  ipcMain.handle('system:stats', () => {
    const memory = process.memoryUsage()
    const totalBytes = os.totalmem()

    // percentCPUUsage from Electron is cumulative since launch, so it flatlines while
    // idle; sample the delta instead to show what the shell is doing right now.
    const now = Date.now()
    const cpuDelta = process.cpuUsage(lastCpuSample)
    const elapsedMs = Math.max(1, now - lastCpuSampleAt)
    lastCpuSample = process.cpuUsage()
    lastCpuSampleAt = now

    return {
      heapMb: memory.heapUsed / 1024 / 1024,
      heapLimitMb: memory.heapTotal / 1024 / 1024,
      cpuPercent: Math.min(
        100,
        ((cpuDelta.user + cpuDelta.system) / 1000 / elapsedMs / os.cpus().length) * 100
      ),
      usedMemGb: (totalBytes - os.freemem()) / 1024 ** 3,
      totalMemGb: totalBytes / 1024 ** 3,
      uptimeSeconds: process.uptime(),
    }
  })

  ipcMain.on('window:close', () => {
    mainWindow?.close()
  })
  ipcMain.on('window:minimize', () => {
    mainWindow?.minimize()
  })
  ipcMain.handle('window:get-pos', () => mainWindow?.getPosition())
  // Renderer-measured character cell → window size in columns and rows. The minimum
  // (80 × 20) is applied on every launch; the target (120 × 30) only on the first launch
  // without persisted state, and it is persisted at once so later launches keep the user's
  // own size. Only the shell's own renderer may call this, and only with a sane cell.
  ipcMain.handle('window:fit-grid', (event, payload) => {
    if (!mainWindow || isSmokeMode || event.sender.id !== mainWindow.webContents.id) {
      return { applied: false, reason: 'rejected' }
    }
    const cell = parseGridCell(payload)
    if (!cell) {
      return { applied: false, reason: 'invalid-cell' }
    }
    const minimum = gridToContentSize(cell, GRID_MIN)
    mainWindow.setMinimumSize(minimum.width, minimum.height)
    if (windowStatePersisted || gridFitApplied) {
      return {
        applied: false,
        reason: windowStatePersisted ? 'persisted' : 'already-applied',
        minWidth: minimum.width,
        minHeight: minimum.height,
      }
    }
    const target = gridToContentSize(cell, GRID_TARGET)
    mainWindow.setContentSize(target.width, target.height)
    gridFitApplied = true
    saveWindowState(mainWindow.getBounds())
    return {
      applied: true,
      width: target.width,
      height: target.height,
      minWidth: minimum.width,
      minHeight: minimum.height,
    }
  })
  ipcMain.on('window:set-pos', (_event, { x, y }: { x: number; y: number }) => {
    mainWindow?.setPosition(Math.round(x), Math.round(y))
  })
  ipcMain.handle('desktop:toggle-mini', (_event, payload) => {
    if (!mainWindow || isSmokeMode) return
    const { mode } = payload as { mode?: 'expanded' | 'minimized' | 'normal' }
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenW, height: screenH } = primaryDisplay.workAreaSize
    const currentBounds = mainWindow.getBounds()

    if (mode === 'expanded') {
      const panelWidth = DEFAULT_WINDOW.width - 8
      const panelHeight = DEFAULT_WINDOW.height - 8
      // Keep current X/Y if valid, otherwise default to top-right
      const x =
        currentBounds.x >= 0 && currentBounds.x + panelWidth <= screenW
          ? currentBounds.x
          : screenW - panelWidth - 16
      const y =
        currentBounds.y >= 0 && currentBounds.y + panelHeight <= screenH ? currentBounds.y : 16
      mainWindow.setBounds({ x, y, width: panelWidth, height: panelHeight })
    } else {
      // Restore normal size, keep position
      mainWindow.setBounds({
        x: currentBounds.x,
        y: currentBounds.y,
        width: DEFAULT_WINDOW.width,
        height: DEFAULT_WINDOW.height,
      })
    }
  })

  registerAuthIpc()
  registerCoreIpc()
  appendDesktopEnvWarning()
  createWindow()
})
