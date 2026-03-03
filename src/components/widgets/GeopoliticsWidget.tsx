'use client'
import { Globe } from 'lucide-react'
import WidgetCard from './WidgetCard'

import { getImpactEventIds } from '@/lib/countryImpact'

interface Props {
  country: string
  filterTopic?: string | null
}

const ALLIANCE_DATA: Record<string, { sides: { side: string; members: string; color: string }[]; notes: string[] }> = {
  'middle-east': {
    sides: [
      { side: 'US Coalition', members: 'US, Israel, UK, Germany, France', color: 'text-blue-500' },
      { side: 'Iran Axis', members: 'Iran, Hezbollah, Houthis, Iraqi militias', color: 'text-red-500' },
      { side: 'Neutral/Mediators', members: 'China, Turkey, Qatar, Oman', color: 'text-amber-500' },
    ],
    notes: [
      '• NATO Article 5 not invoked — US acting independently',
      '• China calls for immediate ceasefire',
      '• Russia positioning as mediator',
      '• UN Security Council emergency session ongoing',
    ],
  },
  'ukraine-russia': {
    sides: [
      { side: 'NATO / West', members: 'US, UK, EU, Canada, Poland', color: 'text-blue-500' },
      { side: 'Russia & Allies', members: 'Russia, Belarus, North Korea, Iran', color: 'text-red-500' },
      { side: 'Neutral', members: 'China, India, Turkey, Brazil', color: 'text-amber-500' },
    ],
    notes: [
      '• NATO providing weapons & intelligence support',
      '• EU unified on sanctions packages',
      '• China maintaining strategic ambiguity',
      '• Global South largely non-aligned',
    ],
  },
  'china-taiwan': {
    sides: [
      { side: 'US & Allies', members: 'US, Japan, Australia, UK, Philippines', color: 'text-blue-500' },
      { side: 'China & Allies', members: 'China, Russia, Cambodia, Laos', color: 'text-red-500' },
      { side: 'Neutral (ASEAN)', members: 'Singapore, Indonesia, Vietnam, Malaysia', color: 'text-amber-500' },
    ],
    notes: [
      '• US strategic ambiguity on Taiwan defense',
      '• AUKUS alliance strengthening Indo-Pacific posture',
      '• ASEAN nations balancing between powers',
      '• Semiconductor supply chain at risk',
    ],
  },
  'taliban-pakistan': {
    sides: [
      { side: 'Pakistan Army', members: 'Pakistan military, ISI, frontier corps', color: 'text-blue-500' },
      { side: 'TTP / Taliban', members: 'TTP, Afghan Taliban factions, tribal militants', color: 'text-red-500' },
      { side: 'Afghan Govt', members: 'Taliban govt (Kabul), tribal elders', color: 'text-amber-500' },
    ],
    notes: [
      '• Cross-border tensions escalating',
      '• Pakistan military operations in tribal areas',
      '• Afghan Taliban denies supporting TTP',
      '• Civilian displacement in border regions',
    ],
  },
  'venezuela': {
    sides: [
      { side: 'Maduro Regime', members: 'Venezuela govt, Cuba, Russia, Iran', color: 'text-red-500' },
      { side: 'Opposition', members: 'Opposition leaders, diaspora movements', color: 'text-blue-500' },
      { side: 'Regional Actors', members: 'Brazil, Colombia, Mexico, US', color: 'text-amber-500' },
    ],
    notes: [
      '• Disputed election results driving crisis',
      '• Mass emigration destabilizing neighbors',
      '• Oil sanctions impacting global supply',
      '• Regional diplomacy efforts ongoing',
    ],
  },
  'sudan': {
    sides: [
      { side: 'SAF', members: 'Sudanese Armed Forces, govt loyalists', color: 'text-blue-500' },
      { side: 'RSF', members: 'Rapid Support Forces, allied militias', color: 'text-red-500' },
      { side: 'Mediators', members: 'AU, UN, Saudi Arabia, UAE, Egypt', color: 'text-amber-500' },
    ],
    notes: [
      '• Humanitarian catastrophe unfolding',
      '• Millions displaced internally and to neighbors',
      '• Ceasefire talks repeatedly collapsing',
      '• External powers backing different sides',
    ],
  },
  'korea': {
    sides: [
      { side: 'US-ROK-Japan', members: 'US, South Korea, Japan', color: 'text-blue-500' },
      { side: 'DPRK-China', members: 'North Korea, China (tacit support)', color: 'text-red-500' },
      { side: 'Neutral', members: 'Russia (opportunistic), ASEAN', color: 'text-amber-500' },
    ],
    notes: [
      '• North Korea accelerating missile tests',
      '• US-ROK joint exercises ongoing',
      '• China opposes further sanctions',
      '• Nuclear deterrence tensions elevated',
    ],
  },
  'sahel': {
    sides: [
      { side: 'Junta States', members: 'Mali, Burkina Faso, Niger juntas', color: 'text-red-500' },
      { side: 'ECOWAS', members: 'Nigeria, Senegal, Côte d\'Ivoire, Ghana', color: 'text-blue-500' },
      { side: 'Wagner / Russia', members: 'Wagner Group, Russian advisors', color: 'text-amber-500' },
    ],
    notes: [
      '• Military coups reshaping West Africa',
      '• France expelled from former colonies',
      '• Wagner filling security vacuum',
      '• Jihadist groups exploiting instability',
    ],
  },
}

export default function GeopoliticsWidget({ country, filterTopic }: Props) {
  const slug = country.toLowerCase().replace(/\s+/g, '-')
  const impactOrder = getImpactEventIds(slug)
  const eventId = filterTopic || impactOrder[0] || 'middle-east'
  const data = ALLIANCE_DATA[eventId] || ALLIANCE_DATA['middle-east']

  return (
    <WidgetCard
      sources={[{ name: 'Al Jazeera', url: 'https://aljazeera.com' }, { name: 'BBC News', url: 'https://bbc.com/news' }, { name: 'Reuters', url: 'https://reuters.com' }]}
      icon={Globe}
      title="Geopolitics"
      urgency="info"
      expandedContent={
        <div className="text-xs text-[var(--text-secondary)] space-y-1">
          {data.notes.map((n, i) => (
            <p key={i}>{n}</p>
          ))}
          <p>• Escalation risk: <span className="text-amber-500 font-medium">HIGH</span></p>
        </div>
      }
    >
      <div className="space-y-2">
        {data.sides.map((a, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={`text-xs font-bold ${a.color} w-24 flex-shrink-0`}>{a.side}</span>
            <span className="text-[11px] text-[var(--text-secondary)]">{a.members}</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
