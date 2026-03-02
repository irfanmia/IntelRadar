'use client'
import { AlertTriangle } from 'lucide-react'
import WidgetCard from './WidgetCard'

interface Props {
  country: string
}

const THREAT_LEVELS: Record<string, { level: string; risk: number; note: string }> = {
  'United Arab Emirates': { level: 'MODERATE', risk: 40, note: 'Potential retaliatory strikes on Gulf infrastructure. Stay alert.' },
  'Saudi Arabia': { level: 'MODERATE', risk: 45, note: 'Oil infrastructure could be targeted. Military on heightened alert.' },
  Qatar: { level: 'ELEVATED', risk: 55, note: 'LNG operations halted. Proximity to conflict zone raises risk.' },
  Lebanon: { level: 'HIGH', risk: 80, note: 'Active Hezbollah involvement. Israeli strikes ongoing.' },
  Iraq: { level: 'HIGH', risk: 75, note: 'Iran-backed militias active. US bases on alert.' },
  Pakistan: { level: 'MODERATE', risk: 50, note: 'Civil unrest in northern regions. Army deployed.' },
  Kuwait: { level: 'MODERATE', risk: 35, note: 'US military presence. Potential missile trajectory zone.' },
  Jordan: { level: 'MODERATE', risk: 40, note: 'Refugee influx expected. Border areas sensitive.' },
  Egypt: { level: 'LOW-MOD', risk: 30, note: 'Suez Canal traffic may be affected. Monitor developments.' },
  Turkey: { level: 'LOW-MOD', risk: 30, note: 'NATO member. Diplomatic tensions with regional actors.' },
  India: { level: 'LOW', risk: 20, note: 'Oil import dependency. Expat community in Gulf at risk.' },
}

export default function ThreatAssessmentWidget({ country }: Props) {
  const threat = THREAT_LEVELS[country] || { level: 'LOW', risk: 15, note: 'Monitor situation. No direct threat currently.' }
  const color = threat.risk >= 70 ? 'text-red-500' : threat.risk >= 40 ? 'text-amber-500' : 'text-green-500'
  const barColor = threat.risk >= 70 ? 'bg-red-500' : threat.risk >= 40 ? 'bg-amber-500' : 'bg-green-500'

  return (
    <WidgetCard
sources={[{'name':'US State Department','url':'https://travel.state.gov'},{'name':'IODA','url':'https://ioda.inetintel.cc.gatech.edu'}]}
            icon={AlertTriangle}
      title="Threat Assessment"
      urgency={threat.risk >= 70 ? 'critical' : threat.risk >= 40 ? 'warning' : 'safe'}
      expandedContent={
        <p className="text-xs text-[var(--text-secondary)]">{threat.note}</p>
      }
    >
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className={`text-xl font-black ${color}`}>{threat.level}</span>
          <span className={`text-sm font-bold ${color}`}>{threat.risk}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden">
          <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${threat.risk}%` }} />
        </div>
        <p className="text-[10px] text-[var(--text-secondary)] mt-1">Conflict spread risk for {country}</p>
      </div>
    </WidgetCard>
  )
}
