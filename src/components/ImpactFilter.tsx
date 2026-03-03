'use client'
import { useEffect, useState, useRef } from 'react'
import { getImpactEvents, ImpactEvent } from '@/lib/countryImpact'
import { getPreferences } from '@/lib/preferences'

interface Props {
  selectedEvent: string | null
  onSelectEvent: (id: string | null) => void
}

export default function ImpactFilter({ selectedEvent, onSelectEvent }: Props) {
  const [events, setEvents] = useState<ImpactEvent[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefs = getPreferences()
    if (prefs.country) {
      const slug = prefs.country.toLowerCase().replace(/\s+/g, '-')
      setEvents(getImpactEvents(slug))
    }
  }, [])

  if (events.length === 0) return null

  return (
    <div className="px-4 sm:px-6 py-2">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      >
        <button
          onClick={() => onSelectEvent(null)}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            selectedEvent === null
              ? 'bg-white text-black shadow-lg shadow-white/10'
              : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          🌐 All
        </button>
        {events.map(ev => (
          <button
            key={ev.id}
            onClick={() => onSelectEvent(ev.id === selectedEvent ? null : ev.id)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
              selectedEvent === ev.id
                ? 'bg-white text-black shadow-lg shadow-white/10'
                : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {ev.emoji} {ev.label}
          </button>
        ))}
      </div>
    </div>
  )
}
