import type { LLMProvider } from '@prisma/client'

import { decrypt, encrypt } from '@/lib/crypto'
import { prisma } from '@/lib/db/prisma'
import type { LLMProviderName, ProviderKeySource, ProviderKeyStatus } from '@/types'

const PROVIDERS: LLMProviderName[] = ['CLAUDE', 'OPENAI', 'MISTRAL', 'QWEN', 'GROK', 'LOCAL']

const envKeyMap: Record<LLMProviderName, string | null> = {
  CLAUDE: 'ANTHROPIC_API_KEY',
  OPENAI: 'OPENAI_API_KEY',
  MISTRAL: 'MISTRAL_API_KEY',
  QWEN: 'QWEN_API_KEY',
  GROK: 'XAI_API_KEY',
  LOCAL: null,
}

export class MissingProviderApiKeyError extends Error {
  readonly provider: LLMProviderName

  constructor(provider: LLMProviderName) {
    super(`No API key configured for ${provider}`)
    this.name = 'MissingProviderApiKeyError'
    this.provider = provider
  }
}

function getEnvApiKey(provider: LLMProviderName): string | null {
  const envKey = envKeyMap[provider]
  if (!envKey) {
    return null
  }

  const value = process.env[envKey]?.trim()
  return value ? value : null
}

function toPrismaProvider(provider: Exclude<LLMProviderName, 'LOCAL'>): LLMProvider {
  return provider as LLMProvider
}

export async function listProviderKeyStates(userId: string): Promise<ProviderKeyStatus[]> {
  const userKeys = await prisma.userApiKey.findMany({
    where: { userId },
    select: { provider: true },
  })

  const userConfiguredProviders = new Set(userKeys.map((entry) => entry.provider))

  return PROVIDERS.map((provider) => {
    let source: ProviderKeySource = 'NONE'

    if (provider === 'LOCAL') {
      source = 'LOCAL'
    } else if (userConfiguredProviders.has(provider)) {
      source = 'USER'
    } else if (getEnvApiKey(provider)) {
      source = 'ENV'
    }

    return {
      provider,
      hasKey: source !== 'NONE',
      source,
    }
  })
}

export async function upsertUserProviderKey(
  userId: string,
  provider: Exclude<LLMProviderName, 'LOCAL'>,
  apiKey: string
): Promise<void> {
  const encryptedKey = encrypt(apiKey)

  await prisma.userApiKey.upsert({
    where: {
      userId_provider: {
        userId,
        provider: toPrismaProvider(provider),
      },
    },
    create: {
      userId,
      provider: toPrismaProvider(provider),
      encryptedKey: encryptedKey.encrypted,
      iv: encryptedKey.iv,
      authTag: encryptedKey.authTag,
    },
    update: {
      encryptedKey: encryptedKey.encrypted,
      iv: encryptedKey.iv,
      authTag: encryptedKey.authTag,
    },
  })
}

export async function deleteUserProviderKey(
  userId: string,
  provider: Exclude<LLMProviderName, 'LOCAL'>
): Promise<void> {
  await prisma.userApiKey.deleteMany({
    where: {
      userId,
      provider: toPrismaProvider(provider),
    },
  })
}

export async function resolveProviderApiKey(
  userId: string,
  provider: LLMProviderName
): Promise<string | undefined> {
  if (provider === 'LOCAL') {
    return undefined
  }

  const storedKey = await prisma.userApiKey.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: toPrismaProvider(provider),
      },
    },
    select: {
      encryptedKey: true,
      iv: true,
      authTag: true,
    },
  })

  if (storedKey) {
    return decrypt(storedKey.encryptedKey, storedKey.iv, storedKey.authTag)
  }

  const envKey = getEnvApiKey(provider)
  if (envKey) {
    return envKey
  }

  throw new MissingProviderApiKeyError(provider)
}
