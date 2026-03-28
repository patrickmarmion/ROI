import app from './app.js'

const PORT = process.env.PORT || 3002

app.listen(PORT, () => {
  console.log(`ROI backend running on port ${PORT}`)
})
