'use client'
import { ShieldAlert, AlertTriangle } from 'lucide-react'
import WidgetCard from './WidgetCard'
import { getImpactEventIds } from '@/lib/countryImpact'
import { HelpDbCountry } from '@/types'

interface Props {
  country: string
  advisoryLevel?: number
  advisoryNote?: string
  commsStatus?: string
  filterTopic?: string | null
  helpData?: HelpDbCountry | null
}

// Event-specific contextual alerts
const EVENT_ALERTS: Record<string, string[]> = {
  'middle-east': ['Active military operations in region', 'Ballistic missile strikes reported', 'Seek shelter immediately if in conflict zone'],
  'ukraine-russia': ['Active front-line combat ongoing', 'Drone and missile attacks on cities', 'Air raid sirens — seek shelter'],
  'china-taiwan': ['Military exercises in Taiwan Strait', 'Shipping disruptions possible', 'Monitor escalation closely'],
  'taliban-pakistan': ['Terror attacks in border regions', 'Military operations in tribal areas', 'Avoid border crossing points'],
  'venezuela': ['Political unrest and protests', 'Security forces crackdowns reported', 'Avoid large gatherings'],
  'sudan': ['Active civil war — fighting in Khartoum', 'Humanitarian crisis worsening', 'Evacuate if possible'],
  'korea': ['Missile tests increasing in frequency', 'Military readiness elevated', 'Know your nearest shelter'],
  'sahel': ['Jihadist attacks on civilian targets', 'Military coups creating instability', 'Avoid travel outside major cities'],
}

// Event proximity scores for risk computation
const EVENT_PROXIMITY: Record<string, number> = {
  'middle-east': 85, 'ukraine-russia': 90, 'china-taiwan': 70,
  'taliban-pakistan': 75, 'venezuela': 60, 'sudan': 80,
  'korea': 65, 'sahel': 70,
}

function commsToScore(status?: string): number {
  if (!status) return 50
  const s = status.toLowerCase()
  if (s.includes('blackout')) return 100
  if (s.includes('disrupted')) return 70
  if (s.includes('partial')) return 50
  if (s.includes('normal')) return 10
  return 30
}

function computeRisk(advisoryLevel?: number, primaryEvent?: string, commsStatus?: string): number {
  const advisoryScore = advisoryLevel ? (advisoryLevel / 4) * 100 : 30
  const proximityScore = primaryEvent ? (EVENT_PROXIMITY[primaryEvent] || 40) : 40
  const commsScore = commsToScore(commsStatus)
  return Math.round(advisoryScore * 0.5 + proximityScore * 0.3 + commsScore * 0.2)
}

function riskToLevel(risk: number): string {
  if (risk >= 80) return 'EXTREME'
  if (risk >= 60) return 'HIGH'
  if (risk >= 40) return 'ELEVATED'
  if (risk >= 25) return 'MODERATE'
  return 'LOW'
}

export default function ThreatSafetyWidget({ country, advisoryLevel, advisoryNote, commsStatus, filterTopic, helpData }: Props) {
  const slug = country.toLowerCase().replace(/\s+/g, '-')
  const impactOrder = getImpactEventIds(slug)
  const eventId = filterTopic || impactOrder[0] || 'middle-east'

  const risk = computeRisk(
    advisoryLevel ?? helpData?.advisoryLevel,
    eventId,
    commsStatus ?? helpData?.commsStatus,
  )
  const level = riskToLevel(risk)
  const alerts = EVENT_ALERTS[eventId] || EVENT_ALERTS['middle-east']
  const note = advisoryNote ?? helpData?.advisoryNote ?? ''

  const color = risk >= 70 ? 'text-red-500' : risk >= 40 ? 'text-amber-500' : 'text-green-500'
  const barColor = risk >= 70 ? 'bg-red-500' : risk >= 40 ? 'bg-amber-500' : 'bg-green-500'
  const dotColor = risk >= 70 ? 'bg-red-500' : risk >= 40 ? 'bg-amber-500' : 'bg-green-500'

  return (
    <WidgetCard
      sources={[
        { name: 'US State Department', url: 'https://travel.state.gov' },
        { name: 'UK FCDO', url: 'https://www.gov.uk/foreign-travel-advice' },
        { name: 'IODA', url: 'https://ioda.inetintel.cc.gatech.edu' },
      ]}
      icon={ShieldAlert}
      title="Threat & Safety"
      size="lg"
      urgency={risk >= 70 ? 'critical' : risk >= 40 ? 'warning' : 'safe'}
      expandedContent={
        <div className="space-y-3">
          {/* Risk bar */}
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Conflict Spread Risk</span>
              <span className={`text-sm font-bold ${color}`}>{risk}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden">
              <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${risk}%` }} />
            </div>
            <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">
              Based on advisory level ({advisoryLevel ?? '—'}/4) + event proximity + comms status ({commsStatus ?? 'unknown'})
            </p>
          </div>

          {/* Advisory note */}
          {note && (
            <div className="p-2 rounded-lg bg-[var(--bg-primary)]">
              <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-1">State Dept Advisory</p>
              <p className="text-xs">{note}</p>
            </div>
          )}

          {/* Event-specific alerts */}
          <div>
            <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Active Alerts</p>
            <div className="space-y-1.5">
              {alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className={`text-2xl font-black ${color}`}>{level}</div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Threat Level for {country}</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-2">
          {(advisoryLevel ?? helpData?.advisoryLevel) && (
            <div className={`text-lg font-bold ${(advisoryLevel ?? helpData?.advisoryLevel ?? 0) >= 4 ? 'text-red-500' : (advisoryLevel ?? helpData?.advisoryLevel ?? 0) >= 3 ? 'text-amber-500' : 'text-green-500'}`}>
              L{advisoryLevel ?? helpData?.advisoryLevel}
            </div>
          )}
          <div className={`w-3 h-3 ${dotColor} rounded-full animate-pulse`} />
        </div>
      </div>
    </WidgetCard>
  )
}
