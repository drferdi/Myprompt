import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import path from 'node:path'

import { app, ipcMain, type IpcMainInvokeEvent } from 'electron'

import { AppUserNotFoundError, UnauthorizedError } from '../../lib/auth/require-current-user'
import {
  checkAndTrackUsage,
  checkModelAccess,
  getUsageSummary,
  getUserTier,
} from '../../lib/billing/guard'
import { TIER_LABELS, TIER_LIMITS } from '../../lib/billing/plans'
import {
  DesktopTemplatesListPayloadSchema,
  type DesktopCommandEnvelope,
} from '../../lib/desktop/contracts'
import { resolveDesktopAppUser } from '../../lib/desktop/current-user'
import { loadDesktopSession } from '../../lib/desktop/session-store'
import { evaluatePrompt } from '../../lib/evaluator/engine'
import { getAvailableProviders } from '../../lib/llm/provider-registry'
import { resolveProviderApiKey } from '../../lib/llm/user-api-keys'
import { optimizePrompt, optimizePromptStreaming } from '../../lib/optimizer/engine'
import { transformPrompt } from '../../lib/transform/engine'
import { TransformRequestSchema } from '../../lib/transform/schemas'
import { EvaluateRequestSchema, OptimizeRequestSchema, type LLMProviderName } from '../../types'

import { listDesktopBenchmarks, runDesktopBenchmark, saveDesktopBenchmark } from './benchmark'
import { createDesktopPrompt, listDesktopPrompts, listDesktopTemplates } from './library'
import { handleProviderCommand } from './provider-keys'
import { handleSubscriptionCommand } from './subscription'
import { createWorkspaceStore } from './workspace-store'

type DesktopGuestProvider = Exclude<LLMProviderName, 'LOCAL'>
type DesktopOptimizeLane = 'INTERACTIVE' | 'DEEP'
type DesktopWorkspaceSourceMode = 'transform' | 'optimize' | 'evaluate'
type DesktopPayloadRecord = Record<string, unknown>
type DesktopEvaluateRequest = Parameters<typeof evaluatePrompt>[0]
type DesktopOptimizeStreamingRequest = Parameters<typeof optimizePromptStreaming>[0]
type DesktopOptimizeCommandPayload = Partial<Parameters<typeof optimizePrompt>[0]> &
  DesktopPayloadRecord
type DesktopEvaluateCommandPayload = Partial<Parameters<typeof evaluatePrompt>[0]> &
  DesktopPayloadRecord

function normalizeDesktopPayload(payload: unknown): DesktopPayloadRecord {
  if (typeof payload !== 'object' || payload === null) {
    return {}
  }

  return payload as DesktopPayloadRecord
}

function buildQuotaExceededResponse(error: string, quota: { used: number; limit: number }) {
  return {
    error,
    code: 'QUOTA_EXCEEDED',
    usage: { used: quota.used, limit: quota.limit, remaining: 0 },
    upgrade: { tier: 'PRO', url: '/settings?tab=subscription' },
  }
}

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

function resolveDesktopWorkspaceFilePath() {
  const baseDir =
    typeof app.getPath === 'function'
      ? app.getPath('userData')
      : path.join(resolveDesktopProjectDir(), '.desktop-runtime')

  return path.join(baseDir, 'sentra-desktop-workspace.json')
}

const desktopWorkspaceStore = createWorkspaceStore(resolveDesktopWorkspaceFilePath())

function buildModelRestrictedResponse() {
  return {
    error: 'Model ini tidak tersedia di tier Anda',
    code: 'MODEL_RESTRICTED',
    upgrade: { tier: 'PRO', url: '/settings?tab=subscription' },
  }
}

async function resolveDesktopAccessToken(accessToken?: string) {
  if (accessToken) {
    return accessToken
  }

  const session = await loadDesktopSession()
  return typeof session?.access_token === 'string' ? session.access_token : ''
}

async function resolveDesktopUser(accessToken?: string) {
  return resolveDesktopAppUser(await resolveDesktopAccessToken(accessToken))
}

async function tryResolveDesktopUser(accessToken?: string) {
  try {
    return await resolveDesktopUser(accessToken)
  } catch (error) {
    const errorName = error instanceof Error ? error.name : ''

    if (
      error instanceof UnauthorizedError ||
      error instanceof AppUserNotFoundError ||
      errorName === 'UnauthorizedError' ||
      errorName === 'AppUserNotFoundError'
    ) {
      return null
    }

    throw error
  }
}

