import express from 'express'
import cors from 'cors'
import eventsRouter from './routes/events.js'
import webhooksRouter from './routes/webhooks.js'
import documentsRouter from './routes/documents.js'
import simulateRouter from './routes/simulate.js'

const app = express()

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
})

app.use('/api', eventsRouter)
app.use('/api', documentsRouter)
app.use(webhooksRouter)

if (process.env.SANDBOX === 'true') {
  app.use(simulateRouter)
  console.log('Sandbox mode: /api/simulate-webhook enabled')
}

export default app
