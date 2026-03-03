'use client'
import { AlertTriangle } from 'lucide-react'
import WidgetCard from './WidgetCard'
import { getImpactEventIds } from '@/lib/countryImpact'
import { HelpDbCountry } from '@/types'

interface Props {
  country: string
  helpData?: HelpDbCountry | null
}

// Proximity weight: how close is this event to direct conflict
const EVENT_PROXIMITY: Record<string, number> = {
  'middle-east': 85,
  'ukraine-russia': 90,
  'china-taiwan': 70,
  'taliban-pakistan': 75,
  'venezuela': 60,
  'sudan': 80,
  'korea': 65,
  'sahel': 70,
}

function commsToScore(status?: string): number {
  if (!status) return 50
  const s = status.toLowerCase()
  if (s.includes('down') || s.includes('blackout')) return 100
  if (s.includes('disrupted') || s.includes('partial')) return 70
  if (s.includes('restricted') || s.includes('limited')) return 50
  if (s.includes('normal') || s.includes('operational')) return 10
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

export default function ThreatAssessmentWidget({ country, helpData }: Props) {
  const slug = country.toLowerCase().replace(/\s+/g, '-')
  const impactOrder = getImpactEventIds(slug)
  const primaryEvent = impactOrder[0] || 'middle-east'

  const risk = computeRisk(helpData?.advisoryLevel, primaryEvent, helpData?.commsStatus)
  const level = riskToLevel(risk)
  const note = helpData?.advisoryNote || `Monitor situation. Risk derived from advisory level, conflict proximity, and communications status.`

  const color = risk >= 70 ? 'text-red-500' : risk >= 40 ? 'text-amber-500' : 'text-green-500'
  const barColor = risk >= 70 ? 'bg-red-500' : risk >= 40 ? 'bg-amber-500' : 'bg-green-500'

  return (
    <WidgetCard
      sources={[{ name: 'US State Department', url: 'https://travel.state.gov' }, { name: 'IODA', url: 'https://ioda.inetintel.cc.gatech.edu' }]}
      icon={AlertTriangle}
      title="Threat Assessment"
      urgency={risk >= 70 ? 'critical' : risk >= 40 ? 'warning' : 'safe'}
      expandedContent={
        <p className="text-xs text-[var(--text-secondary)]">{note}</p>
      }
    >
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className={`text-xl font-black ${color}`}>{level}</span>
          <span className={`text-sm font-bold ${color}`}>{risk}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden">
          <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${risk}%` }} />
        </div>
        <p className="text-[10px] text-[var(--text-secondary)] mt-1">Conflict spread risk for {country}</p>
      </div>
    </WidgetCard>
  )
}
