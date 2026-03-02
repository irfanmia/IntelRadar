'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COUNTRIES, TOPICS } from '@/data/mock'
import { savePreferences } from '@/lib/preferences'
import { Radar, MapPin, ChevronRight } from 'lucide-react'

interface Props { onComplete: () => void }

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [country, setCountry] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['middle-east'])
  const [search, setSearch] = useState('')

  const filtered = COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase()))

  const toggleTopic = (id: string) => {
    setSelectedTopics(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
  }

  const finish = () => {
    savePreferences({ country, topics: selectedTopics, focusTopic: selectedTopics[0] || 'middle-east', onboarded: true })
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="glass rounded-3xl p-8 max-w-md w-full text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Radar className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">IntelRadar</h1>
            <p className="text-[var(--text-secondary)] mb-8">
              Your public intelligence dashboard. Stay informed on global events that matter.
            </p>
            <button onClick={() => setStep(1)}
              className="w-full py-3 px-6 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              Get Started <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="country" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="glass rounded-3xl p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold">Where are you from?</h2>
            </div>
            <input type="text" placeholder="Search country..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] mb-4 outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="max-h-60 overflow-y-auto space-y-1 mb-6">
              {filtered.map(c => (
                <button key={c} onClick={() => setCountry(c)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${country === c ? 'bg-blue-600 text-white' : 'hover:bg-[var(--bg-primary)]'}`}>
                  {c}
                </button>
              ))}
            </div>
            <button onClick={() => country && setStep(2)} disabled={!country}
              className="w-full py-3 rounded-2xl bg-blue-600 text-white font-semibold disabled:opacity-40 hover:bg-blue-700 transition-colors">
              Continue
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="topics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="glass rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-2">What interests you?</h2>
            <p className="text-[var(--text-secondary)] mb-6">Select topics to follow. You can change these later.</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {TOPICS.map(t => (
                <button key={t.id} onClick={() => toggleTopic(t.id)}
                  className={`p-4 rounded-2xl text-left transition-all border ${
                    selectedTopics.includes(t.id) ? 'border-blue-500 bg-blue-500/10' : 'border-[var(--border)] hover:border-blue-300'
                  }`}>
                  <span className="text-2xl">{t.icon}</span>
                  <p className="text-sm font-medium mt-1">{t.label}</p>
                </button>
              ))}
            </div>
            <button onClick={finish} disabled={selectedTopics.length === 0}
              className="w-full py-3 rounded-2xl bg-blue-600 text-white font-semibold disabled:opacity-40 hover:bg-blue-700 transition-colors">
              Launch Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
