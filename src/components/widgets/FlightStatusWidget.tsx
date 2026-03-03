'use client'
import { useState, useEffect } from 'react'
import { Plane } from 'lucide-react'
import WidgetCard from './WidgetCard'

interface FlightEntry {
  flight: string
  airline: string
  destination: string
  destIata: string
  time: string
  status: string
  statusText?: string
  type: 'departure' | 'arrival'
  terminal?: string
}

interface AirportBoard {
  iata: string
  name: string
  city: string
  departures: FlightEntry[]
  arrivals: FlightEntry[]
}

interface FlightsData {
  lastUpdated: string
  airports: Record<string, AirportBoard | AirportBoard[]>
}

interface Props {
  country: string
  airportStatus?: string
}

function statusStyle(status: string): { color: string; label: string } {
  const s = (status || '').toLowerCase()
  if (s.includes('cancel') || s.includes('suspend')) return { color: '#ff3333', label: 'CANCELLED' }
  if (s.includes('delay') || s.includes('estimated')) return { color: '#ffaa00', label: s.includes('estimated') ? status.toUpperCase() : 'DELAYED' }
  if (s.includes('depart')) return { color: '#555555', label: 'DEPARTED' }
  if (s.includes('land') || s.includes('arriv')) return { color: '#555555', label: 'LANDED' }
  if (s.includes('board')) return { color: '#00ff41', label: 'BOARDING' }
  if (s.includes('divert')) return { color: '#ff8800', label: 'DIVERTED' }
  return { color: '#00ff41', label: (status || 'SCHEDULED').toUpperCase() }
}

function FlightRow({ flight }: { flight: FlightEntry }) {
  const s = statusStyle(flight.statusText || flight.status)
  return (
    <div className="flex items-center gap-1 py-[3px] border-b border-[#1a2a1a] last:border-0 text-[11px] font-mono tracking-wide">
      <span className="w-[56px] text-[#c0ffc0] font-bold shrink-0">{flight.flight}</span>
      <span className="flex-1 text-[#88aa88] truncate">{flight.destIata} {flight.destination}</span>
      <span className="w-[42px] text-[#c0ffc0] text-right shrink-0">{flight.time}</span>
      <span className="w-[82px] text-right shrink-0 font-bold text-[10px] truncate" style={{ color: s.color }}>
        {s.label}
      </span>
    </div>
  )
}

function getScenarios(cancelledCount: number, delayedCount: number, totalFlights: number, airportStatus?: string): string[] {
  const scenarios: string[] = []
  const cancelRate = totalFlights > 0 ? cancelledCount / totalFlights : 0
  if (airportStatus === 'closed') {
    scenarios.push('⛔ Airport operations likely suspended until conflict de-escalation')
    scenarios.push('🔄 Airlines may reroute via alternative airports')
    scenarios.push('📋 Mass rebooking expected — check airline websites')
  } else if (cancelRate > 0.7) {
    scenarios.push('⚠️ Cancellations likely to continue for 6-12 hours')
    scenarios.push('🔄 Some airlines may resume limited operations if airspace clears')
    scenarios.push('🏨 Airport hotels filling fast — book accommodation early')
  } else if (cancelRate > 0.3) {
    scenarios.push('📊 Disruptions expected to continue for 3-6 hours')
    scenarios.push('✈️ Long-haul flights more likely to operate than regional')
    scenarios.push('🔀 Some flights may reroute to avoid restricted airspace')
  } else if (delayedCount > 2) {
    scenarios.push('🕐 Delays likely to cascade through next 2-4 hours')
    scenarios.push('✅ Most flights expected to eventually depart')
  } else {
    scenarios.push('✅ Operations running normally — no major disruptions expected')
    scenarios.push('📊 Monitor situation as geopolitical developments evolve')
  }
  return scenarios
}

