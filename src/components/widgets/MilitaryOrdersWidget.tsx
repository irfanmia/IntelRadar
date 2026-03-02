'use client'
import { Shield } from 'lucide-react'
import WidgetCard from './WidgetCard'
import { NewsItem } from '@/types'

interface Props {
  news: NewsItem[]
  country: string
}

export default function MilitaryOrdersWidget({ news, country }: Props) {
  const orders = news
    .filter(n => n.headline.toLowerCase().includes('military') || n.headline.toLowerCase().includes('army') || n.headline.toLowerCase().includes('deploy') || n.headline.toLowerCase().includes('curfew') || n.headline.toLowerCase().includes('border'))
    .slice(0, 4)

  return (
    <WidgetCard
sources={[{'name':'US Pentagon','url':'https://defense.gov'},{'name':'Reuters','url':'https://reuters.com'},{'name':'BBC News','url':'https://bbc.com/news'}]}
            icon={Shield}
      title="Military Orders"
      urgency="warning"
      expandedContent={
        <div className="space-y-2 text-xs text-[var(--text-secondary)]">
          <p>• Monitor official government channels for orders</p>
          <p>• Border crossings may be restricted</p>
          <p>• Curfew hours may apply in conflict zones</p>
        </div>
      }
    >
      <div className="space-y-1.5">
        {orders.length > 0 ? orders.map((o, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
            <p className="text-xs leading-tight">{o.headline}</p>
          </div>
        )) : (
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
              <p className="text-xs">Monitor official channels for military orders</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
              <p className="text-xs">Border restrictions may apply</p>
            </div>
          </div>
        )}
      </div>
    </WidgetCard>
  )
}
