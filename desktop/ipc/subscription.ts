import type { BillingInterval, SubscriptionTier, User } from '@prisma/client'

import { createSubscriptionInvoice } from '../../lib/billing/subscription-service'

type DesktopSubscriptionUser = Pick<User, 'id' | 'email' | 'name'>
type DesktopSubscriptionPayload = {
  tier?: Exclude<SubscriptionTier, 'GRATIS'>
  interval?: BillingInterval
}

export async function handleSubscriptionCommand(
  payload: DesktopSubscriptionPayload,
  user: DesktopSubscriptionUser
) {
  if (!payload.tier || !payload.interval) {
    throw new Error('Subscription tier and interval are required.')
  }

  return createSubscriptionInvoice({
    userId: user.id,
    email: user.email,
    name: user.name ?? 'User',
    tier: payload.tier,
    interval: payload.interval,
  })
}
