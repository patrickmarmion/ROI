import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import './app.css'

async function createDocument() {
  await fetch('https://roi-api.cub.pandadoc.cc/api/create-document', { method: 'POST' })
}

function ROIDashboard({ minsWithout, minsWith = 5, quotesPerMonth = 0, teamMembers = 1, closeRate = 0, avgOrderValue = 0, currentApprovalTime = 0, negotiationTime = 0 }) {
  const timeSaved = minsWithout - minsWith
  const timeSavedPerMonth = timeSaved * quotesPerMonth
  const timeSavedPerMemberPerMonth = teamMembers > 0 ? Math.round(timeSavedPerMonth / teamMembers) : 0
  const annualTeamHours = Math.round((minsWithout * quotesPerMonth * 12) / 60)
  const monthlyRevenue = Math.round((closeRate / 100) * quotesPerMonth * avgOrderValue)
  const projectedWinRate = Math.min(closeRate + (closeRate < 35 ? 15 : 10), 100)
  const monthlyApprovalMins = quotesPerMonth * currentApprovalTime
  const monthlyRedliningMins = quotesPerMonth * negotiationTime
  const data = [{ name: 'Minutes per document', without: minsWithout, with: minsWith }]

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Your ROI with PandaDoc</h1>
      <div className="dashboard-stat">
        Your team currently spends <span>{annualTeamHours} hours</span> per year on quoting
      </div>
      <div className="dashboard-stat">
        Current monthly revenue from quoting: <span>${monthlyRevenue.toLocaleString()}</span>
      </div>
      <div className="dashboard-stat">
        Projected win rate with PandaDoc: <span>{projectedWinRate}%</span>
      </div>
      <div className="dashboard-stat">
        You would save <span>{timeSaved} minutes</span> per document
      </div>
      <div className="dashboard-stat">
        That's <span>{timeSavedPerMonth} minutes</span> saved per month
      </div>
      <div className="dashboard-stat">
        That's <span>{timeSavedPerMemberPerMonth} minutes</span> saved per team member per month
      </div>
      <div className="dashboard-stat">
        Monthly time spent on approvals: <span>{monthlyApprovalMins} hours</span>
      </div>
      <div className="dashboard-stat">
        Monthly time spent on redlining: <span>{monthlyRedliningMins} hours</span>
      </div>
      <BarChart width={480} height={320} data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis unit=" min" />
        <Tooltip formatter={(v) => `${v} mins`} />
        <Bar dataKey="without" name="Without PandaDoc" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
        <Bar dataKey="with" name="With PandaDoc" fill="#3b82f6" radius={[6, 6, 0, 0]} />
      </BarChart>
      <button className="cta-button" onClick={createDocument}>
        Receive Further Information
      </button>
    </div>
  )
}

const SLIDER_CONFIG = [
  { key: 'Num_CurrentTimeToCreate',      label: 'Current mins to create a doc', min: 1, max: 240 },
  { key: 'Num_TimeToCreateWithPandaDoc', label: 'Mins to create a doc with PandaDoc', min: 1, max: 120 },
  { key: 'Num_QuotesPerMonth',           label: 'Quotes per month', min: 1, max: 1000 },
  { key: 'Num_TeamMembers',              label: 'Team members', min: 1, max: 500 },
  { key: 'PCT_CloseRate',                label: 'Close rate (%)', min: 1, max: 100 },
  { key: 'Num_AvgOrderValue',            label: 'Average order value ($)', min: 1, max: 100000 },
  { key: 'Num_CurrentApprovalTime',      label: 'Current approval time (mins)', min: 1, max: 240 },
  { key: 'Num_CurrentNegotiationTime',   label: 'Current negotiation time (mins)', min: 1, max: 240 },
]

function FilterPanel({ filters, onSave }) {
  const [draft, setDraft] = useState(filters)
  const [open, setOpen] = useState(false)

  function handleSave() {
    onSave(draft)
    setOpen(false)
  }

  return (
    <>
      <button className="filter-toggle" onClick={() => { setDraft(filters); setOpen(o => !o) }}>
        {open ? '✕' : '⚙ Filters'}
      </button>
      <div className={`filter-panel${open ? ' open' : ''}`}>
        <h2 className="filter-title">Edit Filters</h2>
        {SLIDER_CONFIG.map(({ key, label, min, max }) => (
          <div key={key} className="filter-row">
            <label className="filter-label">{label}</label>
            <div className="filter-slider-row">
              <input
                type="range"
                min={min}
                max={max}
                value={draft[key] ?? min}
                onChange={e => setDraft(d => ({ ...d, [key]: Number(e.target.value) }))}
              />
              <span className="filter-value">{draft[key] ?? min}</span>
            </div>
          </div>
        ))}
        <button className="filter-save" onClick={handleSave}>Save</button>
      </div>
    </>
  )
}

function DashboardPage({ nums }) {
  const [filters, setFilters] = useState({
    Num_CurrentTimeToCreate:      nums.Num_CurrentTimeToCreate      || 0,
    Num_TimeToCreateWithPandaDoc: nums.Num_TimeToCreateWithPandaDoc || 5,
    Num_QuotesPerMonth:           nums.Num_QuotesPerMonth           || 0,
    Num_TeamMembers:              nums.Num_TeamMembers              || 1,
    PCT_CloseRate:                nums.PCT_CloseRate                || 0,
    Num_AvgOrderValue:            nums.Num_AvgOrderValue            || 0,
    Num_CurrentApprovalTime:      nums.Num_CurrentApprovalTime      || 0,
    Num_CurrentNegotiationTime:   nums.Num_CurrentNegotiationTime   || 0,
  })

  return (
    <div className="dashboard-page">
      <FilterPanel filters={filters} onSave={setFilters} />
      <ROIDashboard
        minsWithout={filters.Num_CurrentTimeToCreate}
        minsWith={filters.Num_TimeToCreateWithPandaDoc}
        quotesPerMonth={filters.Num_QuotesPerMonth}
        teamMembers={filters.Num_TeamMembers}
        closeRate={filters.PCT_CloseRate}
        avgOrderValue={filters.Num_AvgOrderValue}
        currentApprovalTime={filters.Num_CurrentApprovalTime}
        negotiationTime={filters.Num_CurrentNegotiationTime}
      />
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
    const nums = Object.fromEntries(
      Object.entries(tokens).map(([k, v]) => [k, k.startsWith('Num_') || k.startsWith('PCT_') ? Number(v) : v])
    )
    return <DashboardPage nums={nums} />
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