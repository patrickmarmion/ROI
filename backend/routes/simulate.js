import { Router } from 'express'
import { sseClient, setLastRecipient } from '../state.js'

const router = Router()

router.post('/api/simulate-webhook', (req, res) => {
  // Support real PandaDoc webhook format (array of events)
  const body = Array.isArray(req.body) ? req.body : [req.body]
  const stateChanged = body.find(e => e.event === 'document_state_changed')

  let tokens, recipient

  if (stateChanged) {
    const rawTokens = stateChanged.data?.tokens ?? []
    tokens = Object.assign({}, ...rawTokens)
    const r = stateChanged.data?.recipients?.[0]
    recipient = r
      ? { email: r.email, first_name: r.first_name, last_name: r.last_name }
      : { email: 'sandbox@example.com', first_name: 'Sandbox', last_name: 'User' }
  } else {
    tokens = req.body.tokens ?? {}
    recipient = req.body.recipient ?? {
      email: 'sandbox@example.com',
      first_name: 'Sandbox',
      last_name: 'User',
    }
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
