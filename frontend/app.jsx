import { useEffect, useState } from 'react'
import './app.css'

export default function App() {
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const es = new EventSource('https://roi-api.cub.pandadoc.cc/api/events')
    es.addEventListener('redirect', () => setSubmitted(true))
    return () => es.close()
  }, [])

  if (submitted) {
    return (
      <div className="compiling-page">
        <div className="spinner" />
        <p className="compiling-text">Your results are being compiled...</p>
      </div>
    )
  }

  return (
    <div className="wrapper">
      <div className="iframe-container">
        <iframe src="https://form.pandadoc.com/form/2To7KUCbW5jCEB6SyphUJL?mode=embedded" title="ROI Calculator"></iframe>
      </div>
    </div>
  )
}