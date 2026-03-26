import express from 'express'
import cors from 'cors'
import { createHmac, timingSafeEqual } from 'crypto'

const app = express()
const PORT = process.env.PORT || 3002
const SHARED_KEY = process.env.SHARED_KEY
const PANDADOC_API_KEY = process.env.PANDADOC_API_KEY

// SSE client for the single connected frontend
let sseClient = null
let lastRecipient = null

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
  const stateChanged = events.find(e => e.event === 'document_state_changed')

  if (stateChanged && sseClient) {
    console.log('Webhook request received')
    const tokens = stateChanged.data?.tokens ?? []
    const tokenMap = Object.assign({}, ...tokens)

    const r = stateChanged.data?.recipients?.[0]
    if (r) {
      lastRecipient = { email: r.email, first_name: r.first_name, last_name: r.last_name, role: 'Client' }
    }

    sseClient.write(`event: redirect\ndata: ${JSON.stringify(tokenMap)}\n\n`)
  }

  res.status(200).json({ received: true })
})

app.post('/api/create-document', async (_req, res) => {
  try {
    // Create document
    const createRes = await fetch('https://api.pandadoc.com/public/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `API-Key ${PANDADOC_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'ROI',
        template_uuid: 'pNVzpQpSnZezkqy7paJFmH',
        recipients: lastRecipient ? [lastRecipient] : [],
      }),
    })
    const doc = await createRes.json()
    const id = doc.id

    // Poll until status changes from document.uploaded to document.draft
    await new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const statusRes = await fetch(`https://api.pandadoc.com/public/v1/documents/${id}`, {
            headers: { 'Authorization': `API-Key ${PANDADOC_API_KEY}` },
          })
          const statusData = await statusRes.json()
          if (statusData.status === 'document.draft') {
            clearInterval(interval)
            resolve()
          }
        } catch (err) {
          clearInterval(interval)
          reject(err)
        }
      }, 100)
    })

    // Send document
    const sendRes = await fetch(`https://api.pandadoc.com/public/v1/documents/${id}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `API-Key ${PANDADOC_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello!',
        subject: 'Please find our more ROI info',
      }),
    })
    const sendData = await sendRes.json()
    res.status(sendRes.status).json(sendData)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create and send document' })
  }
})

app.listen(PORT, () => {
  console.log(`ROI backend running on port ${PORT}`)
})
