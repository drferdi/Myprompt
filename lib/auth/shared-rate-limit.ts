import { createHash } from 'crypto'

import { Prisma, type RateLimitScope } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'

type SharedRateLimitAction =
  | 'REGISTER_IP'
  | 'REGISTER_EMAIL'
  | 'FORGOT_PASSWORD_IP'
  | 'FORGOT_PASSWORD_EMAIL'
  | 'RESEND_VERIFICATION_IP'
  | 'RESEND_VERIFICATION_EMAIL'

interface SharedRateLimitRule {
  limit: number
  windowMs: number
}

export interface SharedRateLimitResult {
  allowed: boolean
  retryAfterSeconds?: number
}

function getWindowStart(now: Date, windowMs: number): Date {
  const bucketStart = Math.floor(now.getTime() / windowMs) * windowMs
  return new Date(bucketStart)
}

function getWindowEnd(windowStart: Date, windowMs: number): Date {
  return new Date(windowStart.getTime() + windowMs)
}

function hashKey(rawKey: string): string {
  return createHash('sha256').update(rawKey, 'utf8').digest('hex')
}

async function maybePruneExpiredCounters(now: Date) {
  if (Math.random() > 0.02) {
    return
  }

  const cutoff = new Date(now.getTime() - 24 * 60 * 60_000)
  await prisma.rateLimitCounter.deleteMany({
    where: {
      windowEnd: {
        lt: cutoff,
      },
    },
  })
}

export async function consumeSharedRateLimit(params: {
  action: SharedRateLimitAction
  scope: RateLimitScope
  rawKey: string
  rule: SharedRateLimitRule
  now?: Date
}): Promise<SharedRateLimitResult> {
  const now = params.now ?? new Date()
  const windowStart = getWindowStart(now, params.rule.windowMs)
  const windowEnd = getWindowEnd(windowStart, params.rule.windowMs)
  const keyHash = hashKey(params.rawKey)

  await maybePruneExpiredCounters(now)

  const existing = await prisma.rateLimitCounter.findUnique({
    where: {
      action_scope_keyHash_windowStart: {
        action: params.action,
        scope: params.scope,
        keyHash,
        windowStart,
      },
    },
    select: {
      id: true,
      count: true,
      windowEnd: true,
    },
  })

  if (!existing) {
    try {
      await prisma.rateLimitCounter.create({
        data: {
          action: params.action,
          scope: params.scope,
          keyHash,
          windowStart,
          windowEnd,
          count: 1,
        },
      })

      return { allowed: true }
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
        throw error
      }

      return consumeSharedRateLimit(params)
    }
  }

  if (existing.count >= params.rule.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.windowEnd.getTime() - now.getTime()) / 1000)
      ),
    }
  }

  await prisma.rateLimitCounter.update({
    where: { id: existing.id },
    data: {
      count: {
        increment: 1,
      },
    },
  })

  return { allowed: true }
}