function resolveGuestProvider(requestedProvider?: unknown): DesktopGuestProvider {
  const availableProviders = getAvailableProviders().filter(
    (provider): provider is DesktopGuestProvider => provider !== 'LOCAL'
  )

  const normalizedRequestedProvider =
    typeof requestedProvider === 'string'
      ? (requestedProvider.toUpperCase() as DesktopGuestProvider)
      : null

  if (normalizedRequestedProvider) {
    return normalizedRequestedProvider
  }

  if (availableProviders.includes('OPENAI')) {
    return 'OPENAI'
  }

  if (availableProviders.length > 0) {
    return availableProviders[0]
  }

  return normalizedRequestedProvider ?? 'GROK'
}

function buildGuestOptimizePayload(
  payload: DesktopOptimizeCommandPayload
): DesktopOptimizeStreamingRequest {
  const provider = resolveGuestProvider(payload?.provider ?? payload?.targetLlm)

  return OptimizeRequestSchema.parse({
    ...payload,
    provider,
    targetLlm: provider,
  })
}

function resolveOptimizeLane(payload: DesktopOptimizeCommandPayload): DesktopOptimizeLane {
  return payload?.optimizerLane === 'DEEP' ? 'DEEP' : 'INTERACTIVE'
}

function buildOptimizeStatusMessage(
  lane: DesktopOptimizeLane,
  stage: 'preparing' | 'waiting' | 'streaming'
) {
  if (stage === 'streaming') {
    return 'Streaming visible response...'
  }

  if (lane === 'DEEP') {
    return stage === 'preparing'
      ? 'Deep lane: preparing retrieval-aware prompt...'
      : 'Deep lane: matching guidance and waiting for first visible response...'
  }

  return stage === 'preparing'
    ? 'Interactive lane: preparing fast prompt...'
    : 'Interactive lane: waiting for first visible response...'
}

function buildGuestEvaluatePayload(payload: DesktopEvaluateCommandPayload): DesktopEvaluateRequest {
  const provider = resolveGuestProvider(payload?.provider)

  return EvaluateRequestSchema.parse({
    ...payload,
    provider,
  })
}

function resolveWorkspaceSourceMode(value: unknown): DesktopWorkspaceSourceMode {
  if (value === 'transform' || value === 'optimize' || value === 'evaluate') {
    return value
  }

  return 'optimize'
}

function buildDesktopCommandAccessError(command: string, error: unknown) {
  const errorName = error instanceof Error ? error.name : ''
  const errorMessage =
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
      ? (error as { message: string }).message
      : error instanceof Error
        ? error.message
        : ''

  if (error instanceof UnauthorizedError || errorName === 'UnauthorizedError') {
    if (command === 'optimize:run') {
      return new Error(
        'Optimizer memerlukan login desktop. Jalankan /auth login <email> <password> lalu coba lagi.'
      )
    }

    return new Error(
      'Perintah ini memerlukan login desktop. Jalankan /auth login <email> <password> lalu coba lagi.'
    )
  }

  if (error instanceof AppUserNotFoundError || errorName === 'AppUserNotFoundError') {
    return new Error(
      'Akun sudah terautentikasi, tetapi profil aplikasi belum tersedia. Selesaikan pendaftaran/login web sekali dulu, lalu coba lagi.'
    )
  }

  if (errorMessage.includes('No API key provided for')) {
    const providerMatch = errorMessage.match(/No API key provided for (\w+)/)
    const providerLabel = providerMatch?.[1] ?? 'provider ini'
    const envHintMap: Record<string, string> = {
      GROK: 'XAI_API_KEY',
      OPENAI: 'OPENAI_API_KEY',
      CLAUDE: 'ANTHROPIC_API_KEY',
      MISTRAL: 'MISTRAL_API_KEY',
      QWEN: 'QWEN_API_KEY',
    }
    const envKey = envHintMap[providerLabel] ?? 'provider env key'

    return new Error(
      `Provider ${providerLabel} diminta, tetapi ${envKey} tidak terdeteksi di runtime desktop. Set ${envKey} lalu jalankan ulang desktop shell.`
    )
  }

  return null
}

