import { consumeSharedRateLimit } from '@/lib/auth/shared-rate-limit'

interface RateLimitRule {
  limit: number
  windowMs: number
}

interface AuthAbuseResult {
  allowed: boolean
  retryAfterSeconds?: number
}

type AuthAction = 'REGISTER' | 'FORGOT_PASSWORD' | 'RESEND_VERIFICATION'

const RULES: Record<AuthAction, { ip: RateLimitRule; email: RateLimitRule }> = {
  REGISTER: {
    ip: { limit: 5, windowMs: 15 * 60_000 },
    email: { limit: 3, windowMs: 60 * 60_000 },
  },
  FORGOT_PASSWORD: {
    ip: { limit: 5, windowMs: 15 * 60_000 },
    email: { limit: 3, windowMs: 60 * 60_000 },
  },
  RESEND_VERIFICATION: {
    ip: { limit: 6, windowMs: 15 * 60_000 },
    email: { limit: 3, windowMs: 30 * 60_000 },
  },
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip')?.trim() ??
    'unknown'
  )
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function enforceAuthAbuseProtection(
  request: Request,
  action: AuthAction,
  email: string
): Promise<AuthAbuseResult> {
  const rules = RULES[action]

  const ipResult = await consumeSharedRateLimit({
    action: `${action}_IP`,
    scope: 'IP',
    rawKey: getClientIp(request),
    rule: rules.ip,
  })

  if (!ipResult.allowed) {
    return ipResult
  }

  return consumeSharedRateLimit({
    action: `${action}_EMAIL`,
    scope: 'EMAIL',
    rawKey: normalizeEmail(email),
    rule: rules.email,
  })
}

export function __resetAuthAbuseProtectionForTests() {
  // Legacy no-op retained for tests that only mock this module.
}
