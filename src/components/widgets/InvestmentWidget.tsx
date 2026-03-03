'use client'
import { TrendingUp } from 'lucide-react'
import WidgetCard from './WidgetCard'
import { getImpactEventIds } from '@/lib/countryImpact'

interface Props {
  country: string
  filterTopic?: string | null
}

const SECTOR_DATA: Record<string, { sectors: { name: string; change: string; color: string }[]; tips: string[] }> = {
  'middle-east': {
    sectors: [
      { name: 'Defense', change: '+12.4%', color: 'text-green-500' },
      { name: 'Energy', change: '+8.7%', color: 'text-green-500' },
      { name: 'Gold/Mining', change: '+5.2%', color: 'text-green-500' },
      { name: 'Airlines', change: '-6.3%', color: 'text-red-500' },
      { name: 'Tourism', change: '-4.8%', color: 'text-red-500' },
      { name: 'Tech', change: '-2.1%', color: 'text-red-500' },
    ],
    tips: ['• Safe havens: Gold, US Treasuries, Swiss Franc', '• Avoid: Regional airlines, tourism, Gulf real estate', '• Watch: Defense contractors, oil companies, cybersecurity'],
  },
  'ukraine-russia': {
    sectors: [
      { name: 'Defense', change: '+15.2%', color: 'text-green-500' },
      { name: 'Gas/Energy', change: '+11.3%', color: 'text-green-500' },
      { name: 'Wheat/Agri', change: '+9.1%', color: 'text-green-500' },
      { name: 'EU Banks', change: '-7.8%', color: 'text-red-500' },
      { name: 'Airlines', change: '-5.4%', color: 'text-red-500' },
      { name: 'Russian ETFs', change: '-22.0%', color: 'text-red-500' },
    ],
    tips: ['• Safe havens: Gold, LNG stocks, defense ETFs', '• Avoid: European banks with Russia exposure', '• Watch: Wheat futures, fertilizer companies'],
  },
  'china-taiwan': {
    sectors: [
      { name: 'Defense', change: '+10.5%', color: 'text-green-500' },
      { name: 'Gold', change: '+4.3%', color: 'text-green-500' },
      { name: 'Semiconductors', change: '-14.2%', color: 'text-red-500' },
      { name: 'Shipping', change: '-8.7%', color: 'text-red-500' },
      { name: 'Tech', change: '-9.1%', color: 'text-red-500' },
      { name: 'Apple/TSMC', change: '-11.5%', color: 'text-red-500' },
    ],
    tips: ['• Critical: Semiconductor supply chain at risk', '• Avoid: Companies dependent on Taiwan fabs', '• Watch: Alternative chip manufacturers, defense'],
  },
  'taliban-pakistan': {
    sectors: [
      { name: 'Defense', change: '+6.8%', color: 'text-green-500' },
      { name: 'Gold', change: '+3.1%', color: 'text-green-500' },
      { name: 'Reg. Banks', change: '-5.4%', color: 'text-red-500' },
      { name: 'Remittances', change: '-3.2%', color: 'text-red-500' },
      { name: 'PKR/USD', change: '-4.7%', color: 'text-red-500' },
      { name: 'Tourism', change: '-6.1%', color: 'text-red-500' },
    ],
    tips: ['• Pakistan rupee under pressure', '• Remittance corridors may be disrupted', '• Watch: Pakistan sovereign bonds, IMF program'],
  },
  'venezuela': {
    sectors: [
      { name: 'Oil', change: '+7.2%', color: 'text-green-500' },
      { name: 'Gold', change: '+2.8%', color: 'text-green-500' },
      { name: 'LatAm Bonds', change: '-6.3%', color: 'text-red-500' },
      { name: 'VEF/USD', change: '-15.0%', color: 'text-red-500' },
      { name: 'Airlines', change: '-4.1%', color: 'text-red-500' },
      { name: 'Reg. Trade', change: '-3.5%', color: 'text-red-500' },
    ],
    tips: ['• Oil prices supported by supply disruption', '• Avoid: LatAm sovereign bonds', '• Watch: Sanctions relief developments'],
  },
  'korea': {
    sectors: [
      { name: 'Defense', change: '+9.4%', color: 'text-green-500' },
      { name: 'Gold', change: '+3.7%', color: 'text-green-500' },
      { name: 'Semiconductors', change: '-8.5%', color: 'text-red-500' },
      { name: 'Korean Won', change: '-5.2%', color: 'text-red-500' },
      { name: 'K-Stocks', change: '-6.8%', color: 'text-red-500' },
      { name: 'Shipping', change: '-3.1%', color: 'text-red-500' },
    ],
    tips: ['• Samsung/SK Hynix vulnerable to conflict', '• Won depreciation impacts imports', '• Watch: Defense stocks, Japan rearmament plays'],
  },
  'sudan': {
    sectors: [
      { name: 'Gold Mining', change: '+4.5%', color: 'text-green-500' },
      { name: 'Defense', change: '+3.2%', color: 'text-green-500' },
      { name: 'Aid Orgs', change: '-8.1%', color: 'text-red-500' },
      { name: 'Reg. Trade', change: '-5.6%', color: 'text-red-500' },
      { name: 'Agriculture', change: '-7.3%', color: 'text-red-500' },
      { name: 'Banking', change: '-9.0%', color: 'text-red-500' },
    ],
    tips: ['• Sudan gold output disrupted — prices supported', '• Regional trade routes through Sudan cut off', '• Watch: Humanitarian funding flows'],
  },
  'sahel': {
    sectors: [
      { name: 'Gold Mining', change: '+6.1%', color: 'text-green-500' },
      { name: 'Uranium', change: '+8.3%', color: 'text-green-500' },
      { name: 'French Cos', change: '-7.5%', color: 'text-red-500' },
      { name: 'Orano/Areva', change: '-9.2%', color: 'text-red-500' },
      { name: 'Reg. Trade', change: '-4.8%', color: 'text-red-500' },
      { name: 'CFA Franc', change: '-2.1%', color: 'text-red-500' },
    ],
    tips: ['• Niger uranium supply critical for France', '• Gold mining operations disrupted', '• Watch: Alternative uranium sources, Russian mining plays'],
  },
}

export default function InvestmentWidget({ country, filterTopic }: Props) {
  const slug = country.toLowerCase().replace(/\s+/g, '-')
  const impactOrder = getImpactEventIds(slug)
  const eventId = filterTopic || impactOrder[0] || 'middle-east'
  const data = SECTOR_DATA[eventId] || SECTOR_DATA['middle-east']

  return (
    <WidgetCard
      sources={[{ name: 'Yahoo Finance', url: 'https://finance.yahoo.com' }, { name: 'Reuters', url: 'https://reuters.com' }]}
      icon={TrendingUp}
      title="Investment Impact"
      urgency="info"
      expandedContent={
        <div className="text-xs text-[var(--text-secondary)] space-y-1">
          {data.tips.map((t, i) => <p key={i}>{t}</p>)}
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {data.sectors.map((s, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs">{s.name}</span>
            <span className={`text-xs font-bold ${s.color}`}>{s.change}</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
