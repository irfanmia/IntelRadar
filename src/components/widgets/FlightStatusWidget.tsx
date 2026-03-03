'use client'
import { useState, useEffect } from 'react'
import { Plane } from 'lucide-react'
import WidgetCard from './WidgetCard'

interface FlightEntry {
  flight: string
  airline: string
  airlineIata?: string
  destination: string
  destCity?: string
  destIata: string
  time: string
  timeUnix?: number
  terminal?: string
  gate?: string
  status: string
  statusText?: string
  statusColor?: string
  type: 'departure' | 'arrival'
}

interface AirportBoard {
  iata: string
  name: string
  city: string
  country: string
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
  const s = status.toLowerCase()
  if (s.includes('cancel') || s.includes('suspend')) return { color: '#ff3333', label: (status || 'CANCELLED').toUpperCase() }
  if (s.includes('delay')) return { color: '#ffaa00', label: (status || 'DELAYED').toUpperCase() }
  if (s.includes('depart') || s.includes('land') || s.includes('arriv')) return { color: '#666666', label: (status || 'DEPARTED').toUpperCase() }
  if (s.includes('on-time') || s.includes('on time') || s.includes('schedul')) return { color: '#00ff41', label: 'ON TIME' }
  if (s.includes('board')) return { color: '#00ff41', label: 'BOARDING' }
  return { color: '#00ff41', label: (status || 'ON TIME').toUpperCase() }
}

function FlightRow({ flight }: { flight: FlightEntry }) {
  const s = statusStyle(flight.statusText || flight.status)
  return (
    <div className="flex items-center gap-1 py-[3px] border-b border-[#1a2a1a] last:border-0 text-[11px] font-mono tracking-wide">
      <span className="w-[56px] text-[#c0ffc0] font-bold shrink-0">{flight.flight}</span>
      <span className="flex-1 text-[#88aa88] truncate">{flight.destIata} {flight.destCity || flight.destination}</span>
      <span className="w-[42px] text-[#c0ffc0] text-right shrink-0">{flight.time}</span>
      <span className="w-[82px] text-right shrink-0 font-bold text-[10px] truncate" style={{ color: s.color }}>
        {s.label}
      </span>
    </div>
  )
}

export default function FlightStatusWidget({ country, airportStatus }: Props) {
  const [data, setData] = useState<FlightsData | null>(null)
  const [showArrivals, setShowArrivals] = useState(false)

  const slug = country.toLowerCase().replace(/\s+/g, '-')

  useEffect(() => {
    fetch('/data/flights.json?' + Date.now())
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setData(d))
      .catch(() => {})
  }, [])

  // Handle both array format [{...}] and direct object {...}
  const raw = data?.airports?.[slug]
  const board = Array.isArray(raw) ? raw[0] : raw
  const flights = board ? (showArrivals ? board.arrivals : board.departures) : []

  const cancelledCount = flights.filter(f => (f.status || '').toLowerCase().includes('cancel') || (f.status || '').toLowerCase().includes('suspend')).length
  const delayedCount = flights.filter(f => (f.status || '').toLowerCase().includes('delay')).length

  const summaryEmoji = airportStatus === 'closed' ? '🚫' :
    cancelledCount > 5 ? '🚫' :
    cancelledCount > 2 ? '⚠️' :
    delayedCount > 2 ? '🟡' : '✅'

  const summaryText = airportStatus === 'closed' ? 'Flights Suspended' :
    cancelledCount > 5 ? 'Severe Disruptions' :
    cancelledCount > 2 ? 'Major Cancellations' :
    delayedCount > 2 ? 'Some Delays' : 'Mostly Operational'

  return (
    <WidgetCard
      sources={[{ name: 'Flightradar24', url: 'https://flightradar24.com' }]}
      icon={Plane}
      title="Live Flights"
      urgency={cancelledCount > 5 ? 'critical' : cancelledCount > 2 ? 'warning' : 'info'}
      expandedContent={
        board ? (
          <div className="relative rounded-lg overflow-hidden" style={{ background: '#0a120a' }}>
            {/* Header bar */}
            <div className="flex items-center justify-between px-3 py-2" style={{ background: '#0d1a0d', borderBottom: '1px solid #1a3a1a' }}>
              <div className="flex items-center gap-2">
                <span className="text-[13px]">✈️</span>
                <span className="text-[#00ff41] font-mono text-xs font-bold">{board.iata}</span>
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
            <div className="px-3 py-1 max-h-[280px] overflow-y-auto" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#1a3a1a #0a120a',
            }}>
              {flights.length > 0 ? flights.map((f, i) => (
                <FlightRow key={i} flight={f} />
              )) : (
                <div className="text-center text-[#ff3333] font-mono text-xs py-4">
                  NO FLIGHT DATA AVAILABLE
                </div>
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
          <div className="text-xs text-[var(--text-secondary)]">
            {airportStatus === 'closed' ? 'Airport operations suspended due to conflict.' : `No flight data available for ${country}`}
          </div>
        )
      }
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{summaryEmoji}</div>
        <div>
          <p className="text-sm font-bold">{summaryText}</p>
          <p className="text-[10px] text-[var(--text-secondary)]">
            {board
              ? `${board.iata} ${board.city} • ${cancelledCount > 0 ? `${cancelledCount} cancelled` : flights.length + ' flights'}`
              : `Airspace & flights for ${country}`}
          </p>
        </div>
      </div>
    </WidgetCard>
  )
}
