import type { LLMProviderName } from '@/types'

export type DesktopRemoteProvider = Exclude<LLMProviderName, 'LOCAL'>

export type ProviderReadiness =
  | {
      status: 'ready'
      availableProviders: DesktopRemoteProvider[]
      activeProvider: DesktopRemoteProvider
    }
  | {
      status: 'missing'
      availableProviders: DesktopRemoteProvider[]
      activeProvider: null
    }

export type GuestProviderResolution =
  | {
      status: 'ready'
      provider: DesktopRemoteProvider
      usedFallback: boolean
    }
  | {
      status: 'missing'
      provider: null
      usedFallback: false
    }

function normalizeRequestedProvider(value: unknown): DesktopRemoteProvider | null {
  if (typeof value !== 'string') {
    return null
  }

  const provider = value.trim().toUpperCase()
  return provider && provider !== 'LOCAL' ? (provider as DesktopRemoteProvider) : null
}

function normalizeAvailableProviders(
  providers: readonly LLMProviderName[]
): DesktopRemoteProvider[] {
  return [...new Set(providers.filter((provider) => provider !== 'LOCAL'))]
}

export function resolveGuestProvider(
  requestedProvider: unknown,
  availableProviders: readonly LLMProviderName[]
): GuestProviderResolution {
  const available = normalizeAvailableProviders(availableProviders)
  const requested = normalizeRequestedProvider(requestedProvider)

  if (requested && available.includes(requested)) {
    return { status: 'ready', provider: requested, usedFallback: false }
  }

  const fallback = available.includes('OPENAI') ? 'OPENAI' : available[0]
  if (!fallback) {
    return { status: 'missing', provider: null, usedFallback: false }
  }

  return {
    status: 'ready',
    provider: fallback,
    usedFallback: Boolean(requested && requested !== fallback),
  }
}

export function createProviderReadiness(
  availableProviders: readonly LLMProviderName[],
  requestedProvider?: unknown
): ProviderReadiness {
  const available = normalizeAvailableProviders(availableProviders)
  const resolution = resolveGuestProvider(requestedProvider, available)

  if (resolution.status === 'missing') {
    return {
      status: 'missing',
      availableProviders: available,
      activeProvider: null,
    }
  }

  return {
    status: 'ready',
    availableProviders: available,
    activeProvider: resolution.provider,
  }
}
