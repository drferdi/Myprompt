// Drferdi CTE V2 — Subscription Management Service

import type { SubscriptionTier, BillingInterval } from '@prisma/client'

import { TIER_PRICING } from './plans'
import { createInvoice } from './xendit-client'

import { prisma } from '@/lib/db/prisma'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

/**
 * Create a Xendit invoice for upgrading to a paid tier.
 * Returns the invoice URL for the user to complete payment.
 */
export async function createSubscriptionInvoice(params: {
  userId: string
  email: string
  name: string
  tier: Exclude<SubscriptionTier, 'GRATIS'>
  interval: BillingInterval
}): Promise<{ invoiceUrl: string; paymentId: string }> {
  const { userId, email, name, tier, interval } = params
  const pricing = TIER_PRICING[tier]
  const amount = interval === 'MONTHLY' ? pricing.monthly : pricing.annual
  const periodLabel = interval === 'MONTHLY' ? 'Bulanan' : 'Tahunan'

  const invoiceNumber = `CTE-${tier}-${Date.now()}`

  const invoice = await createInvoice({
    external_id: invoiceNumber,
    amount,
    description: `Drferdi CTE ${tier} — ${periodLabel}`,
    customer: {
      given_names: name || 'User',
      email,
    },
    currency: 'IDR',
    invoice_duration: 86400, // 24 hours
    success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=subscription&status=success`,
    failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=subscription&status=failed`,
    payment_methods: [
      'CREDIT_CARD',
      'BCA',
      'BNI',
      'BSI',
      'BRI',
      'MANDIRI',
      'PERMATA',
      'OVO',
      'DANA',
      'SHOPEEPAY',
      'LINKAJA',
      'QRIS',
    ],
  })

  // Create pending payment record with requested tier+interval for webhook lookup
  const subscription = await prisma.subscription.findUnique({ where: { userId } })
  if (!subscription) {
    throw new Error('Subscription record not found. Please re-login.')
  }

  await prisma.payment.create({
    data: {
      subscriptionId: subscription.id,
      amount,
      currency: 'IDR',
      status: 'PENDING',
      gatewayPaymentId: invoice.id,
      invoiceNumber,
      gatewayResponse: { requestedTier: tier, requestedInterval: interval },
    },
  })

  return {
    invoiceUrl: invoice.invoice_url,
    paymentId: invoice.id,
  }
}

/**
 * Activate a subscription after successful payment.
 * Called from webhook handler.
 */
export async function activateSubscription(params: {
  gatewayPaymentId: string
  paymentMethod: string
  paidAmount: number
}): Promise<void> {
  const { gatewayPaymentId, paymentMethod, paidAmount } = params

  // Find the payment record
  const payment = await prisma.payment.findUnique({
    where: { gatewayPaymentId },
    include: { subscription: { include: { user: true } } },
  })

  if (!payment) {
    throw new Error(`Payment not found: ${gatewayPaymentId}`)
  }

  if (payment.status === 'PAID') {
    return
  }

  // Retrieve requested tier+interval stored at invoice creation time
  const meta = payment.gatewayResponse as {
    requestedTier?: string
    requestedInterval?: string
  } | null
  const tier = (meta?.requestedTier as SubscriptionTier) ?? 'PRO'
  const interval = (meta?.requestedInterval as BillingInterval) ?? 'MONTHLY'

  const now = new Date()
  const periodEnd = new Date(now)
  if (interval === 'MONTHLY') {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  }

  // Map Xendit payment method/channel to our enum
  const methodMap: Record<string, string> = {
    CREDIT_CARD: 'CREDIT_CARD',
    BANK_TRANSFER: 'BANK_TRANSFER',
    BCA: 'BANK_TRANSFER',
    BNI: 'BANK_TRANSFER',
    BRI: 'BANK_TRANSFER',
    BSI: 'BANK_TRANSFER',
    MANDIRI: 'BANK_TRANSFER',
    PERMATA: 'BANK_TRANSFER',
    OVO: 'EWALLET_OVO',
    DANA: 'EWALLET_DANA',
    SHOPEEPAY: 'EWALLET_SHOPEEPAY',
    LINKAJA: 'EWALLET_GOPAY',
    GOPAY: 'EWALLET_GOPAY',
    QRIS: 'QRIS',
  }

  // Update payment record
  await prisma.payment.update({
    where: { gatewayPaymentId },
    data: {
      status: 'PAID',
      method: (methodMap[paymentMethod] ?? 'CREDIT_CARD') as never,
      paidAt: now,
      gatewayResponse: {
        ...(meta ?? {}),
        paymentMethod,
        paidAmount,
        activatedAt: now.toISOString(),
      } as never,
    },
  })

  // Update subscription
  await prisma.subscription.update({
    where: { id: payment.subscriptionId },
    data: {
      tier,
      status: 'ACTIVE',
      billingInterval: interval,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  })

  // Update Supabase app_metadata for JWT-based tier checks
  const admin = createSupabaseAdminClient()
  await admin.auth.admin.updateUserById(payment.subscription.user.supabaseId, {
    app_metadata: { tier },
  })
}

/**
 * Handle expired/failed payment from webhook.
 */
export async function handlePaymentFailed(
  gatewayPaymentId: string,
  status: 'FAILED' | 'EXPIRED'
): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { gatewayPaymentId },
  })

  if (!payment) {
    throw new Error(`Payment not found: ${gatewayPaymentId}`)
  }

  if (payment.status === status) {
    return
  }

  await prisma.payment.update({
    where: { gatewayPaymentId },
    data: {
      status,
      failedAt: new Date(),
    },
  })
}

/**
 * Cancel a subscription. Tier reverts to GRATIS at period end.
 */
export async function cancelSubscription(userId: string): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { user: true },
  })

  if (!subscription) return

  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
    },
  })
}

/**
 * Downgrade expired subscriptions to GRATIS. Run via cron.
 */
export async function processExpiredSubscriptions(): Promise<number> {
  const now = new Date()

  const expired = await prisma.subscription.findMany({
    where: {
      status: { in: ['CANCELED', 'PAST_DUE'] },
      currentPeriodEnd: { lt: now },
    },
    include: { user: true },
  })

  const admin = createSupabaseAdminClient()

  for (const sub of expired) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { tier: 'GRATIS', status: 'EXPIRED' },
    })

    await admin.auth.admin.updateUserById(sub.user.supabaseId, {
      app_metadata: { tier: 'GRATIS' },
    })
  }

  return expired.length
}
