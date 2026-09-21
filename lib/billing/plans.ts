// Drferdi CTE V2 — Subscription Tier Definitions & Limits

import type { SubscriptionTier, UsageType } from '@prisma/client'

export interface TierLimits {
  transformsPerDay: number // -1 = unlimited
  optimizationsPerDay: number
  evaluationsPerDay: number
  recommendsPerDay: number
  cloudHistory: boolean
  customPresets: number
  availableModels: string[] // model IDs or ["*"] for all
  apiAccess: boolean
  maxTeamMembers: number
}

export interface TierPricing {
  monthly: number // IDR
  annual: number // IDR
  trialDays: number
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  GRATIS: {
    transformsPerDay: 20,
    optimizationsPerDay: 3,
    evaluationsPerDay: 3,
    recommendsPerDay: 3,
    cloudHistory: false,
    customPresets: 0,
    availableModels: ['openai-gpt4o', 'claude-sonnet'],
    apiAccess: false,
    maxTeamMembers: 1,
  },
  PRO: {
    transformsPerDay: -1,
    optimizationsPerDay: 50,
    evaluationsPerDay: 30,
    recommendsPerDay: 20,
    cloudHistory: true,
    customPresets: 20,
    availableModels: ['*'],
    apiAccess: false,
    maxTeamMembers: 1,
  },
  TIM: {
    transformsPerDay: -1,
    optimizationsPerDay: 200,
    evaluationsPerDay: 100,
    recommendsPerDay: 50,
    cloudHistory: true,
    customPresets: 100,
    availableModels: ['*'],
    apiAccess: false,
    maxTeamMembers: 10,
  },
  ENTERPRISE: {
    transformsPerDay: -1,
    optimizationsPerDay: -1,
    evaluationsPerDay: -1,
    recommendsPerDay: -1,
    cloudHistory: true,
    customPresets: -1,
    availableModels: ['*'],
    apiAccess: true,
    maxTeamMembers: 100,
  },
}

export const TIER_PRICING: Record<Exclude<SubscriptionTier, 'GRATIS'>, TierPricing> = {
  PRO: {
    monthly: 49_000,
    annual: 399_000,
    trialDays: 7,
  },
  TIM: {
    monthly: 149_000,
    annual: 1_249_000,
    trialDays: 14,
  },
  ENTERPRISE: {
    monthly: 0, // Custom pricing
    annual: 0,
    trialDays: 30,
  },
}

export const TIER_LABELS: Record<SubscriptionTier, string> = {
  GRATIS: 'Gratis',
  PRO: 'Pro',
  TIM: 'Tim',
  ENTERPRISE: 'Enterprise',
}

export const USAGE_TYPE_LIMIT_KEY: Record<UsageType, keyof TierLimits> = {
  TRANSFORM: 'transformsPerDay',
  OPTIMIZE: 'optimizationsPerDay',
  EVALUATE: 'evaluationsPerDay',
  RECOMMEND: 'recommendsPerDay',
}

export function getLimit(tier: SubscriptionTier, usageType: UsageType): number {
  const limits = TIER_LIMITS[tier]
  const key = USAGE_TYPE_LIMIT_KEY[usageType]
  return limits[key] as number
}

export function isModelAvailable(tier: SubscriptionTier, modelId: string): boolean {
  const models = TIER_LIMITS[tier].availableModels
  return models.includes('*') || models.includes(modelId)
}
