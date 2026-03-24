import { useEffect, useState } from 'react'
import './app.css'

export default function App() {
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const es = new EventSource('http://localhost:5000/api/events')
    es.addEventListener('redirect', () => setSubmitted(true))
    return () => es.close()
  }, [])

  if (submitted) {
    return <div style={{ width: '100vw', height: '100vh', background: '#fff' }} />
  }

  return (
    <div className="wrapper">
      <div className="iframe-container">
        <iframe src="https://form.pandadoc.com/form/2To7KUCbW5jCEB6SyphUJL?mode=embedded" title="ROI Calculator"></iframe>
      </div>
    </div>
  )
}