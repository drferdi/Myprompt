// Drferdi CTE V2 — Usage Quota & Feature Gate Enforcement

import type { SubscriptionTier, UsageType } from '@prisma/client'

import { getLimit, isModelAvailable } from './plans'

import { prisma } from '@/lib/db/prisma'

interface QuotaResult {
  allowed: boolean
  used: number
  limit: number
  remaining: number
}

/**
 * Check if a user has remaining quota for a given usage type.
 * Returns { allowed, used, limit, remaining }.
 * Limit of -1 means unlimited.
 */
export async function checkUsageQuota(
  userId: string,
  type: UsageType,
  tier: SubscriptionTier
): Promise<QuotaResult> {
  const limit = getLimit(tier, type)

  // Unlimited
  if (limit === -1) {
    return { allowed: true, used: 0, limit: -1, remaining: -1 }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const record = await prisma.usageRecord.findUnique({
    where: {
      userId_type_date: { userId, type, date: today },
    },
  })

  const used = record?.count ?? 0
  const remaining = Math.max(0, limit - used)

  return {
    allowed: used < limit,
    used,
    limit,
    remaining,
  }
}

/**
 * Atomically check quota AND increment usage in a single transaction.
 * Prevents race condition where two concurrent requests both pass the check.
 * Returns the quota result AFTER incrementing.
 */
export async function checkAndTrackUsage(
  userId: string,
  type: UsageType,
  tier: SubscriptionTier
): Promise<QuotaResult> {
  const limit = getLimit(tier, type)

  if (limit === -1) {
    // Unlimited — still track for analytics
    await trackUsage(userId, type)
    return { allowed: true, used: 0, limit: -1, remaining: -1 }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Atomic upsert + check in one operation
  const record = await prisma.usageRecord.upsert({
    where: {
      userId_type_date: { userId, type, date: today },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId,
      type,
      date: today,
      count: 1,
    },
  })

  // count is AFTER increment, so check if it exceeded limit
  const allowed = record.count <= limit
  const used = record.count
  const remaining = Math.max(0, limit - used)

  return { allowed, used, limit, remaining }
}

/**
 * Increment usage count for a user. Uses upsert for atomic daily tracking.
 */
export async function trackUsage(userId: string, type: UsageType): Promise<void> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.usageRecord.upsert({
    where: {
      userId_type_date: { userId, type, date: today },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId,
      type,
      date: today,
      count: 1,
    },
  })
}

/**
 * Check if a model is available for the user's tier.
 */
export function checkModelAccess(tier: SubscriptionTier, modelId: string): boolean {
  return isModelAvailable(tier, modelId)
}

/**
 * Get user's current tier from Prisma. Falls back to GRATIS.
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { tier: true, status: true },
  })

  if (!subscription || subscription.status !== 'ACTIVE') {
    return 'GRATIS'
  }

  return subscription.tier
}

/**
 * Get usage summary for a user (all types for today).
 */
export async function getUsageSummary(
  userId: string,
  tier: SubscriptionTier
): Promise<Record<UsageType, QuotaResult>> {
  const types: UsageType[] = ['TRANSFORM', 'OPTIMIZE', 'EVALUATE', 'RECOMMEND']
  const results = await Promise.all(
    types.map(async (type) => {
      const quota = await checkUsageQuota(userId, type, tier)
      return [type, quota] as const
    })
  )
  return Object.fromEntries(results) as Record<UsageType, QuotaResult>
}
