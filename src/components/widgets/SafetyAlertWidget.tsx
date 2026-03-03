'use client'
import { AlertTriangle, ShieldAlert } from 'lucide-react'
import WidgetCard from './WidgetCard'
import { getImpactEventIds } from '@/lib/countryImpact'

interface Props {
  country: string
  advisoryLevel?: number
  advisoryNote?: string
  commsStatus?: string
  filterTopic?: string | null
}

const EVENT_ALERTS: Record<string, { level: string; color: string; alerts: string[] }> = {
  'middle-east': {
    level: 'EXTREME',
    color: 'text-red-500',
    alerts: ['Active military operations in region', 'Ballistic missile strikes reported', 'Seek shelter immediately if in conflict zone'],
  },
  'ukraine-russia': {
    level: 'EXTREME',
    color: 'text-red-500',
    alerts: ['Active front-line combat ongoing', 'Drone and missile attacks on cities', 'Air raid sirens — seek shelter'],
  },
  'china-taiwan': {
    level: 'HIGH',
    color: 'text-amber-500',
    alerts: ['Military exercises in Taiwan Strait', 'Shipping disruptions possible', 'Monitor escalation closely'],
  },
  'taliban-pakistan': {
    level: 'HIGH',
    color: 'text-amber-500',
    alerts: ['Terror attacks in border regions', 'Military operations in tribal areas', 'Avoid border crossing points'],
  },
  'venezuela': {
    level: 'HIGH',
    color: 'text-amber-500',
    alerts: ['Political unrest and protests', 'Security forces crackdowns reported', 'Avoid large gatherings'],
  },
  'sudan': {
    level: 'EXTREME',
    color: 'text-red-500',
    alerts: ['Active civil war — fighting in Khartoum', 'Humanitarian crisis worsening', 'Evacuate if possible'],
  },
  'korea': {
    level: 'HIGH',
    color: 'text-amber-500',
    alerts: ['Missile tests increasing in frequency', 'Military readiness elevated', 'Know your nearest shelter'],
  },
  'sahel': {
    level: 'HIGH',
    color: 'text-amber-500',
    alerts: ['Jihadist attacks on civilian targets', 'Military coups creating instability', 'Avoid travel outside major cities'],
  },
}

function getAdvisoryThreat(advisoryLevel: number | undefined): { level: string; color: string } | null {
  if (!advisoryLevel) return null
  if (advisoryLevel >= 4) return { level: 'EXTREME', color: 'text-red-500' }
  if (advisoryLevel >= 3) return { level: 'HIGH', color: 'text-amber-500' }
  if (advisoryLevel >= 2) return { level: 'ELEVATED', color: 'text-amber-500' }
  return { level: 'LOW', color: 'text-green-500' }
}

export default function SafetyAlertWidget({ country, advisoryLevel, advisoryNote, filterTopic }: Props) {
  const slug = country.toLowerCase().replace(/\s+/g, '-')
  const impactOrder = getImpactEventIds(slug)
  const eventId = filterTopic || impactOrder[0] || 'middle-east'
  const eventData = EVENT_ALERTS[eventId] || EVENT_ALERTS['middle-east']

  // Use real advisory data as primary, fall back to event-based
  const advisoryThreat = getAdvisoryThreat(advisoryLevel)
  const displayLevel = advisoryThreat?.level || eventData.level
  const displayColor = advisoryThreat?.color || eventData.color

  return (
    <WidgetCard
      sources={[{ name: 'US State Department', url: 'https://travel.state.gov' }, { name: 'UK FCDO', url: 'https://www.gov.uk/foreign-travel-advice' }]}
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
            {eventData.alerts.map((a, i) => (
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
          <div className={`text-2xl font-black ${displayColor}`}>{displayLevel}</div>
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
