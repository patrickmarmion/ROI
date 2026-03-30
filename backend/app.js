import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import eventsRouter from './routes/events.js'
import webhooksRouter from './routes/webhooks.js'
import documentsRouter from './routes/documents.js'
import simulateRouter from './routes/simulate.js'

const app = express()

const allowedOrigin = process.env.ALLOWED_ORIGIN
if (!allowedOrigin) {
  console.warn('Warning: ALLOWED_ORIGIN is not set — CORS will block all browser requests')
}
app.use(cors({ origin: allowedOrigin }))

const createDocumentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Document already requested' },
  standardHeaders: true,
  legacyHeaders: false,
})

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
})

app.use('/api', eventsRouter)
app.use('/api/create-document', createDocumentLimiter)
app.use('/api', documentsRouter)
app.use(webhooksRouter)

if (process.env.SANDBOX === 'true') {
  app.use(simulateRouter)
  console.log('Sandbox mode: /api/simulate-webhook enabled')
}

export default app
