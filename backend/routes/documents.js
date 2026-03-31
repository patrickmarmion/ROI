import { Router } from 'express'
import { timingSafeEqual } from 'crypto'
import { lastRecipient, sessionToken } from '../state.js'

const router = Router()
const PANDADOC_API_KEY = process.env.PANDADOC_API_KEY

router.post('/create-document', async (req, res) => {
  const provided = req.headers['x-session-token']
  if (!provided || !sessionToken) {
    return res.status(401).json({ error: 'Unauthorised' })
  }
  try {
    const valid = timingSafeEqual(Buffer.from(provided), Buffer.from(sessionToken))
    if (!valid) return res.status(401).json({ error: 'Unauthorised' })
  } catch {
    return res.status(401).json({ error: 'Unauthorised' })
  }
  try {
    const createRes = await fetch('https://api.pandadoc.com/public/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `API-Key ${PANDADOC_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'ROI',
        template_uuid: 'pNVzpQpSnZezkqy7paJFmH',
        recipients: lastRecipient ? [Object.fromEntries(Object.entries(lastRecipient).filter(([, v]) => v !== null))] : []
      }),
    })
    const doc = await createRes.json()
    const id = doc.id

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        clearInterval(interval)
        reject(new Error('Timed out waiting for document to reach draft status'))
      }, 20_000)

      const interval = setInterval(async () => {
        try {
          const statusRes = await fetch(`https://api.pandadoc.com/public/v1/documents/${id}`, {
            headers: { 'Authorization': `API-Key ${PANDADOC_API_KEY}` },
          })
          const statusData = await statusRes.json()
          if (statusData.status === 'document.draft') {
            clearInterval(interval)
            clearTimeout(timeout)
            resolve()
          }
        } catch (err) {
          clearInterval(interval)
          clearTimeout(timeout)
          reject(err)
        }
      }, 100)
    })

    const sendRes = await fetch(`https://api.pandadoc.com/public/v1/documents/${id}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `API-Key ${PANDADOC_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello детка!',
        subject: 'Please find our more ROI info',
      }),
    })
    const sendData = await sendRes.json()
    res.status(sendRes.status).json(sendData)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create and send document' })
  }
})

export default router
