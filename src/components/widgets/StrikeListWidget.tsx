'use client'
import { MapPin } from 'lucide-react'
import WidgetCard from './WidgetCard'
import { NewsItem } from '@/types'
import SourceLogo from '../SourceLogo'

interface Props {
  news: NewsItem[]
}

export default function StrikeListWidget({ news }: Props) {
  const strikes = news
    .filter(n => n.urgency === 'breaking')
    .slice(0, 8)
    .map(n => ({
      headline: n.headline,
      time: new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: n.sources[0]?.name || 'Unknown',
      sourceLogo: n.sources[0]?.logo || '',
    }))

  return (
    <WidgetCard
sources={[{'name':'Al Jazeera','url':'https://aljazeera.com'},{'name':'BBC News','url':'https://bbc.com/news'},{'name':'Reuters','url':'https://reuters.com'}]}
            icon={MapPin}
      title="Strike Reports"
      urgency="critical"
      expandedContent={
        strikes.length > 3 ? (
          <div className="space-y-2">
            {strikes.slice(3).map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="text-[var(--text-secondary)] w-12 flex-shrink-0">{s.time}</span>
                <span className="flex-1">{s.headline}</span>
              </div>
            ))}
          </div>
        ) : undefined
      }
    >
      <div className="space-y-2">
        {strikes.slice(0, 3).map((s, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0 animate-pulse" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight truncate">{s.headline}</p>
              <div className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                <span>{s.time}</span>
                <span>·</span>
                {s.sourceLogo && <SourceLogo logo={s.sourceLogo} name={s.source} size={12} />}
                <span>{s.source}</span>
              </div>
            </div>
          </div>
        ))}
        {strikes.length === 0 && (
          <p className="text-xs text-[var(--text-secondary)]">No active strike reports</p>
        )}
      </div>
    </WidgetCard>
  )
}
