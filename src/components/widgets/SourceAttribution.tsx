'use client'
import SourceLogo from '../SourceLogo'

export interface WidgetSource {
  name: string
  url: string
  favicon?: string  // if omitted, derived from url
}

interface Props {
  sources: WidgetSource[]
}

function getFavicon(s: WidgetSource): string {
  if (s.favicon) return s.favicon
  try {
    const domain = new URL(s.url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch {
    return ''
  }
}

export default function SourceAttribution({ sources }: Props) {
  if (!sources.length) return null

  return (
    <div className="pt-2 mt-2 border-t border-[var(--border-color)]">
      <p className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 font-semibold">Sources</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {sources.map(s => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] hover:text-blue-500 transition-colors"
          >
            <SourceLogo logo={getFavicon(s)} name={s.name} size={12} />
            <span>{s.name}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
