import { describe, expect, it } from 'vitest'

import { collectProviderStream } from '../../../lib/optimizer/provider-stream'

describe('provider stream boundary', () => {
  it('collects chunks from a provider stream and forwards each chunk', async () => {
    const received: string[] = []
    const provider = {
      async *generateStream() {
        yield 'first '
        yield 'second'
      },
    }

    await expect(
      collectProviderStream(provider, { model: 'test', messages: [], maxTokens: 100 }, (chunk) => {
        received.push(chunk)
      })
    ).resolves.toBe('first second')
    expect(received).toEqual(['first ', 'second'])
  })

  it('preserves a provider stream failure for safe IPC classification', async () => {
    const provider = {
      async *generateStream() {
        throw new TypeError('fetch failed')
      },
    }

    await expect(
      collectProviderStream(provider, { model: 'test', messages: [], maxTokens: 100 }, () => undefined)
    ).rejects.toThrow('fetch failed')
  })
})
