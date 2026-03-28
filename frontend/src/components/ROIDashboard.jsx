import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

async function createDocument() {
  await fetch('https://roi-api.cub.pandadoc.cc/api/create-document', { method: 'POST' })
}

export default function ROIDashboard({ minsWithout, minsWith = 5, quotesPerMonth = 0, teamMembers = 1, closeRate = 0, avgOrderValue = 0, currentApprovalTime = 0, negotiationTime = 0 }) {
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
