import express from 'express'
import cors from 'cors'
import { createHmac, timingSafeEqual } from 'crypto'

const app = express()
const PORT = process.env.PORT || 3002
const SHARED_KEY = process.env.SHARED_KEY

// SSE client for the single connected frontend
let sseClient = null

app.use(cors())

// Capture raw body for webhook signature verification before JSON parsing
app.use((req, res, next) => {
  if (req.path === '/webhook-handler') {
    let raw = ''
    req.on('data', chunk => { raw += chunk })
    req.on('end', () => {
      req.rawBody = raw
      next()
    })
  } else {
    express.json()(req, res, next)
  }
});

// Frontend subscribes here to receive real-time redirect signal
app.get('/api/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })
  res.flushHeaders()

  sseClient = res
  req.on('close', () => { sseClient = null })
})


app.post('/webhook-handler', (req, res) => {
  console.log('Webhook hit received')
  const receivedSignature = req.query.signature
  if (!receivedSignature) {
    return res.status(400).json({ error: 'Missing signature' })
  }

  console.log('SHARED_KEY set:', !!SHARED_KEY)
  console.log('Received signature length:', receivedSignature.length)
  console.log('Raw body length:', req.rawBody?.length)

  try {
    const hmac = createHmac('sha256', SHARED_KEY)
    hmac.update(req.rawBody)
    const expectedSignature = hmac.digest('hex')

    console.log('Expected signature length:', expectedSignature.length)

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
  const shouldRedirect = events.some(e => e.event === 'document_state_changed')

  if (shouldRedirect && sseClient) {
    console.log('Webhook request received')
    sseClient.write('event: redirect\ndata: {}\n\n')
  }

  res.status(200).json({ received: true })
})

app.listen(PORT, () => {
  console.log(`ROI backend running on port ${PORT}`)
})
