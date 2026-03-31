import { useState } from 'react'
import ROIDashboard from '../components/ROIDashboard.jsx'
import FilterPanel from '../components/FilterPanel.jsx'

export default function DashboardPage({ nums, sessionToken }) {
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
        company={nums['Client.Company']}
        minsWithout={filters.Num_CurrentTimeToCreate}
        minsWith={filters.Num_TimeToCreateWithPandaDoc}
        quotesPerMonth={filters.Num_QuotesPerMonth}
        teamMembers={filters.Num_TeamMembers}
        closeRate={filters.PCT_CloseRate}
        avgOrderValue={filters.Num_AvgOrderValue}
        currentApprovalTime={filters.Num_CurrentApprovalTime}
        negotiationTime={filters.Num_CurrentNegotiationTime}
        sessionToken={sessionToken}
      />
    </div>
  )
}
