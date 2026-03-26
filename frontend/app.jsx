import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import './app.css'

function ROIDashboard({ minsWithout, minsWith = 5 }) {
  const timeSaved = minsWithout - minsWith
  const data = [{ name: 'Minutes per document', without: minsWithout, with: minsWith }]

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Your ROI with PandaDoc</h1>
      <div className="dashboard-stat">
        You save <span>{timeSaved} minutes</span> per document
      </div>
      <BarChart width={480} height={320} data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis unit=" min" />
        <Tooltip formatter={(v) => `${v} mins`} />
        <Bar dataKey="without" name="Without PandaDoc" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
        <Bar dataKey="with" name="With PandaDoc" fill="#3b82f6" radius={[6, 6, 0, 0]} />
      </BarChart>
    </div>
  )
}

function CompilingPage({ tokens }) {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (done) {
    return (
      <ROIDashboard
        minsWithout={Number(tokens.Num_CurrentTimeToCreate)}
        minsWith={Number(tokens.Num_TimeToCreateWithPandaDoc)}
      />
    )
  }

  return (
    <div className="compiling-page">
      <div className="spinner" />
      <p className="compiling-text">Your results are being compiled...</p>
    </div>
  )
}

export default function App() {
  const [tokens, setTokens] = useState(null)

  useEffect(() => {
    const es = new EventSource('https://roi-api.cub.pandadoc.cc/api/events')
    es.addEventListener('redirect', (e) => setTokens(JSON.parse(e.data)))
    return () => es.close()
  }, [])

  if (tokens) {
    return <CompilingPage tokens={tokens} />
  }

  return (
    <div className="wrapper">
      <div className="iframe-container">
        <iframe src="https://form.pandadoc.com/form/svcD7RgDpvRxGCwPT4k7YC?mode=embedded" title="ROI Calculator"></iframe>
      </div>
    </div>
  )
}