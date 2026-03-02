'use client'
import { Plane } from 'lucide-react'
import WidgetCard from './WidgetCard'

interface Props {
  country: string
  airportStatus?: string
}

const FLIGHT_INFO: Record<string, string[]> = {
  'United Arab Emirates': ['Dubai DXB: Operational with delays', 'Abu Dhabi AUH: Some rerouting', 'Sharjah SHJ: Normal'],
  'Saudi Arabia': ['Riyadh RUH: Operational', 'Jeddah JED: Operational', 'Some Gulf routes rerouted'],
  Qatar: ['Doha DOH: Delays expected', 'Some routes suspended', 'Transit flights affected'],
  Lebanon: ['Beirut BEY: Restricted operations', 'Many airlines suspended flights', 'Check before travel'],
  Iraq: ['Baghdad BGW: Limited operations', 'Erbil EBL: Operational with restrictions', 'Basra BSR: Delays'],
  India: ['Flights to/from Gulf may be affected', 'Airspace rerouting in effect', 'Check airline for updates'],
}

export default function FlightStatusWidget({ country, airportStatus }: Props) {
  const info = FLIGHT_INFO[country] || ['Check with your airline for latest status', 'Some routes may be affected']

  return (
    <WidgetCard
sources={[{'name':'US State Department','url':'https://travel.state.gov'},{'name':'Live News RSS','url':'#'}]}
            icon={Plane}
      title="Flight Status"
      urgency={airportStatus === 'closed' ? 'critical' : airportStatus === 'restricted' ? 'warning' : 'info'}
      expandedContent={
        <div className="space-y-1.5">
          {info.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="mt-0.5">✈️</span>
              <span className="text-[var(--text-secondary)]">{f}</span>
            </div>
          ))}
        </div>
      }
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">
          {airportStatus === 'closed' ? '🚫' :
           airportStatus === 'partially-open' ? '🟡' :
           airportStatus === 'frequent-cancellations' ? '⚠️' :
           airportStatus === 'diversions-active' ? '🔀' :
           airportStatus === 'restricted' ? '⚠️' : '✅'}
        </div>
        <div>
          <p className="text-sm font-bold">
            {airportStatus === 'closed' ? 'Flights Suspended' :
             airportStatus === 'partially-open' ? 'Partially Open' :
             airportStatus === 'frequent-cancellations' ? 'Frequent Cancellations' :
             airportStatus === 'diversions-active' ? 'Diversions Active' :
             airportStatus === 'restricted' ? 'Disruptions Expected' : 'Mostly Operational'}
          </p>
          <p className="text-[10px] text-[var(--text-secondary)]">Airspace & flights for {country}</p>
        </div>
      </div>
    </WidgetCard>
  )
}
