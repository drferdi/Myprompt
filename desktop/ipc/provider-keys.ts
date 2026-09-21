import {
  deleteUserProviderKey,
  listProviderKeyStates,
  upsertUserProviderKey,
} from '../../lib/llm/user-api-keys'
import type { LLMProviderName } from '../../types'

type DesktopProviderCommandPayload = {
  provider?: LLMProviderName
  apiKey?: string
}

function requireProvider(
  payload: DesktopProviderCommandPayload
): Exclude<LLMProviderName, 'LOCAL'> {
  if (typeof payload.provider !== 'string' || payload.provider === 'LOCAL') {
    throw new Error('Provider is required.')
  }

  return payload.provider
}

export async function handleProviderCommand(
  command: string,
  payload: DesktopProviderCommandPayload,
  userId: string
) {
  if (command === 'provider:list') {
    return { providers: await listProviderKeyStates(userId) }
  }

  if (command === 'provider:save') {
    if (typeof payload.apiKey !== 'string' || payload.apiKey.trim().length === 0) {
      throw new Error('Provider API key is required.')
    }

    await upsertUserProviderKey(userId, requireProvider(payload), payload.apiKey)
    return { providers: await listProviderKeyStates(userId) }
  }

  if (command === 'provider:delete') {
    await deleteUserProviderKey(userId, requireProvider(payload))
    return { providers: await listProviderKeyStates(userId) }
  }

  throw new Error(`Unknown provider command: ${command}`)
}
