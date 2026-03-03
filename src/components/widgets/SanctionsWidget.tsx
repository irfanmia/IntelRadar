'use client'
import { Landmark } from 'lucide-react'
import WidgetCard from './WidgetCard'
import { getImpactEventIds } from '@/lib/countryImpact'

interface Props {
  country: string
  filterTopic?: string | null
}

const SANCTIONS_DATA: Record<string, { count: number; impacts: number; details: string[]; summary: string }> = {
  'middle-east': {
    count: 12, impacts: 8,
    details: [
      '• New sanctions on Iranian oil exports',
      '• SWIFT restrictions expanded for Iranian banks',
      '• Shipping insurance complications in Gulf',
      '• Supply chain diversification recommended',
    ],
    summary: 'Iran Oil/SWIFT',
  },
  'ukraine-russia': {
    count: 16, impacts: 12,
    details: [
      '• Russia removed from SWIFT banking system',
      '• Oil price cap at $60/barrel enforced',
      '• Tech export ban on semiconductors & dual-use',
      '• Frozen Russian central bank assets (~$300B)',
    ],
    summary: 'Russia SWIFT/Oil/Tech',
  },
  'china-taiwan': {
    count: 9, impacts: 7,
    details: [
      '• US chip export controls on advanced semiconductors',
      '• Entity list restrictions on Chinese tech firms',
      '• ASML/TSMC equipment export bans',
      '• Retaliatory rare earth export controls by China',
    ],
    summary: 'US-China Tech/Chips',
  },
  'venezuela': {
    count: 6, impacts: 4,
    details: [
      '• Venezuela oil export sanctions in effect',
      '• Temporary licenses periodically granted',
      '• Gold export restrictions',
      '• Individual sanctions on regime officials',
    ],
    summary: 'Venezuela Oil',
  },
  'korea': {
    count: 11, impacts: 6,
    details: [
      '• Comprehensive UN nuclear sanctions on DPRK',
      '• Luxury goods import ban',
      '• Coal and mineral export restrictions',
      '• Secondary sanctions on enablers',
    ],
    summary: 'DPRK Nuclear',
  },
  'taliban-pakistan': {
    count: 4, impacts: 3,
    details: [
      '• Taliban entity sanctions remain in place',
      '• Pakistan FATF monitoring impacts banking',
      '• Cross-border trade restrictions',
      '• Aid conditionality from Western donors',
    ],
    summary: 'Taliban/FATF',
  },
  'sudan': {
    count: 5, impacts: 4,
    details: [
      '• Arms embargo on Sudan parties',
      '• Individual sanctions on military leaders',
      '• Gold export monitoring',
      '• Humanitarian exemptions in place',
    ],
    summary: 'Arms/Individual',
  },
  'sahel': {
    count: 3, impacts: 3,
    details: [
      '• ECOWAS economic sanctions on junta states',
      '• EU aid suspension to coup governments',
      '• Wagner-linked entity sanctions',
      '• Border closures impacting trade',
    ],
    summary: 'ECOWAS/EU',
  },
}

const DEFAULT_SANCTIONS = {
  count: 2, impacts: 2,
  details: [
    '• General trade compliance monitoring',
    '• Check country-specific export controls',
    '• Monitor OFAC updates for changes',
  ],
  summary: 'General Trade',
}

export default function SanctionsWidget({ country, filterTopic }: Props) {
  const slug = country.toLowerCase().replace(/\s+/g, '-')
  const impactOrder = getImpactEventIds(slug)
  const eventId = filterTopic || impactOrder[0] || 'middle-east'
  const data = SANCTIONS_DATA[eventId] || DEFAULT_SANCTIONS

  return (
    <WidgetCard
      sources={[{ name: 'US Treasury (OFAC)', url: 'https://ofac.treasury.gov' }, { name: 'EU Sanctions Map', url: 'https://sanctionsmap.eu' }]}
      icon={Landmark}
      title="Sanctions Watch"
      urgency="info"
      expandedContent={
        <div className="text-xs text-[var(--text-secondary)] space-y-1">
          {data.details.map((d, i) => <p key={i}>{d}</p>)}
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-[var(--bg-primary)] text-center">
          <p className="text-lg font-bold text-red-500">{data.count}</p>
          <p className="text-[10px] text-[var(--text-secondary)]">New Sanctions</p>
        </div>
        <div className="p-2 rounded-lg bg-[var(--bg-primary)] text-center">
          <p className="text-lg font-bold text-amber-500">{data.impacts}</p>
          <p className="text-[10px] text-[var(--text-secondary)]">Trade Impacts</p>
        </div>
      </div>
    </WidgetCard>
  )
}