function buildDesktopStreamErrorMessage(command: string, error: unknown) {
  const accessError = buildDesktopCommandAccessError(command, error)

  if (accessError) {
    return accessError.message
  }

  if (error instanceof Error) {
    const normalized = error.message.trim()

    if (
      normalized &&
      !normalized.toLowerCase().includes('api key') &&
      !normalized.toLowerCase().includes('sk-')
    ) {
      return normalized
    }
  }

  return 'Optimizer gagal dijalankan. Periksa konfigurasi provider desktop lalu coba lagi.'
}

async function streamOptimizeCommand(
  event: IpcMainInvokeEvent,
  payload: unknown,
  accessToken: string | undefined,
  requestId: string
) {
  const optimizePayload = Object.fromEntries(
    Object.entries(normalizeDesktopPayload(payload)).filter(([key]) => key !== 'requestId')
  ) as DesktopOptimizeCommandPayload
  const optimizerLane = resolveOptimizeLane(optimizePayload)

  try {
    event.sender.send('optimize:status', {
      requestId,
      stage: 'preparing',
      message: buildOptimizeStatusMessage(optimizerLane, 'preparing'),
    })
    const user = await tryResolveDesktopUser(accessToken)

    let request: DesktopOptimizeStreamingRequest

    if (!user) {
      request = buildGuestOptimizePayload(optimizePayload)
    } else {
      const optimizeRequest = OptimizeRequestSchema.parse(optimizePayload)
      const tier = await getUserTier(user.id)
      const quota = await checkAndTrackUsage(user.id, 'OPTIMIZE', tier)

      if (!quota.allowed) {
        event.sender.send('optimize:error', {
          requestId,
          message: 'Batas optimisasi harian tercapai',
        })
        return
      }

      const modelId = String(optimizeRequest.targetLlm).toLowerCase()
      if (!checkModelAccess(tier, modelId)) {
        event.sender.send('optimize:error', {
          requestId,
          message: 'Model ini tidak tersedia di tier Anda',
        })
        return
      }

      const apiKey = await resolveProviderApiKey(user.id, optimizeRequest.provider)
      request = {
        ...optimizeRequest,
        apiKey,
      }
    }

    event.sender.send('optimize:status', {
      requestId,
      stage: 'waiting',
      message: buildOptimizeStatusMessage(optimizerLane, 'waiting'),
    })

    let didSendStreamingStatus = false
    const response = await optimizePromptStreaming(request, (delta) => {
      if (!didSendStreamingStatus && delta.trim().length > 0) {
        didSendStreamingStatus = true
        event.sender.send('optimize:status', {
          requestId,
          stage: 'streaming',
          message: buildOptimizeStatusMessage(optimizerLane, 'streaming'),
        })
      }
      event.sender.send('optimize:chunk', { requestId, delta })
    })

    event.sender.send('optimize:done', { requestId, response })
  } catch (error) {
    event.sender.send('optimize:error', {
      requestId,
      message: buildDesktopStreamErrorMessage('optimize:run', error),
    })
  }
}

