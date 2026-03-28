import { Router } from 'express'
import { lastRecipient } from '../state.js'

const router = Router()
const PANDADOC_API_KEY = process.env.PANDADOC_API_KEY

router.post('/create-document', async (_req, res) => {
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
        recipients: lastRecipient ? [lastRecipient] : [],
      }),
    })
    const doc = await createRes.json()
    const id = doc.id

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
