'use client'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import CountryOnboarding from '@/components/CountryOnboarding'
import Header from '@/components/Header'
import HelpSection from '@/components/HelpSection'
import WidgetGrid from '@/components/widgets/WidgetGrid'
import { getPreferences, savePreferences, clearPreferences } from '@/lib/preferences'
import { useLiveFeed } from '@/lib/useLiveFeed'
import { UserPreferences, HelpDbCountry, WidgetId } from '@/types'
import { countryFlagUrl } from '@/lib/countryFlags'

export default function Home() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [helpDbData, setHelpDbData] = useState<HelpDbCountry | null>(null)

  useEffect(() => {
    setMounted(true)
    const p = getPreferences()
    // Default dark mode to true for new users
    if (!p.onboarded && p.darkMode === false) {
      p.darkMode = true
    }
    setPrefs(p)
  }, [])

  // Fetch help-db data for the selected country
  useEffect(() => {
    if (!prefs?.country) return
    const slug = prefs.country.toLowerCase().replace(/\s+/g, '-')
    fetch('/data/help-db.json')
      .then(r => r.json())
      .then(data => {
        const entry = data.countries[slug] ||
          Object.values(data.countries).find((c: any) => c.name === prefs.country)
        setHelpDbData((entry as HelpDbCountry) || null)
      })
      .catch(() => setHelpDbData(null))
  }, [prefs?.country])

  const darkMode = prefs?.darkMode ?? true
  const country = prefs?.country || ''
  const widgets = (prefs?.extraWidgets || []) as WidgetId[]

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const { news, financials, lastUpdated, loading, refresh } = useLiveFeed(country || 'United States')

  if (!mounted) return null

  // Show onboarding if not onboarded
  if (!prefs?.onboarded || !prefs?.country) {
    return (
      <CountryOnboarding
        onComplete={(selectedCountry, selectedWidgets) => {
          const updated = savePreferences({
            country: selectedCountry,
            onboarded: true,
            darkMode: true,
            topics: ['middle-east'],
            focusTopic: 'middle-east',
            extraWidgets: selectedWidgets,
          })
          setPrefs(updated || null)
        }}
      />
    )
  }

  const toggleDark = () => {
    const updated = savePreferences({ darkMode: !darkMode })
    setPrefs(updated || prefs)
  }

  const reset = () => {
    clearPreferences()
    setPrefs({ country: '', topics: [], focusTopic: 'middle-east', darkMode: true, onboarded: false })
  }

  const updateWidgets = (w: WidgetId[]) => {
    const updated = savePreferences({ extraWidgets: w })
    setPrefs(updated || prefs)
  }

  return (
    <div className="min-h-screen pb-20">
      <Header
        darkMode={darkMode}
        onToggleDark={toggleDark}
        onReset={reset}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
        showHelp={showHelp}
        onToggleHelp={setShowHelp}
      />

      <AnimatePresence mode="wait">
        {showHelp ? (
          <motion.div key="help" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 sm:px-6 py-4">
            <HelpSection userCountry={country} />
          </motion.div>
        ) : (
          <motion.div key="widgets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {loading ? (
              <div className="px-4 sm:px-6 py-20 text-center">
                <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-[var(--text-secondary)]">Loading intelligence data...</p>
              </div>
            ) : (
              <WidgetGrid
                country={country}
                news={news}
                financials={financials}
                helpData={helpDbData}
                widgets={widgets}
                onUpdateWidgets={updateWidgets}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Country badge */}
      <div
        className="fixed bottom-4 left-4 glass rounded-full px-3 py-1.5 text-[10px] text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
        onClick={reset}
        title="Change country"
      >
        {countryFlagUrl(country, 16) ? (
          <img src={countryFlagUrl(country, 16)!} alt={country} className="w-4 h-3 rounded-sm object-cover" />
        ) : (
          <span>📍</span>
        )}
        {country}
      </div>
    </div>
  )
}
