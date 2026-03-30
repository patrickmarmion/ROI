import { useEffect, useState } from 'react'
import CompilingPage from './pages/CompilingPage.jsx'
import './App.css'

export default function App() {
  const [tokens, setTokens] = useState(null)

  useEffect(() => {
    const es = new EventSource(`${import.meta.env.VITE_API_BASE ?? ''}/api/events`)
    es.addEventListener('redirect', (e) => setTokens(JSON.parse(e.data)))
    return () => es.close()
  }, [])

  if (tokens) {
    return <CompilingPage tokens={tokens} />
  }

  return (
    <div className="wrapper">
      <div className="iframe-container">
        <iframe src="https://form.pandadoc.com/form/2To7KUCbW5jCEB6SyphUJL?mode=embedded" title="ROI Calculator"></iframe>
      </div>
    </div>
  )
}
