const N8N_BASE = process.env.N8N_WEBHOOK_BASE!
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET!

async function callN8N(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${N8N_BASE}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-secret': WEBHOOK_SECRET,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`N8N webhook failed: ${res.status}`)
  return res.json()
}

export async function triggerInstagramConnect(payload: {
  customerId: string
  handle: string
  socialAccountId: string
}) {
  return callN8N('connect-instagram', payload)
}

export async function triggerSendReply(payload: {
  subscriberId: string
  content: string
  messageReplyId: string
}) {
  return callN8N('send-reply', payload)
}
