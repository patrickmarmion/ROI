import { Router } from 'express'
import { randomBytes } from 'crypto'
import { setSseClient, setSessionToken } from '../state.js'

const router = Router()

router.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })
  res.flushHeaders()

  const token = randomBytes(32).toString('hex')
  setSessionToken(token)
  setSseClient(res)

  res.write(`event: init\ndata: ${JSON.stringify({ sessionToken: token })}\n\n`)

  req.on('close', () => {
    setSseClient(null)
    setSessionToken(null)
  })
})

export default router
