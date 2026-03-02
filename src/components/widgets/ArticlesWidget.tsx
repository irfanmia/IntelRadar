'use client'
import { BookOpen, ExternalLink, Clock } from 'lucide-react'
import WidgetCard from './WidgetCard'
import { NewsItem } from '@/types'
import SourceLogo from '../SourceLogo'

interface Props {
  news: NewsItem[]
  title?: string
}

/** Curated articles from major outlets — prioritizes items with longer summaries */
export default function ArticlesWidget({ news, title = 'Key Articles' }: Props) {
  // Pick articles with the most substance (longer summaries, from reputable sources)
  const prioritySources = [
    'NY Times', 'Washington Post', 'The Guardian', 'Reuters', 'BBC World', 'BBC',
    'Al Jazeera', 'France 24', 'Middle East Eye', 'SCMP', 'Kyiv Independent',
    'The National', 'Arab News', 'Al Arabiya', 'Dawn', 'Times of India',
    'Khaleej Times', 'Gulf News',
  ]

  const scored = news
    .filter(n => n.link && n.summary && n.summary.length > 40)
    .map(n => {
      const sourceIdx = prioritySources.findIndex(s =>
        n.sources.some(ns => ns.name === s)
      )
      const sourceScore = sourceIdx >= 0 ? prioritySources.length - sourceIdx : 0
      const lengthScore = Math.min(n.summary.length / 50, 5)
      const urgencyScore = n.urgency === 'breaking' ? 3 : n.urgency === 'important' ? 2 : 1
      return { ...n, score: sourceScore + lengthScore + urgencyScore }
    })
    .sort((a, b) => b.score - a.score)

  const articles = scored.slice(0, 8)

  const timeAgo = (ts: string) => {
    const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000)
    if (mins < 60) return `${mins}m ago`
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
    return `${Math.floor(mins / 1440)}d ago`
  }

  return (
    <WidgetCard
      icon={BookOpen}
      title={title}
      size="lg"
      urgency="info"
      expandedContent={
        articles.length > 3 ? (
          <div className="space-y-3">
            {articles.slice(3).map((a, i) => (
              <a
                key={i}
                href={a.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {a.sources[0] && <SourceLogo logo={a.sources[0].logo} name={a.sources[0].name} size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                      {a.headline}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {a.sources[0]?.name}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> {timeAgo(a.timestamp)}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </div>
              </a>
            ))}
          </div>
        ) : undefined
      }
    >
      <div className="space-y-3">
        {articles.slice(0, 3).map((a, i) => (
          <a
            key={i}
            href={a.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                {a.sources[0] && <SourceLogo logo={a.sources[0].logo} name={a.sources[0].name} size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                  {a.headline}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                  {a.summary}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-medium text-[var(--text-secondary)]">
                    {a.sources[0]?.name}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" /> {timeAgo(a.timestamp)}
                  </span>
                  {a.urgency === 'breaking' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">BREAKING</span>
                  )}
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
            </div>
          </a>
        ))}
        {articles.length === 0 && (
          <p className="text-xs text-[var(--text-secondary)]">No articles available</p>
        )}
      </div>
    </WidgetCard>
  )
}
