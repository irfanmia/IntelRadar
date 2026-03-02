'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Search, Check, ChevronRight, Layers } from 'lucide-react'
import { ALL_COUNTRIES } from '@/lib/proximity'
import { countryFlagUrl } from '@/lib/countryFlags'
import { WIDGET_CATALOG, WidgetMeta } from '@/lib/widgetCatalog'
import { WidgetId } from '@/types'

// Recommended defaults for new users
const RECOMMENDED: WidgetId[] = [
  'safety-alert', 'news-ticker', 'articles', 'economy', 'oil-price',
  'threat-assessment', 'flight-status', 'embassy',
]

interface Props {
  onComplete: (country: string, widgets: WidgetId[]) => void
}

export default function CountryOnboarding({ onComplete }: Props) {
  const [step, setStep] = useState<'country' | 'widgets'>('country')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState('')
  const [selectedWidgets, setSelectedWidgets] = useState<WidgetId[]>([...RECOMMENDED])

  const filtered = ALL_COUNTRIES.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  )

  const toggleWidget = (id: WidgetId) => {
    setSelectedWidgets(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    )
  }

  const selectAll = () => setSelectedWidgets(WIDGET_CATALOG.map(w => w.id))
  const selectNone = () => setSelectedWidgets([])

  // Group widgets by category for display
  const categories: { label: string; emoji: string; widgets: WidgetMeta[] }[] = [
    { label: 'Safety & Security', emoji: '🛡️', widgets: WIDGET_CATALOG.filter(w => ['safety-alert', 'strike-list', 'comms-status', 'military-orders', 'evacuation', 'threat-assessment'].includes(w.id)) },
    { label: 'News & Analysis', emoji: '📰', widgets: WIDGET_CATALOG.filter(w => ['news-ticker', 'articles', 'geopolitics'].includes(w.id)) },
    { label: 'Economy & Markets', emoji: '📊', widgets: WIDGET_CATALOG.filter(w => ['economy', 'oil-price', 'fuel-supply', 'market-impact', 'investment', 'sanctions'].includes(w.id)) },
    { label: 'Travel & Services', emoji: '✈️', widgets: WIDGET_CATALOG.filter(w => ['airport', 'flight-status', 'travel-safety', 'hospitals', 'embassy', 'essentials'].includes(w.id)) },
    { label: 'People & Aid', emoji: '🤝', widgets: WIDGET_CATALOG.filter(w => ['family-safety', 'how-to-help'].includes(w.id)) },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <AnimatePresence mode="wait">
        {step === 'country' ? (
          <motion.div
            key="country"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-3xl p-8 max-w-sm w-full"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-1">Where are you?</h1>
              <p className="text-sm text-[var(--text-secondary)]">
                We&apos;ll show relevant data for your location
              </p>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search country..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                autoFocus
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-0.5 mb-4 rounded-xl">
              {filtered.map(c => {
                const flag = countryFlagUrl(c, 20)
                return (
                  <button
                    key={c}
                    onClick={() => setSelected(c)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2.5 ${
                      selected === c
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-[var(--bg-primary)]'
                    }`}
                  >
                    {flag ? (
                      <img src={flag} alt={c} className="w-5 h-3.5 rounded-sm object-cover flex-shrink-0" />
                    ) : (
                      <span className="w-5 text-center flex-shrink-0">🌍</span>
                    )}
                    {c}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => selected && setStep('widgets')}
              disabled={!selected}
              className="w-full py-3 rounded-2xl bg-blue-600 text-white font-semibold disabled:opacity-40 hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="widgets"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden"
          >
            <div className="p-6 pb-3">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Choose Your Widgets</h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Select what you want on your dashboard
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={selectAll} className="text-[11px] px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 font-medium hover:bg-blue-500/20 transition-colors">
                  Select All
                </button>
                <button onClick={selectNone} className="text-[11px] px-3 py-1 rounded-full bg-[var(--bg-primary)] text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-secondary)] transition-colors">
                  Clear All
                </button>
                <span className="text-[11px] px-3 py-1 text-[var(--text-secondary)]">
                  {selectedWidgets.length} selected
                </span>
              </div>
            </div>

            <div className="overflow-y-auto px-6 pb-4 space-y-4 flex-1">
              {categories.map(cat => (
                <div key={cat.label}>
                  <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>{cat.emoji}</span> {cat.label}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.widgets.map(w => {
                      const active = selectedWidgets.includes(w.id)
                      return (
                        <button
                          key={w.id}
                          onClick={() => toggleWidget(w.id)}
                          className={`p-3 rounded-xl text-left transition-all border ${
                            active
                              ? 'border-blue-500/50 bg-blue-500/10'
                              : 'border-transparent bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-base">{w.emoji}</span>
                            {active && (
                              <span className="p-0.5 rounded-full bg-blue-500">
                                <Check className="w-3 h-3 text-white" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold mt-1">{w.label}</p>
                          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-tight">
                            {w.description}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[var(--border-color)] flex gap-2">
              <button
                onClick={() => setStep('country')}
                className="px-5 py-3 rounded-2xl bg-[var(--bg-primary)] font-semibold text-sm hover:bg-[var(--bg-secondary)] transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => selectedWidgets.length > 0 && onComplete(selected, selectedWidgets)}
                disabled={selectedWidgets.length === 0}
                className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-semibold disabled:opacity-40 hover:bg-blue-700 transition-colors text-sm"
              >
                Start Dashboard ({selectedWidgets.length} widgets)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
