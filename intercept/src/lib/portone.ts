// PortOne V2 server-side helper — REST API (fetch only, no axios)
// 환경변수: PORTONE_TEST_SECRET_KEY

const PORTONE_API_BASE = 'https://api.portone.io'

export type PortOnePayment = {
  id: string
  status: string
  amount: {
    total: number
    currency: string
  }
  customData?: unknown
}

export async function verifyPayment(paymentId: string): Promise<PortOnePayment> {
  const secretKey = process.env.PORTONE_TEST_SECRET_KEY
  if (!secretKey) {
    throw new Error('PORTONE_TEST_SECRET_KEY is not set')
  }

  const response = await fetch(`${PORTONE_API_BASE}/payments/${encodeURIComponent(paymentId)}`, {
    method: 'GET',
    headers: {
      Authorization: `PortOne ${secretKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`PortOne payment verification failed (${paymentId}): ${await response.text()}`)
  }

  return response.json() as Promise<PortOnePayment>
}

export type PortOneWebhookPayload = {
  type: string
  timestamp: string
  data: {
    paymentId?: string
    transactionId?: string
  }
}

export async function verifyWebhookSignature(
  body: string,
  webhookId: string,
  webhookTimestamp: string,
  webhookSignature: string
): Promise<boolean> {
  const secretKey = process.env.PORTONE_WEBHOOK_SECRET
  if (!secretKey) {
    throw new Error('PORTONE_WEBHOOK_SECRET is not set')
  }

  // PortOne V2 webhook signature: HMAC-SHA256 of "{webhookId}.{webhookTimestamp}.{body}"
  const { createHmac } = await import('crypto')
  const signedContent = `${webhookId}.${webhookTimestamp}.${body}`
  const computedSignature = createHmac('sha256', secretKey)
    .update(signedContent)
    .digest('base64')

  // webhook-signature header may contain multiple comma-separated signatures (v1,base64=...)
  const signatures = webhookSignature.split(' ').map((s) => s.trim().replace(/^v1,/, ''))
  return signatures.some((sig) => sig === computedSignature)
}
