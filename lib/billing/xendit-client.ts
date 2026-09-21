// Drferdi CTE V2 — Xendit Payment Gateway Client

import { timingSafeEqual } from 'crypto'

const XENDIT_API_URL = 'https://api.xendit.co'

interface XenditInvoiceRequest {
  external_id: string
  amount: number
  description: string
  customer: {
    given_names: string
    email: string
  }
  currency: string
  invoice_duration: number // seconds
  success_redirect_url: string
  failure_redirect_url: string
  payment_methods?: string[]
}

interface XenditInvoiceResponse {
  id: string
  external_id: string
  user_id: string
  status: string
  amount: number
  invoice_url: string
  expiry_date: string
}

function getSecretKey(): string {
  const key = process.env.XENDIT_SECRET_KEY
  if (!key) throw new Error('Missing XENDIT_SECRET_KEY environment variable')
  return key
}

function getCallbackToken(): string {
  const token = process.env.XENDIT_CALLBACK_TOKEN
  if (!token) throw new Error('Missing XENDIT_CALLBACK_TOKEN environment variable')
  return token
}

/**
 * Verify that a webhook request is from Xendit.
 */
export function verifyWebhookToken(token: string): boolean {
  const expected = getCallbackToken()
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  } catch {
    return false
  }
}

/**
 * Create a Xendit invoice for subscription payment.
 */
export async function createInvoice(params: XenditInvoiceRequest): Promise<XenditInvoiceResponse> {
  const secretKey = getSecretKey()
  const auth = Buffer.from(`${secretKey}:`).toString('base64')

  const response = await fetch(`${XENDIT_API_URL}/v2/invoices`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Xendit invoice creation failed: ${JSON.stringify(error)}`)
  }

  return response.json()
}

/**
 * Get invoice status from Xendit.
 */
export async function getInvoice(invoiceId: string): Promise<XenditInvoiceResponse> {
  const secretKey = getSecretKey()
  const auth = Buffer.from(`${secretKey}:`).toString('base64')

  const response = await fetch(`${XENDIT_API_URL}/v2/invoices/${invoiceId}`, {
    headers: { Authorization: `Basic ${auth}` },
  })

  if (!response.ok) {
    throw new Error(`Xendit get invoice failed: ${response.statusText}`)
  }

  return response.json()
}
