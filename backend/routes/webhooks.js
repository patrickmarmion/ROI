import { Router } from 'express'
import { createHmac, timingSafeEqual } from 'crypto'
import { sseClient, setLastRecipient } from '../state.js'

const router = Router()

router.post('/webhook-handler', (req, res) => {
  const receivedSignature = req.query.signature
  if (!receivedSignature) {
    return res.status(400).json({ error: 'Missing signature' })
  }

  const SHARED_KEY = process.env.SHARED_KEY

  try {
    const hmac = createHmac('sha256', SHARED_KEY)
    hmac.update(req.rawBody)
    const expectedSignature = hmac.digest('hex')

    const valid = timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    )

    if (!valid) {
      return res.status(401).json({ error: 'Invalid signature' })
    }
  } catch (err) {
    console.log('Verification error:', err.message)
    return res.status(401).json({ error: 'Signature verification failed' })
  }

  const body = JSON.parse(req.rawBody)
  const events = Array.isArray(body) ? body : [body]
  const stateChanged = events.find(e =>
    e.event === 'document_state_changed' &&
    e.data?.template?.id === 'jZEpYfbRrojYsB4QgHGYhT'
  )

  if (stateChanged && sseClient) {
    const tokens = stateChanged.data?.tokens ?? []
    const tokenMap = Object.assign({}, ...tokens)

    const r = stateChanged.data?.recipients?.[0]
    if (r) {
      setLastRecipient({ email: r.email, first_name: r.first_name, last_name: r.last_name, role: 'Client' })
    }

    sseClient.write(`event: redirect\ndata: ${JSON.stringify(tokenMap)}\n\n`)
  }

  res.status(200).json({ received: true })
})

export default router
