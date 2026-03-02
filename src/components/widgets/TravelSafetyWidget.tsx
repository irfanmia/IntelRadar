'use client'
import { Map } from 'lucide-react'
import WidgetCard from './WidgetCard'

export default function TravelSafetyWidget() {
  const zones = [
    { region: 'Iran', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Israel/Palestine', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Lebanon', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Iraq', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Gulf States', status: 'Caution', color: 'text-amber-500', dot: 'bg-amber-500' },
    { region: 'Turkey', status: 'Caution', color: 'text-amber-500', dot: 'bg-amber-500' },
  ]

  return (
    <WidgetCard
sources={[{'name':'US State Department','url':'https://travel.state.gov'},{'name':'UK FCDO','url':'https://www.gov.uk/foreign-travel-advice'}]}
            icon={Map}
      title="Travel Safety"
      urgency="warning"
      expandedContent={
        <div className="text-xs text-[var(--text-secondary)] space-y-1">
          <p>• Many airlines rerouting around Iranian airspace</p>
          <p>• Travel insurance may not cover conflict zones</p>
          <p>• Register with your embassy before traveling</p>
        </div>
      }
    >
      <div className="space-y-1">
        {zones.map((z, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${z.dot}`} />
              <span className="text-xs">{z.region}</span>
            </div>
            <span className={`text-[10px] font-medium ${z.color}`}>{z.status}</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
