'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpDb, HelpDbCountry } from '@/types'
import {
  Hospital, Phone, Shield, Building2, Globe, AlertTriangle,
  Heart, Plane, Wifi, ChevronDown, MapPin, ExternalLink
} from 'lucide-react'
import { countryFlagUrl } from '@/lib/countryFlags'

const advisoryColors: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Exercise Normal Precautions' },
  2: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: 'Exercise Increased Caution' },
  3: { bg: 'bg-orange-500/10', text: 'text-orange-600', label: 'Reconsider Travel' },
  4: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Do Not Travel' },
}

const statusColors: Record<string, { dot: string; label: string }> = {
  normal: { dot: 'bg-green-500', label: 'Normal' },
  'partially-disrupted': { dot: 'bg-yellow-400', label: 'Partially Disrupted' },
  disrupted: { dot: 'bg-orange-500', label: 'Disrupted' },
  blackout: { dot: 'bg-red-500', label: 'Blackout' },
  open: { dot: 'bg-green-500', label: 'Open' },
  'partially-open': { dot: 'bg-yellow-400', label: 'Partially Open' },
  'frequent-cancellations': { dot: 'bg-orange-500', label: 'Frequent Cancellations' },
  'diversions-active': { dot: 'bg-orange-500', label: 'Diversions Active' },
  restricted: { dot: 'bg-yellow-500', label: 'Restricted' },
  closed: { dot: 'bg-red-500', label: 'Closed' },
}

function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(address)}`
}

function Section({ icon: Icon, title, children, accent }: {
  icon: any; title: string; children: React.ReactNode; accent?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-1.5 rounded-lg ${accent || 'bg-blue-500/10'}`}>
          <Icon className={`w-4 h-4 ${accent ? accent.replace('bg-', 'text-').replace('/10', '') : 'text-blue-500'}`} />
        </div>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s = statusColors[status] || { dot: 'bg-gray-400', label: status }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

interface HelpProps {
  userCountry?: string
}

