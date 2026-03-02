'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Check, Layers } from 'lucide-react'
import { WidgetId } from '@/types'
import { WIDGET_CATALOG, WidgetMeta } from '@/lib/widgetCatalog'

interface Props {
  selected: WidgetId[]
  onUpdate: (widgets: WidgetId[]) => void
}

const categories: { label: string; emoji: string; ids: WidgetId[] }[] = [
  { label: 'Safety & Security', emoji: '🛡️', ids: ['safety-alert', 'strike-list', 'comms-status', 'military-orders', 'evacuation', 'threat-assessment'] },
  { label: 'News & Analysis', emoji: '📰', ids: ['news-ticker', 'articles', 'geopolitics'] },
  { label: 'Economy & Markets', emoji: '📊', ids: ['economy', 'oil-price', 'fuel-supply', 'market-impact', 'investment', 'sanctions'] },
  { label: 'Travel & Services', emoji: '✈️', ids: ['airport', 'flight-status', 'travel-safety', 'hospitals', 'embassy', 'essentials'] },
  { label: 'People & Aid', emoji: '🤝', ids: ['family-safety', 'how-to-help'] },
]

export default function WidgetPicker({ selected, onUpdate }: Props) {
  const [open, setOpen] = useState(false)
  const catalog = Object.fromEntries(WIDGET_CATALOG.map(w => [w.id, w]))

  const toggle = (id: WidgetId) => {
    if (selected.includes(id)) {
      onUpdate(selected.filter(w => w !== id))
    } else {
      onUpdate([...selected, id])
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.97 }}
        className="w-full glass rounded-2xl p-4 flex items-center justify-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-blue-500 transition-all border border-dashed border-[var(--border-color)]"
      >
        <Plus className="w-4 h-4" />
        Customize Widgets
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg glass rounded-3xl overflow-hidden max-h-[80vh] flex flex-col"
            >
              <div className="p-5 pb-3 flex items-center justify-between border-b border-[var(--border-color)]">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-500" />
                    Customize Widgets
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[var(--text-secondary)]">{selected.length} active</span>
                    <button
                      onClick={() => onUpdate(WIDGET_CATALOG.map(w => w.id))}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium hover:bg-blue-500/20 transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => onUpdate([])}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--bg-primary)] text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-5 space-y-5">
                {categories.map(cat => (
                  <div key={cat.label}>
                    <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      {cat.emoji} {cat.label}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {cat.ids.map(id => {
                        const w = catalog[id]
                        if (!w) return null
                        const active = selected.includes(id)
                        return (
                          <motion.button
                            key={id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggle(id)}
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
                            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-tight">{w.description}</p>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-[var(--border-color)]">
                <button
                  onClick={() => setOpen(false)}
                  className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
