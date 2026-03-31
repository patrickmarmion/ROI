import { useState } from 'react'

const SLIDER_CONFIG = [
  { key: 'Num_CurrentTimeToCreate',      label: 'Current Time To Create A Document (mins)', min: 1, max: 240 },
  { key: 'Num_QuotesPerMonth',           label: 'Number of Quotes Generated Per Month', min: 1, max: 1000 },
  { key: 'Num_TeamMembers',              label: 'Sales Team Size', min: 1, max: 500 },
  { key: 'PCT_CloseRate',                label: 'Current Close Rate (%)', min: 1, max: 100 },
  { key: 'Num_AvgOrderValue',            label: 'Average Deal Value ($)', min: 1, max: 100000 },
  { key: 'Num_CurrentApprovalTime',      label: 'Current Approval Time Per Document (hours)', min: 1, max: 240 },
  { key: 'Num_CurrentNegotiationTime',   label: 'Current Negotiation Time Per Document (hours)', min: 1, max: 240 },
  { key: 'Num_AvgHourlySalary',          label: 'Average Sales Rep Hourly Salary ($)', min: 1, max: 500 },
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
        {open ? '✕' : 'Filters'}
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