export default function HelpSection({ userCountry }: HelpProps) {
  const [db, setDb] = useState<HelpDb | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string>('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    fetch('/data/help-db.json')
      .then(r => r.json())
      .then((data: HelpDb) => {
        setDb(data)
        // Default to user's chosen country
        if (userCountry) {
          const slug = userCountry.toLowerCase().replace(/\s+/g, '-')
          if (data.countries[slug]) {
            setSelectedSlug(slug)
            return
          }
          const found = Object.entries(data.countries).find(([, c]) => c.name === userCountry)
          if (found) {
            setSelectedSlug(found[0])
            return
          }
        }
        const slugs = Object.keys(data.countries).sort((a, b) =>
          data.countries[a].name.localeCompare(data.countries[b].name)
        )
        setSelectedSlug(slugs[0] || '')
      })
      .catch(console.error)
  }, [userCountry])

  if (!db) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-[var(--text-secondary)]">Loading help data...</div>
      </div>
    )
  }

  const sortedSlugs = Object.keys(db.countries).sort((a, b) =>
    db.countries[a].name.localeCompare(db.countries[b].name)
  )
  const country: HelpDbCountry | undefined = db.countries[selectedSlug]
  if (!country) return null

  const advisory = advisoryColors[country.advisoryLevel] || advisoryColors[1]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="px-1 mb-2">
        <h2 className="text-xl font-bold">Help & Emergency</h2>
        <p className="text-xs text-[var(--text-secondary)]">
          Last updated: {new Date(db.lastUpdated).toLocaleDateString()}
        </p>
      </div>

      {/* Country Selector */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full glass rounded-2xl p-4 flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <div className="flex items-center gap-3">
            {countryFlagUrl(country.name, 32) ? (
              <img src={countryFlagUrl(country.name, 32)!} alt={country.name} className="w-8 h-6 rounded-sm object-cover" />
            ) : (
              <Globe className="w-5 h-5 text-blue-500" />
            )}
            <div className="text-left">
              <div className="font-semibold">{country.name}</div>
              <div className="text-xs text-[var(--text-secondary)]">{country.code} · {country.callingCode}</div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-50 mt-2 w-full glass rounded-2xl overflow-hidden max-h-72 overflow-y-auto shadow-xl"
            >
              {sortedSlugs.map(slug => {
                const c = db.countries[slug]
                const flag = countryFlagUrl(c.name, 20)
                return (
                  <button
                    key={slug}
                    onClick={() => { setSelectedSlug(slug); setDropdownOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-2.5 ${
                      slug === selectedSlug ? 'bg-blue-500/10 text-blue-500 font-medium' : ''
                    }`}
                  >
                    {flag ? (
                      <img src={flag} alt={c.name} className="w-5 h-3.5 rounded-sm object-cover flex-shrink-0" />
                    ) : (
                      <span className="w-5 text-center flex-shrink-0">🌍</span>
                    )}
                    {c.name}
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Travel Advisory */}
      <motion.div
        key={selectedSlug + '-advisory'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-4 ${advisory.bg}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className={`w-5 h-5 ${advisory.text}`} />
          <span className={`font-bold text-sm ${advisory.text}`}>
            Level {country.advisoryLevel}: {advisory.label}
          </span>
        </div>
        <p className="text-xs leading-relaxed opacity-80">{country.advisoryNote}</p>
        {country.travelWarnings.length > 0 && (
          <ul className="mt-2 space-y-1">
            {country.travelWarnings.map((w, i) => (
              <li key={i} className="text-xs opacity-70 flex items-start gap-1.5">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* Emergency Contacts */}
      <Section icon={Phone} title="Emergency Contacts" accent="bg-red-500/10">
        <div className="grid grid-cols-2 gap-2">
          {country.emergencyContacts.map(c => (
            <a
              key={c.service}
              href={`tel:${c.number.replace(/[^+\d]/g, '')}`}
              className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 transition-colors"
            >
              <span className="text-xs font-medium leading-tight">{c.service}</span>
              <span className="text-xs font-bold text-red-600 ml-2 whitespace-nowrap">{c.number}</span>
            </a>
          ))}
        </div>
      </Section>

      {/* Hospitals */}
      {country.hospitals.length > 0 && (
        <Section icon={Hospital} title={`Hospitals (${country.hospitals.length})`}>
          <div className="space-y-2">
            {country.hospitals.map(h => (
              <div key={h.name} className="p-3 rounded-xl bg-[var(--bg-primary)]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{h.name}</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">{h.city}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    h.type === 'Government' ? 'bg-blue-500/10 text-blue-600' :
                    h.type === 'Military' ? 'bg-purple-500/10 text-purple-600' :
                    'bg-green-500/10 text-green-600'
                  }`}>
                    {h.type}
                  </span>
                </div>
                <a
                  href={mapsUrl(h.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-500 flex items-center gap-1 mt-1 hover:underline"
                >
                  <MapPin className="w-3 h-3" />
                  {h.address}
                </a>
                <a href={`tel:${h.phone.replace(/[^+\d]/g, '')}`} className="text-[11px] text-blue-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" />
                  {h.phone}
                </a>
                {h.hasEmergency && (
                  <span className="inline-block mt-1 text-[10px] text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
                    Emergency Dept ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Embassies */}
      {country.embassies.length > 0 && (
        <Section icon={Building2} title="Embassies">
          <div className="space-y-2">
            {country.embassies.map(e => (
              <div key={e.country} className="p-3 rounded-xl bg-[var(--bg-primary)]">
                <p className="font-medium text-sm">{e.country} Embassy</p>
                <a
                  href={mapsUrl(e.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-500 flex items-center gap-1 mt-1 hover:underline"
                >
                  <MapPin className="w-3 h-3" />
                  {e.address}
                </a>
                <a href={`tel:${e.phone.replace(/[^+\d]/g, '')}`} className="text-[11px] text-blue-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" />
                  {e.phone}
                </a>
                {e.emergencyLine && (
                  <a href={`tel:${e.emergencyLine.replace(/[^+\d]/g, '')}`} className="text-[11px] text-red-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />
                    Emergency: {e.emergencyLine}
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Shelters & Safe Zones */}
      {country.shelters.length > 0 && (
        <Section icon={Shield} title="Shelters & Safe Zones" accent="bg-purple-500/10">
          <div className="space-y-2">
            {country.shelters.map(s => (
              <div key={s.name} className="p-3 rounded-xl bg-[var(--bg-primary)]">
                <p className="font-medium text-sm">{s.name}</p>
                <a
                  href={mapsUrl(s.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-500 flex items-center gap-1 mt-1 hover:underline"
                >
                  <MapPin className="w-3 h-3" />
                  {s.address}
                </a>
                {s.phone && (
                  <a href={`tel:${s.phone.replace(/[^+\d]/g, '')}`} className="text-[11px] text-blue-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />
                    {s.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Humanitarian Organizations */}
      {country.humanitarianOrgs.length > 0 && (
        <Section icon={Heart} title="Humanitarian Organizations" accent="bg-pink-500/10">
          <div className="space-y-2">
            {country.humanitarianOrgs.map(org => (
              <div key={org.name} className="p-3 rounded-xl bg-[var(--bg-primary)] flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{org.name}</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">{org.address}</p>
                  {org.phone && (
                    <a href={`tel:${org.phone.replace(/[^+\d]/g, '')}`} className="text-[11px] text-blue-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      {org.phone}
                    </a>
                  )}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 uppercase tracking-wide">
                  {org.type}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}
