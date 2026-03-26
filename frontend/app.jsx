import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import './app.css'

function ROIDashboard({ minsWithout, minsWith = 5, quotesPerMonth = 0, teamMembers = 1 }) {
  const timeSaved = minsWithout - minsWith
  const timeSavedPerMonth = timeSaved * quotesPerMonth
  const timeSavedPerMemberPerMonth = teamMembers > 0 ? Math.round(timeSavedPerMonth / teamMembers) : 0
  const data = [{ name: 'Minutes per document', without: minsWithout, with: minsWith }]

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Your ROI with PandaDoc</h1>
      <div className="dashboard-stat">
        You save <span>{timeSaved} minutes</span> per document
      </div>
      <div className="dashboard-stat">
        That's <span>{timeSavedPerMonth} minutes</span> saved per month
      </div>
      <div className="dashboard-stat">
        <span>{timeSavedPerMemberPerMonth} minutes</span> saved per team member per month
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

const SLIDER_CONFIG = [
  { key: 'Num_CurrentTimeToCreate',      label: 'Current mins to create a doc', min: 1, max: 240 },
  { key: 'Num_TimeToCreateWithPandaDoc', label: 'Mins to create a doc with PandaDoc', min: 1, max: 120 },
  { key: 'Num_QuotesPerMonth',           label: 'Quotes per month', min: 1, max: 1000 },
  { key: 'Num_TeamMembers',              label: 'Team members', min: 1, max: 500 },
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
  })

  return (
    <div className="dashboard-page">
      <FilterPanel filters={filters} onSave={setFilters} />
      <ROIDashboard
        minsWithout={filters.Num_CurrentTimeToCreate}
        minsWith={filters.Num_TimeToCreateWithPandaDoc}
        quotesPerMonth={filters.Num_QuotesPerMonth}
        teamMembers={filters.Num_TeamMembers}
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
      Object.entries(tokens).map(([k, v]) => [k, k.startsWith('Num_') ? Number(v) : v])
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