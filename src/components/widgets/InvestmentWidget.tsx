'use client'
import { TrendingUp } from 'lucide-react'
import WidgetCard from './WidgetCard'

export default function InvestmentWidget() {
  const sectors = [
    { name: 'Defense', change: '+12.4%', color: 'text-green-500' },
    { name: 'Energy', change: '+8.7%', color: 'text-green-500' },
    { name: 'Gold/Mining', change: '+5.2%', color: 'text-green-500' },
    { name: 'Airlines', change: '-6.3%', color: 'text-red-500' },
    { name: 'Tourism', change: '-4.8%', color: 'text-red-500' },
    { name: 'Tech', change: '-2.1%', color: 'text-red-500' },
  ]

  return (
    <WidgetCard
sources={[{'name':'Yahoo Finance','url':'https://finance.yahoo.com'},{'name':'Reuters','url':'https://reuters.com'}]}
            icon={TrendingUp}
      title="Investment Impact"
      urgency="info"
      expandedContent={
        <div className="text-xs text-[var(--text-secondary)] space-y-1">
          <p>• Safe havens: Gold, US Treasuries, Swiss Franc</p>
          <p>• Avoid: Regional airlines, tourism, Gulf real estate</p>
          <p>• Watch: Defense contractors, oil companies, cybersecurity</p>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {sectors.map((s, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs">{s.name}</span>
            <span className={`text-xs font-bold ${s.color}`}>{s.change}</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
