// Drferdi Transformer Engine V2 — Structured Logger
// Wraps error logging with context for observability.
// When Sentry is configured, errors are captured there;
// otherwise falls back to structured console output.

import * as Sentry from '@sentry/nextjs'

interface LogContext {
  route: string
  [key: string]: unknown
}

function formatError(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack }
  }
  return { message: String(error) }
}

export const logger = {
  error(context: LogContext, error: unknown) {
    const { message, stack } = formatError(error)
    const entry = {
      level: 'error',
      ...context,
      message,
      timestamp: new Date().toISOString(),
    }

    // Sentry integration — active when DSN is configured
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, { tags: { route: context.route } })
    }

    // Structured console output (server-side only, never exposed to client)
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context.route}]`, message, stack)
    } else {
      console.error(JSON.stringify(entry))
    }
  },

  warn(context: LogContext, message: string) {
    const entry = {
      level: 'warn',
      ...context,
      message,
      timestamp: new Date().toISOString(),
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn(`[${context.route}]`, message)
    } else {
      console.warn(JSON.stringify(entry))
    }
  },
}
