'use client'
import { Newspaper, ExternalLink } from 'lucide-react'
import WidgetCard from './WidgetCard'
import { NewsItem } from '@/types'
import SourceLogo from '../SourceLogo'

interface Props {
  news: NewsItem[]
  title?: string
}

export default function NewsTickerWidget({ news, title = 'Latest Updates' }: Props) {
  const items = news.slice(0, 8)

  return (
    <WidgetCard
      icon={Newspaper}
      title={title}
      size="lg"
      urgency="info"
      sources={[{name:'Reuters',url:'https://reuters.com'},{name:'Al Jazeera',url:'https://aljazeera.com'},{name:'BBC News',url:'https://bbc.com/news'}]}
      expandedContent={
        items.length > 4 ? (
          <div className="space-y-2">
            {items.slice(4).map((n, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                  n.urgency === 'breaking' ? 'bg-red-500 animate-pulse' :
                  n.urgency === 'important' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-tight">{n.headline}</p>
                  <div className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                    <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>·</span>
                    {n.sources[0] && <SourceLogo logo={n.sources[0].logo} name={n.sources[0].name} size={12} />}
                    <span>{n.sources[0]?.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : undefined
      }
    >
      <div className="space-y-2">
        {items.slice(0, 4).map((n, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
              n.urgency === 'breaking' ? 'bg-red-500 animate-pulse' :
              n.urgency === 'important' ? 'bg-amber-500' : 'bg-blue-500'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">{n.headline}</p>
              <div className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>·</span>
                {n.sources[0] && <SourceLogo logo={n.sources[0].logo} name={n.sources[0].name} size={12} />}
                <span>{n.sources[0]?.name}</span>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-[var(--text-secondary)]">No updates available</p>
        )}
      </div>
    </WidgetCard>
  )
}
