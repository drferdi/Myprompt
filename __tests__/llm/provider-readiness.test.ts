import { describe, expect, it } from 'vitest'

import {
  createProviderReadiness,
  resolveGuestProvider,
} from '../../lib/llm/provider-readiness'

describe('desktop provider readiness', () => {
  it('falls back from a stale GROK request to the configured OpenAI provider', () => {
    expect(resolveGuestProvider('GROK', ['OPENAI'])).toEqual({
      status: 'ready',
      provider: 'OPENAI',
      usedFallback: true,
    })
  })

  it('keeps an explicitly requested provider when that provider is available', () => {
    expect(resolveGuestProvider('CLAUDE', ['OPENAI', 'CLAUDE'])).toEqual({
      status: 'ready',
      provider: 'CLAUDE',
      usedFallback: false,
    })
  })

  it('fails closed when no remote provider is configured', () => {
    expect(resolveGuestProvider('OPENAI', [])).toEqual({
      status: 'missing',
      provider: null,
      usedFallback: false,
    })
  })

  it('exposes only safe provider readiness metadata to the renderer', () => {
    expect(createProviderReadiness(['OPENAI'], 'OPENAI')).toEqual({
      status: 'ready',
      availableProviders: ['OPENAI'],
      activeProvider: 'OPENAI',
    })
  })
})
