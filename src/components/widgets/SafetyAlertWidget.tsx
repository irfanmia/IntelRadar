'use client'
import { AlertTriangle, ShieldAlert } from 'lucide-react'
import WidgetCard from './WidgetCard'

interface Props {
  country: string
  advisoryLevel?: number
  advisoryNote?: string
  commsStatus?: string
}

const THREAT_DATA: Record<string, { level: string; color: string; alerts: string[] }> = {
  Iran: {
    level: 'EXTREME',
    color: 'text-red-500',
    alerts: ['Active military operations ongoing', 'Ballistic missile strikes reported', 'Seek shelter immediately'],
  },
  Israel: {
    level: 'EXTREME',
    color: 'text-red-500',
    alerts: ['Incoming rocket alerts active', 'Iron Dome engaged', 'Stay near shelters'],
  },
  Palestine: {
    level: 'EXTREME',
    color: 'text-red-500',
    alerts: ['Active bombing campaign', 'Humanitarian crisis', 'Communications severely disrupted'],
  },
  'United States': {
    level: 'ELEVATED',
    color: 'text-amber-500',
    alerts: ['Heightened terror threat level', 'Military bases on alert', 'Monitor local advisories'],
  },
}

export default function SafetyAlertWidget({ country, advisoryLevel, advisoryNote }: Props) {
  const threat = THREAT_DATA[country] || { level: 'HIGH', color: 'text-amber-500', alerts: ['Monitor situation'] }

  return (
    <WidgetCard
sources={[{'name':'US State Department','url':'https://travel.state.gov'},{'name':'UK FCDO','url':'https://www.gov.uk/foreign-travel-advice'}]}
            icon={ShieldAlert}
      title="Safety Alert"
      size="lg"
      urgency="critical"
      expandedContent={
        <div className="space-y-2">
          {advisoryNote && (
            <p className="text-xs text-[var(--text-secondary)]">{advisoryNote}</p>
          )}
          <div className="space-y-1.5">
            {threat.alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                <span>{a}</span>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-2xl font-black ${threat.color}`}>{threat.level}</div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Threat Level</p>
        </div>
        <div className="text-right">
          {advisoryLevel && (
            <div className={`text-lg font-bold ${advisoryLevel >= 4 ? 'text-red-500' : advisoryLevel >= 3 ? 'text-amber-500' : 'text-green-500'}`}>
              Level {advisoryLevel}
            </div>
          )}
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse inline-block" />
        </div>
      </div>
    </WidgetCard>
  )
}
