import { useState } from 'react'

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

export default function FilterPanel({ filters, onSave }) {
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
