import { useEffect, useState } from 'react'
import DashboardPage from './DashboardPage.jsx'

export default function CompilingPage({ tokens, sessionToken }) {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (done) {
    const nums = Object.fromEntries(
      Object.entries(tokens).map(([k, v]) => [k, k.startsWith('Num_') || k.startsWith('PCT_') ? Number(v) : v])
    )
    return <DashboardPage nums={nums} sessionToken={sessionToken} />
  }

  return (
    <div className="compiling-page">
      <div className="spinner" />
      <p className="compiling-text">Your results are being compiled...</p>
    </div>
  )
}