export default function FlightStatusWidget({ country, airportStatus }: Props) {
  const [data, setData] = useState<FlightsData | null>(null)
  const [showArrivals, setShowArrivals] = useState(false)
  const [selectedAirportIdx, setSelectedAirportIdx] = useState(0)

  const slug = country.toLowerCase().replace(/\s+/g, '-')

  useEffect(() => {
    fetch('/data/flights.json?' + Date.now())
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setData(d))
      .catch(() => {})
  }, [])

  const raw = data?.airports?.[slug]
  const boards: AirportBoard[] = Array.isArray(raw) ? raw : raw ? [raw] : []
  const board = boards[selectedAirportIdx] || boards[0]
  const flights = board ? (showArrivals ? board.arrivals : board.departures) : []

  const cancelledCount = flights.filter(f => (f.statusText || f.status || '').toLowerCase().includes('cancel')).length
  const delayedCount = flights.filter(f => (f.statusText || f.status || '').toLowerCase().includes('delay')).length
  const scenarios = getScenarios(cancelledCount, delayedCount, flights.length, airportStatus)

  return (
    <WidgetCard
      sources={[{ name: 'Flightradar24', url: 'https://flightradar24.com' }]}
      icon={Plane}
      title="Live Flights"
      urgency={cancelledCount > 5 ? 'critical' : cancelledCount > 2 ? 'warning' : 'info'}
      expandedContent={
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-2 font-medium">Expected Scenarios — Next Few Hours</p>
            <div className="space-y-2">
              {scenarios.map((s, i) => (
                <p key={i} className="text-xs text-[var(--text-secondary)]">{s}</p>
              ))}
            </div>
          </div>
          {board && flights.length > 0 && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border)]">
              <div className="text-center p-2 rounded-lg bg-[var(--bg-primary)]">
                <p className="text-lg font-bold text-red-500">{cancelledCount}</p>
                <p className="text-[9px] text-[var(--text-secondary)]">Cancelled</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-[var(--bg-primary)]">
                <p className="text-lg font-bold text-amber-500">{delayedCount}</p>
                <p className="text-[9px] text-[var(--text-secondary)]">Delayed</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-[var(--bg-primary)]">
                <p className="text-lg font-bold text-green-500">{flights.length - cancelledCount - delayedCount}</p>
                <p className="text-[9px] text-[var(--text-secondary)]">On Track</p>
              </div>
            </div>
          )}
        </div>
      }
    >
      {board ? (
        <div className="relative rounded-lg overflow-hidden -mx-1" style={{ background: '#0a120a' }}>
          {/* Airport selector + DEP/ARR toggle */}
          <div className="flex items-center justify-between px-3 py-2" style={{ background: '#0d1a0d', borderBottom: '1px solid #1a3a1a' }}>
            <div className="flex items-center gap-2">
              <span className="text-[13px]">✈️</span>
              {boards.length > 1 ? (
                <select
                  value={selectedAirportIdx}
                  onChange={(e) => { setSelectedAirportIdx(Number(e.target.value)) }}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[#00ff41] font-mono text-xs font-bold bg-transparent border border-[#1a3a1a] rounded px-1 py-0.5 appearance-none cursor-pointer hover:border-[#00ff41] transition-colors"
                  style={{ background: '#0d1a0d' }}
                >
                  {boards.map((b, i) => (
                    <option key={i} value={i} style={{ background: '#0a120a', color: '#00ff41' }}>
                      {b.iata} — {b.city}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-[#00ff41] font-mono text-xs font-bold">{board.iata}</span>
              )}
              <span className="text-[#00ff41] font-mono text-xs font-bold uppercase">
                {showArrivals ? 'ARRIVALS' : 'DEPARTURES'}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setShowArrivals(!showArrivals) }}
              className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#1a3a1a] text-[#88aa88] hover:text-[#00ff41] hover:border-[#00ff41] transition-colors"
              style={{ background: '#0d1a0d' }}
            >
              {showArrivals ? 'DEP ▸' : '◂ ARR'}
            </button>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-1 px-3 py-1 text-[9px] font-mono text-[#445544] uppercase tracking-widest" style={{ borderBottom: '1px solid #1a2a1a' }}>
            <span className="w-[56px] shrink-0">Flight</span>
            <span className="flex-1">{showArrivals ? 'Origin' : 'Dest'}</span>
            <span className="w-[42px] text-right shrink-0">Time</span>
            <span className="w-[82px] text-right shrink-0">Status</span>
          </div>

          {/* Flight rows */}
          <div className="px-3 py-1 max-h-[300px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1a3a1a #0a120a' }}>
            {flights.length > 0 ? flights.map((f, i) => (
              <FlightRow key={i} flight={f} />
            )) : (
              <div className="text-center text-[#ff3333] font-mono text-xs py-4">NO FLIGHT DATA AVAILABLE</div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-1.5 text-[8px] font-mono text-[#334433] flex justify-between" style={{ borderTop: '1px solid #1a2a1a' }}>
            <span>LIVE DATA • FLIGHTRADAR24</span>
            <span>{board.name}</span>
          </div>

          {/* Scan-line overlay */}
          <div className="absolute inset-0 pointer-events-none rounded-lg" style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.02) 2px, rgba(0,255,65,0.02) 4px)',
          }} />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="text-2xl">{airportStatus === 'closed' ? '🚫' : '✈️'}</div>
          <div>
            <p className="text-sm font-bold">{airportStatus === 'closed' ? 'Flights Suspended' : 'Loading...'}</p>
            <p className="text-[10px] text-[var(--text-secondary)]">Flight data for {country}</p>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
