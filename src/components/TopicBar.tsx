'use client'
import { motion } from 'framer-motion'
import { TOPICS } from '@/data/mock'

interface Props {
  activeTopic: string
  onSelect: (id: string) => void
  sourceFilter: string
  onSourceFilter: (f: string) => void
}

const SOURCE_FILTERS = ['All', 'Government', 'Global Media', 'Local Media']

export default function TopicBar({ activeTopic, onSelect, sourceFilter, onSourceFilter }: Props) {
  return (
    <div className="px-4 sm:px-6 py-3 space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TOPICS.map(t => (
          <button key={t.id} onClick={() => onSelect(t.id)}
            className={`relative flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
              activeTopic === t.id ? 'text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
            }`}>
            {activeTopic === t.id && (
              <motion.div layoutId="topicPill" className="absolute inset-0 bg-blue-600 rounded-2xl" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />
            )}
            <span className="relative z-10">{t.icon} {t.label}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {SOURCE_FILTERS.map(f => (
          <button key={f} onClick={() => onSourceFilter(f)}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
              sourceFilter === f ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'glass'
            }`}>
            {f}
          </button>
        ))}
      </div>
    </div>
  )
}
