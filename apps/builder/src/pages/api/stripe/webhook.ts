import type { NextApiRequest, NextApiResponse } from 'next'
import cors from 'nextjs-cors'
import { methodNotAllowed } from '@quickbot.io/lib/api/utils'
import { handleWebhookEvent } from '@quickbot.io/billing/api/stripe/handleWebhookEvent'

export const config = {
  api: {
    bodyParser: false,
  },
}

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Uint8Array[] = []
  return new Promise((resolve, reject) => {
    req.on('data', (chunk) => chunks.push(chunk as Uint8Array))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  await cors(req, res, {
    methods: ['POST', 'HEAD'],
    origin: ['https://api.stripe.com', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    optionsSuccessStatus: 200,
  })

  if (req.method === 'HEAD') {
    res.status(200).end()
    return
  }
  if (req.method !== 'POST') return methodNotAllowed(res)

  try {
    const rawBody = await getRawBody(req)
    const result = await handleWebhookEvent(rawBody, req.headers)
    return res.status(200).json({ success: true, result })
  } catch (err) {
    console.error('Stripe Webhook Error:', err)
    return res.status(400).json({ error: (err as Error).message })
  }
}

export default handler