export async function handleDesktopCommand(
  command: string,
  payload: unknown,
  accessToken?: string
) {
  const normalizedPayload = normalizeDesktopPayload(payload)

  try {
    if (command === 'transform:run') {
      return transformPrompt(TransformRequestSchema.parse(normalizedPayload))
    }

    if (command === 'optimize:run') {
      const user = await tryResolveDesktopUser(accessToken)

      if (!user) {
        return optimizePrompt(
          buildGuestOptimizePayload(normalizedPayload as DesktopOptimizeCommandPayload)
        )
      }

      const optimizeRequest = OptimizeRequestSchema.parse(normalizedPayload)
      const tier = await getUserTier(user.id)
      const quota = await checkAndTrackUsage(user.id, 'OPTIMIZE', tier)

      if (!quota.allowed) {
        return buildQuotaExceededResponse('Batas optimisasi harian tercapai', quota)
      }

      const modelId = String(optimizeRequest.targetLlm).toLowerCase()
      if (!checkModelAccess(tier, modelId)) {
        return buildModelRestrictedResponse()
      }

      const apiKey = await resolveProviderApiKey(user.id, optimizeRequest.provider)
      return optimizePrompt({
        ...optimizeRequest,
        apiKey,
      })
    }

    if (command === 'evaluate:run') {
      const user = await tryResolveDesktopUser(accessToken)

      if (!user) {
        return evaluatePrompt(
          buildGuestEvaluatePayload(normalizedPayload as DesktopEvaluateCommandPayload)
        )
      }

      const evaluateRequest = EvaluateRequestSchema.parse(normalizedPayload)
      const tier = await getUserTier(user.id)
      const quota = await checkAndTrackUsage(user.id, 'EVALUATE', tier)

      if (!quota.allowed) {
        return buildQuotaExceededResponse('Batas evaluasi harian tercapai', quota)
      }

      const apiKey = await resolveProviderApiKey(user.id, evaluateRequest.provider)
      return evaluatePrompt({
        ...evaluateRequest,
        apiKey,
      })
    }

    if (command === 'library:list') {
      const user = await resolveDesktopUser(accessToken)
      return listDesktopPrompts(user.id, normalizedPayload)
    }

    if (command === 'library:save') {
      const user = await resolveDesktopUser(accessToken)
      return createDesktopPrompt(user.id, normalizedPayload)
    }

    if (command === 'library:search') {
      const user = await resolveDesktopUser(accessToken)
      const search =
        typeof normalizedPayload.search === 'string'
          ? normalizedPayload.search
          : typeof normalizedPayload.text === 'string'
            ? normalizedPayload.text
            : ''

      return listDesktopPrompts(user.id, {
        ...normalizedPayload,
        search,
      })
    }

    if (command === 'draft:save') {
      const draft = await desktopWorkspaceStore.saveDraft({
        id:
          typeof normalizedPayload.id === 'string' && normalizedPayload.id.trim()
            ? normalizedPayload.id
            : randomUUID(),
        rawInput: typeof normalizedPayload.rawInput === 'string' ? normalizedPayload.rawInput : '',
        optimizedText:
          typeof normalizedPayload.optimizedText === 'string'
            ? normalizedPayload.optimizedText
            : typeof normalizedPayload.outputText === 'string'
              ? normalizedPayload.outputText
              : '',
        sourceMode: resolveWorkspaceSourceMode(normalizedPayload.sourceMode),
      })

      return { draft }
    }

    if (command === 'recent:list') {
      const recentRuns = await desktopWorkspaceStore.listRecentRuns()
      return { recentRuns }
    }

    if (command === 'benchmark:list') {
      return listDesktopBenchmarks(desktopWorkspaceStore)
    }

    if (command === 'benchmark:save') {
      return saveDesktopBenchmark(desktopWorkspaceStore, normalizedPayload)
    }

    if (command === 'benchmark:run') {
      const user = await tryResolveDesktopUser(accessToken)
      const provider = resolveGuestProvider(normalizedPayload.provider)
      const apiKey = user ? await resolveProviderApiKey(user.id, provider) : undefined

      return runDesktopBenchmark(desktopWorkspaceStore, normalizedPayload, {
        provider,
        apiKey,
      })
    }

    if (command === 'templates:list') {
      return listDesktopTemplates(
        DesktopTemplatesListPayloadSchema.parse(normalizedPayload).category
      )
    }

    if (command === 'usage:summary') {
      const user = await resolveDesktopUser(accessToken)
      const tier = await getUserTier(user.id)
      const usage = await getUsageSummary(user.id, tier)

      return {
        tier,
        tierLabel: TIER_LABELS[tier],
        limits: TIER_LIMITS[tier],
        usage,
      }
    }

    if (
      command === 'provider:list' ||
      command === 'provider:save' ||
      command === 'provider:delete'
    ) {
      const user = await resolveDesktopUser(accessToken)
      return handleProviderCommand(command, normalizedPayload, user.id)
    }

    if (command === 'subscription:upgrade') {
      const user = await resolveDesktopUser(accessToken)
      return handleSubscriptionCommand(normalizedPayload, user)
    }

    throw new Error(`Unknown desktop command: ${command}`)
  } catch (error) {
    const accessError = buildDesktopCommandAccessError(command, error)

    if (accessError) {
      throw accessError
    }

    throw error
  }
}

export function registerCoreIpc() {
  ipcMain.handle('desktop:command', async (event, envelope: DesktopCommandEnvelope) => {
    if (envelope.command === 'optimize:run') {
      const requestId =
        typeof envelope.payload === 'object' &&
        envelope.payload !== null &&
        'requestId' in envelope.payload &&
        typeof (envelope.payload as { requestId?: unknown }).requestId === 'string'
          ? (envelope.payload as { requestId: string }).requestId
          : randomUUID()

      void streamOptimizeCommand(event, envelope.payload, envelope.accessToken, requestId)

      return {
        status: 'started',
        requestId,
      }
    }

    return handleDesktopCommand(envelope.command, envelope.payload, envelope.accessToken)
  })
}
