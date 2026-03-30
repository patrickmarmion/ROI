import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const SLIDE_DURATION = 15000
const PAGE_COUNT = 4

const PAGES = [
  { id: 'current',     label: 'Current State' },
  { id: 'time',        label: 'Time Savings' },
  { id: 'approval',    label: 'Approval Efficiency' },
  { id: 'negotiation', label: 'Negotiation Efficiency' },
]

async function createDocument() {
  await fetch('https://roi-api.cub.pandadoc.cc/api/create-document', { method: 'POST' })
}

export default function ROIDashboard({
  minsWithout, minsWith = 5, quotesPerMonth = 0, teamMembers = 1,
  closeRate = 0, avgOrderValue = 0, currentApprovalTime = 0, negotiationTime = 0,
}) {
  const [page, setPage] = useState(0)
  const [progress, setProgress] = useState(0)

  // Computed values
  const timeSaved = minsWithout - minsWith
  const timeSavedPerMonth = timeSaved * quotesPerMonth
  const timeSavedPerMemberPerMonth = teamMembers > 0 ? Math.round(timeSavedPerMonth / teamMembers) : 0
  const annualTeamHours = Math.round((minsWithout * quotesPerMonth * 12) / 60)
  const monthlyRevenue = Math.round((closeRate / 100) * quotesPerMonth * avgOrderValue)
  const projectedWinRate = Math.min(closeRate + (closeRate < 35 ? 15 : 10), 100)
  const monthlyApprovalHours = Math.round((quotesPerMonth * currentApprovalTime) / 60)
  const monthlyRedliningHours = Math.round((quotesPerMonth * negotiationTime) / 60)
  const chartData = [{ name: 'Minutes per document', without: minsWithout, with: minsWith }]

  useEffect(() => {
    setProgress(0)
    const start = Date.now()
    let advanced = false

    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      setProgress(Math.min((elapsed / SLIDE_DURATION) * 100, 100))
      if (elapsed >= SLIDE_DURATION && !advanced) {
        advanced = true
        setPage(p => (p + 1) % PAGE_COUNT)
      }
    }, 50)

    return () => clearInterval(timer)
  }, [page])

  const goToPage = (i) => setPage(i)

  return (
    <div className="slides-wrapper">
      {/* Progress bar */}
      <div className="slide-progress">
        <div className="slide-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Slide content */}
      <div className="slide-content">

        {/* Page 1 — Current State */}
        {page === 0 && (
          <div className="slide">
            <h2 className="slide-title">Where You Stand Today</h2>
            <div className="stat-grid">
              <StatCard label="Hours/year on quoting" value={`${annualTeamHours}h`} />
              <StatCard label="Monthly quoting revenue" value={`$${monthlyRevenue.toLocaleString()}`} />
              <StatCard label="Current close rate" value={`${closeRate}%`} />
              <StatCard label="Quotes per month" value={quotesPerMonth} />
              <StatCard label="Team size" value={teamMembers} />
              <StatCard label="Avg order value" value={`$${Number(avgOrderValue).toLocaleString()}`} />
            </div>
          </div>
        )}

        {/* Page 2 — Time Savings */}
        {page === 1 && (
          <div className="slide">
            <h2 className="slide-title">Time You'll Get Back</h2>
            <div className="stat-row">
              <StatCard label="Saved per document" value={`${timeSaved} min`} large />
              <StatCard label="Saved per month" value={`${timeSavedPerMonth} min`} large />
              <StatCard label="Per team member / month" value={`${timeSavedPerMemberPerMonth} min`} large />
            </div>
            <BarChart width={460} height={240} data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis unit=" min" />
              <Tooltip formatter={(v) => `${v} mins`} />
              <Bar dataKey="without" name="Without PandaDoc" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="with" name="With PandaDoc" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </div>
        )}

        {/* Page 3 — Approval Efficiency */}
        {page === 2 && (
          <div className="slide">
            <h2 className="slide-title">Streamline Approvals</h2>
            <div className="stat-row">
              <StatCard label="Monthly approval time" value={`${monthlyApprovalHours}h`} large />
              <StatCard label="Quotes needing approval / month" value={quotesPerMonth} large />
              <StatCard label="Time per approval today" value={`${currentApprovalTime} min`} large />
            </div>
            <p className="slide-insight">
              PandaDoc's automated approval workflows eliminate manual chasing — approvals
              that take <strong>{currentApprovalTime} minutes</strong> today can complete in minutes with
              built-in routing and instant notifications.
            </p>
          </div>
        )}

        {/* Page 4 — Negotiation Efficiency */}
        {page === 3 && (
          <div className="slide">
            <h2 className="slide-title">Close Deals Faster</h2>
            <div className="stat-row">
              <StatCard label="Monthly redlining time" value={`${monthlyRedliningHours}h`} large />
              <StatCard label="Current win rate" value={`${closeRate}%`} large />
              <StatCard label="Projected win rate" value={`${projectedWinRate}%`} large accent />
            </div>
            <p className="slide-insight">
              Smart redlining and e-signatures reduce negotiation cycles — lifting your close
              rate from <strong>{closeRate}%</strong> to a projected <strong>{projectedWinRate}%</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Tab navigation */}
      <nav className="slide-tabs">
        {PAGES.map((p, i) => (
          <button
            key={p.id}
            className={`slide-tab${i === page ? ' active' : ''}`}
            onClick={() => goToPage(i)}
          >
            {p.label}
          </button>
        ))}
      </nav>

      {/* Footer CTA */}
      <div className="slide-footer">
        <button className="cta-button" onClick={createDocument}>
          Receive Further Information
        </button>
      </div>
    </div>
  )
}

function StatCard({ label, value, large, accent }) {
  return (
    <div className={`stat-card${large ? ' large' : ''}${accent ? ' accent' : ''}`}>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  )
}
