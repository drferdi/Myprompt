export type OptimizerFailureCode =
  | 'PROVIDER_AUTH'
  | 'RATE_LIMIT'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'UPSTREAM'
  | 'UNKNOWN'
  | 'QUOTA_EXCEEDED'
  | 'MODEL_ACCESS'

export interface OptimizerFailure {
  code: OptimizerFailureCode
  stage: 'prepare' | 'stream'
  retryable: boolean
  publicMessage: string
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message.toLowerCase() : ''
}

export function classifyOptimizerFailure(
  error: unknown,
  stage: OptimizerFailure['stage'] = 'stream'
): OptimizerFailure {
  const message = errorMessage(error)

  if (/401|403|invalid api key|authentication/.test(message)) {
    return {
      code: 'PROVIDER_AUTH',
      stage,
      retryable: false,
      publicMessage: 'Provider authentication failed. Update the configured provider key and retry.',
    }
  }

  if (/429|rate limit/.test(message)) {
    return {
      code: 'RATE_LIMIT',
      stage,
      retryable: true,
      publicMessage: 'Provider rate limit reached. Retry shortly.',
    }
  }

  if (/timeout|timed out|abort/.test(message)) {
    return {
      code: 'TIMEOUT',
      stage,
      retryable: true,
      publicMessage: 'Provider request timed out. Retry the request.',
    }
  }

  if (/fetch failed|network|econn/.test(message)) {
    return {
      code: 'NETWORK',
      stage,
      retryable: true,
      publicMessage: 'Provider network request failed. Check connectivity and retry.',
    }
  }

  return {
    code: 'UNKNOWN',
    stage,
    retryable: false,
    publicMessage: 'Optimizer could not complete the request. Review the desktop diagnostics and retry.',
  }
}

export const quotaExceededFailure: OptimizerFailure = {
  code: 'QUOTA_EXCEEDED',
  stage: 'prepare',
  retryable: false,
  publicMessage: 'Daily optimization limit reached.',
}

export const modelAccessFailure: OptimizerFailure = {
  code: 'MODEL_ACCESS',
  stage: 'prepare',
  retryable: false,
  publicMessage: 'The selected model is not available for this account tier.',
}
