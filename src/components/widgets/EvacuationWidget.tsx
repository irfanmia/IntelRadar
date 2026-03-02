'use client'
import { LifeBuoy, ExternalLink } from 'lucide-react'
import WidgetCard from './WidgetCard'
import { HelpDbCountry } from '@/types'

interface Props {
  helpData: HelpDbCountry | null
}

export default function EvacuationWidget({ helpData }: Props) {
  const embassies = helpData?.embassies || []
  const shelters = helpData?.shelters || []

  return (
    <WidgetCard
sources={[{'name':'US State Department','url':'https://travel.state.gov'},{'name':'UNHCR','url':'https://www.unhcr.org'}]}
            icon={LifeBuoy}
      title="Evacuation & Shelters"
      urgency="critical"
      expandedContent={
        <div className="space-y-3">
          {shelters.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1">Shelters:</p>
              <div className="space-y-1">
                {shelters.map((s, i) => (
                  <div key={i} className="text-xs text-[var(--text-secondary)]">
                    📍 {s.name} — {s.address}
                    {s.phone && <a href={`tel:${s.phone}`} className="text-blue-500 ml-1">{s.phone}</a>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {embassies.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1">Embassies:</p>
              <div className="space-y-1">
                {embassies.map((e, i) => (
                  <div key={i} className="text-xs text-[var(--text-secondary)]">
                    🏛️ {e.country} — <a href={`tel:${e.phone}`} className="text-blue-500">{e.phone}</a>
                    {e.emergencyLine && <span className="text-red-500 ml-1">Emergency: {e.emergencyLine}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-[var(--bg-primary)] text-center">
          <p className="text-lg font-bold">{shelters.length}</p>
          <p className="text-[10px] text-[var(--text-secondary)]">Shelters</p>
        </div>
        <div className="p-2 rounded-lg bg-[var(--bg-primary)] text-center">
          <p className="text-lg font-bold">{embassies.length}</p>
          <p className="text-[10px] text-[var(--text-secondary)]">Embassies</p>
        </div>
      </div>
    </WidgetCard>
  )
}
