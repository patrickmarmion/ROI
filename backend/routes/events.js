import { Router } from 'express'
import { setSseClient } from '../state.js'

const router = Router()

router.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })
  res.flushHeaders()

  setSseClient(res)
  req.on('close', () => setSseClient(null))
})

export default router
