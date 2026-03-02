'use client'
import { Plane } from 'lucide-react'
import WidgetCard from './WidgetCard'

interface Props {
  status: string
  country: string
}

const STATUS_MAP: Record<string, { label: string; color: string; urgency: 'critical' | 'warning' | 'safe' | 'info' }> = {
  open: { label: 'Open', color: 'text-green-500', urgency: 'safe' },
  'partially-open': { label: 'Partially Open', color: 'text-yellow-500', urgency: 'warning' },
  'frequent-cancellations': { label: 'Frequent Cancellations', color: 'text-orange-500', urgency: 'warning' },
  'diversions-active': { label: 'Diversions Active', color: 'text-orange-500', urgency: 'warning' },
  restricted: { label: 'Restricted', color: 'text-amber-500', urgency: 'warning' },
  closed: { label: 'Closed', color: 'text-red-500', urgency: 'critical' },
}

export default function AirportWidget({ status, country }: Props) {
  const info = STATUS_MAP[status] || STATUS_MAP.restricted

  return (
    <WidgetCard
sources={[{'name':'US State Department','url':'https://travel.state.gov'},{'name':'IODA','url':'https://ioda.inetintel.cc.gatech.edu'},{'name':'Live News RSS','url':'#'}]}
            icon={Plane}
      title="Airport Status"
      urgency={info.urgency}
      expandedContent={
        <div className="text-xs text-[var(--text-secondary)] space-y-1">
          <p>• Check with your airline for latest flight status</p>
          <p>• Airspace may be closed to commercial flights</p>
          <p>• Alternative routing through neighboring countries may be available</p>
        </div>
      }
    >
      <div className="flex items-center gap-3">
        <Plane className={`w-8 h-8 ${info.color}`} />
        <div>
          <p className={`text-lg font-bold ${info.color}`}>{info.label}</p>
          <p className="text-[10px] text-[var(--text-secondary)]">{country} Airports</p>
        </div>
      </div>
    </WidgetCard>
  )
}
