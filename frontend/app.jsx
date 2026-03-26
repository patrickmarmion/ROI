import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import './app.css'

const MINS_WITHOUT_PANDADOC = 45
const MINS_WITH_PANDADOC = 5

function ROIDashboard() {
  const timeSaved = MINS_WITHOUT_PANDADOC - MINS_WITH_PANDADOC
  const data = [{ name: 'Minutes per document', without: MINS_WITHOUT_PANDADOC, with: MINS_WITH_PANDADOC }]

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

function CompilingPage() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (done) {
    return <ROIDashboard />
  }

  return (
    <div className="compiling-page">
      <div className="spinner" />
      <p className="compiling-text">Your results are being compiled...</p>
    </div>
  )
}

export default function App() {
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const es = new EventSource('https://roi-api.cub.pandadoc.cc/api/events')
    es.addEventListener('redirect', () => setSubmitted(true))
    return () => es.close()
  }, [])

  if (submitted) {
    return <CompilingPage />
  }

  return (
    <div className="wrapper">
      <div className="iframe-container">
        <iframe style="width: 100%; height: 500px;" src="https://form.pandadoc.com/form/svcD7RgDpvRxGCwPT4k7YC?mode=embedded" title="ROI Calculator"></iframe>
      </div>
    </div>
  )
}