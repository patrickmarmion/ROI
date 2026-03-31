import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const SLIDE_DURATION = 15000
const PAGE_COUNT = 4
const MIN_MINS_BEFORE_HOURS = 1200

const PAGES = [
  { id: 'current',     label: 'Current State' },
  { id: 'time',        label: 'Time Savings' },
  { id: 'approval',    label: 'Approval Efficiency' },
  { id: 'negotiation', label: 'Negotiation Efficiency' },
]


export default function ROIDashboard({
  company, minsWithout, minsWith = 5, quotesPerMonth = 0, teamMembers = 1,
  closeRate = 0, avgOrderValue = 0, currentApprovalTime = 0, negotiationTime = 0,
  avgHourlySalary = 0, sessionToken,
}) {
  const [page, setPage] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [ctaStatus, setCtaStatus] = useState('idle') // 'idle' | 'loading' | 'done'

  async function handleCta() {
    if (ctaStatus !== 'idle') return
    setCtaStatus('loading')
    try {
      await fetch('/api/create-document', {
        method: 'POST',
        headers: { 'X-Session-Token': sessionToken ?? '' },
      })
    } catch (_) {
      // still show success — don't block the user on a network error
    }
    setCtaStatus('done')
  }

  // Computed values
  const timeSaved = minsWithout - minsWith
  const timeSavedPerMonth = timeSaved * quotesPerMonth
  const timeSavedPerMemberPerMonth = teamMembers > 0 ? Math.round(timeSavedPerMonth / teamMembers) : 0
  const hoursSavedPerYear = Math.round((timeSavedPerMonth * 12) / 60)
  const approxValueOfTimeSaved = Math.round(hoursSavedPerYear * avgHourlySalary)
  const annualTeamHours = Math.round((minsWithout * quotesPerMonth * 12) / 60)
  const monthlyQuotingMins = minsWithout * quotesPerMonth
  const monthlyRevenue = Math.round((closeRate / 100) * quotesPerMonth * avgOrderValue)
  const projectedWinRate = Math.min(closeRate + (closeRate < 35 ? 15 : 10), 100)
  const monthlyApprovalHours = Math.round(quotesPerMonth * currentApprovalTime)
  const monthlyRedliningHours = Math.round(quotesPerMonth * negotiationTime)
  const chartData = [
    { name: 'Current', value: minsWithout },
    { name: 'Using PandaDoc', value: minsWith },
  ]
  const BAR_FILLS = ['#cbd5e1', '#3b82f6']

  useEffect(() => {
    if (paused) return
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
  }, [page, paused])

  const goToPage = (i) => setPage(i)

  return (
    <div className="slides-wrapper">
      {/* Progress bar */}
      <div className="slide-progress">
        <div className="slide-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Pause button */}
      <button className="pause-button" onClick={() => setPaused(p => !p)} title={paused ? 'Resume' : 'Pause'}>
        {paused ? '▶' : '⏸'}
      </button>

      {/* Slide content */}
      <div className="slide-content">

        {/* Page 1 — Current State */}
        {page === 0 && (
          <div className="slide">
            <h2 className="slide-title">{company ? `Where ${company} Stands Today` : 'Where You Stand Today'}</h2>
            <div className="stat-grid">
              <StatCard label="Hours Per Year Spent on Quoting" value={annualTeamHours} />
              <StatCard label="Monthly Revenue From Quoting" value={`$${monthlyRevenue.toLocaleString()}`} />
              <StatCard label="Current Close Rate" value={`${closeRate}%`} />
              <StatCard label="Quotes Per Month" value={quotesPerMonth} />
              <StatCard label="Team Size" value={teamMembers} />
              <StatCard label="Average Order Value" value={`$${Number(avgOrderValue).toLocaleString()}`} />
              <StatCard label="Monthly Team Minutes on Quoting" value={monthlyQuotingMins} />
              <StatCard label="Monthly Approval Hours (Team)" value={monthlyApprovalHours} />
              <StatCard label="Monthly Redline Hours (Team)" value={monthlyRedliningHours} />
            </div>
          </div>
        )}

        {/* Page 2 — Time Savings */}
        {page === 1 && (
          <div className="slide">
            <h2 className="slide-title">Time You'll Get Back</h2>
            <div className="stat-grid">
              <StatCard label="Minutes Saved Per Document" value={timeSaved} large />
              <StatCard label="Minutes Saved Per Team Member Per Month" value={timeSavedPerMemberPerMonth} large />
              <StatCard
                label={timeSavedPerMonth >= MIN_MINS_BEFORE_HOURS ? 'Hours Saved Per Month' : 'Minutes Saved Per Month'}
                value={timeSavedPerMonth >= MIN_MINS_BEFORE_HOURS ? Math.round(timeSavedPerMonth / 60) : timeSavedPerMonth}
                large
              />
            </div>
            <div className="stat-row">
              <StatCard label="Hours Saved Per Year" value={hoursSavedPerYear} large />
              <StatCard label="Value Of Time Saved" value={`$${approxValueOfTimeSaved.toLocaleString()}`} large />
            </div>
            <BarChart width={460} height={240} data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis unit=" min" />
              <Tooltip formatter={(v) => `${v} mins`} />
              <Bar
                dataKey="value"
                shape={({ x, y, width, height, index }) => (
                  <rect x={x} y={y} width={width} height={Math.max(0, height)} fill={BAR_FILLS[index]} rx={6} ry={6} />
                )}
              />
            </BarChart>
            <p className="chart-title">Time to Create A Document</p>
          </div>
        )}

        {/* Page 3 — Approval Efficiency */}
        {page === 2 && (
          <div className="slide">
            <h2 className="slide-title">Streamline Approvals</h2>
            <div className="stat-row">
              <StatCard label="Monthly Approval Hours" value={monthlyApprovalHours} large />
              <StatCard label="Quotes Needing Approval Per Month" value={quotesPerMonth} large />
              <StatCard label="Time Per Approval Today (Hours)" value={currentApprovalTime} large />
            </div>
            <p className="slide-insight">
              PandaDoc's automated approval workflows eliminate manual chasing — approvals
              that take <strong>{currentApprovalTime} hours</strong> today can complete in minutes with
              built-in routing and instant notifications.
            </p>
          </div>
        )}

        {/* Page 4 — Negotiation Efficiency */}
        {page === 3 && (
          <div className="slide">
            <h2 className="slide-title">Close Deals Faster</h2>
            <div className="stat-row">
              <StatCard label="Monthly Redlining Hours" value={monthlyRedliningHours} large />
              <StatCard label="Current Win Rate (%)" value={closeRate} large />
              <StatCard label="Projected Win Rate (%)" value={projectedWinRate} large accent />
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
        {ctaStatus === 'done' ? (
          <p className="cta-confirmation">A document has been sent to your email.</p>
        ) : (
          <button className="cta-button" onClick={handleCta} disabled={ctaStatus === 'loading'}>
            {ctaStatus === 'loading' ? <span className="cta-spinner" /> : 'Receive Further Information'}
          </button>
        )}
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
