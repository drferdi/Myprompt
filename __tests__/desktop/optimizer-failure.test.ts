import { describe, expect, it } from 'vitest'

import { classifyOptimizerFailure } from '../../desktop/ipc/optimizer-failure'

describe('optimizer IPC failure contract', () => {
  it('classifies provider authentication failures without returning the provider message', () => {
    const failure = classifyOptimizerFailure(new Error('401 invalid api key sk-secret-value'))

    expect(failure).toEqual({
      code: 'PROVIDER_AUTH',
      stage: 'stream',
      retryable: false,
      publicMessage: 'Provider authentication failed. Update the configured provider key and retry.',
    })
    expect(JSON.stringify(failure)).not.toContain('sk-secret-value')
  })

  it('classifies retryable failures thrown by a provider stream', () => {
    expect(classifyOptimizerFailure(new TypeError('fetch failed'))).toEqual({
      code: 'NETWORK',
      stage: 'stream',
      retryable: true,
      publicMessage: 'Provider network request failed. Check connectivity and retry.',
    })

    expect(classifyOptimizerFailure(new Error('request timed out'))).toMatchObject({
      code: 'TIMEOUT',
      stage: 'stream',
      retryable: true,
    })
  })
})
