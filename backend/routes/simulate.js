import { Router } from 'express'
import { sseClient, setLastRecipient } from '../state.js'

const router = Router()

router.post('/api/simulate-webhook', (req, res) => {
  const tokens = req.body.tokens ?? {}
  const recipient = req.body.recipient ?? {
    email: 'sandbox@example.com',
    first_name: 'Sandbox',
    last_name: 'User',
  }

  setLastRecipient({ ...recipient, role: 'Client' })

  if (sseClient) {
    sseClient.write(`event: redirect\ndata: ${JSON.stringify(tokens)}\n\n`)
    res.status(200).json({ triggered: true })
  } else {
    res.status(400).json({ error: 'No SSE client connected' })
  }
})

export default router
