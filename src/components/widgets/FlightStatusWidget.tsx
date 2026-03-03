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
  status: 'on-time' | 'delayed' | 'cancelled' | 'departed' | 'landed' | 'boarding' | 'suspended'
  type: 'departure' | 'arrival'
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
  airports: Record<string, AirportBoard[]>
}

interface Props {
  country: string
  airportStatus?: string
}

const STATUS_CONFIG: Record<string, { color: string; label: string; dot: string }> = {
  'on-time':   { color: '#00ff41', label: 'ON TIME',   dot: '●' },
  'boarding':  { color: '#00ff41', label: 'BOARDING',  dot: '●' },
  'delayed':   { color: '#ffaa00', label: 'DELAYED',   dot: '●' },
  'cancelled': { color: '#ff3333', label: 'CANCELLED', dot: '●' },
  'suspended': { color: '#ff3333', label: 'SUSPENDED', dot: '●' },
  'departed':  { color: '#666666', label: 'DEPARTED',  dot: '●' },
  'landed':    { color: '#666666', label: 'LANDED',    dot: '●' },
}

function FlightRow({ flight }: { flight: FlightEntry }) {
  const cfg = STATUS_CONFIG[flight.status] || STATUS_CONFIG['on-time']
  return (
    <div className="flex items-center gap-1 py-[3px] border-b border-[#1a2a1a] last:border-0 text-[11px] font-mono tracking-wide">
      <span className="w-[56px] text-[#c0ffc0] font-bold shrink-0">{flight.flight}</span>
      <span className="flex-1 text-[#88aa88] truncate">{flight.destIata} {flight.destination}</span>
      <span className="w-[42px] text-[#c0ffc0] text-right shrink-0">{flight.time}</span>
      <span className="w-[82px] text-right shrink-0 font-bold" style={{ color: cfg.color }}>
        <span className="text-[9px] mr-1">{cfg.dot}</span>{cfg.label}
      </span>
    </div>
  )
}

export default function FlightStatusWidget({ country, airportStatus }: Props) {
  const [data, setData] = useState<FlightsData | null>(null)
  const [showArrivals, setShowArrivals] = useState(false)
  const [selectedAirport, setSelectedAirport] = useState(0)

  const slug = country.toLowerCase().replace(/\s+/g, '-')

  useEffect(() => {
    fetch('/data/flights.json')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
  }, [])

  const boards = data?.airports?.[slug]
  const board = boards?.[selectedAirport]
  const flights = board ? (showArrivals ? board.arrivals : board.departures) : []

  // Summary for collapsed view
  const cancelledCount = flights.filter(f => f.status === 'cancelled' || f.status === 'suspended').length
  const delayedCount = flights.filter(f => f.status === 'delayed').length

  const summaryEmoji = airportStatus === 'closed' ? '🚫' :
    cancelledCount > 3 ? '⚠️' :
    delayedCount > 2 ? '🟡' : '✅'

  const summaryText = airportStatus === 'closed' ? 'Flights Suspended' :
    cancelledCount > 3 ? 'Major Disruptions' :
    delayedCount > 2 ? 'Some Delays' : 'Mostly Operational'

  return (
    <WidgetCard
      sources={[
        { name: 'Estimated based on advisories', url: '#' },
      ]}
      icon={Plane}
      title="Flight Status"
      urgency={airportStatus === 'closed' ? 'critical' : cancelledCount > 2 ? 'warning' : 'info'}
      expandedContent={
        board ? (
          <div>
            {/* Airport board header */}
            <div className="rounded-lg overflow-hidden" style={{ background: '#0a120a' }}>
              {/* Header bar */}
              <div className="flex items-center justify-between px-3 py-2" style={{ background: '#0d1a0d', borderBottom: '1px solid #1a3a1a' }}>
                <div className="flex items-center gap-2">
                  <span className="text-[13px]">✈</span>
                  {boards && boards.length > 1 ? (
                    <select
                      value={selectedAirport}
                      onChange={e => setSelectedAirport(Number(e.target.value))}
                      className="bg-transparent text-[#00ff41] font-mono text-xs font-bold border-none outline-none cursor-pointer"
                      style={{ WebkitAppearance: 'none' }}
                    >
                      {boards.map((b, i) => (
                        <option key={b.iata} value={i} className="bg-[#0a120a]">{b.iata}</option>
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
                  onClick={() => setShowArrivals(!showArrivals)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#1a3a1a] text-[#88aa88] hover:text-[#00ff41] hover:border-[#00ff41] transition-colors"
                  style={{ background: '#0d1a0d' }}
                >
                  {showArrivals ? 'DEP' : 'ARR'}
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
                <span>ESTIMATED STATUS • NOT LIVE TRACKING</span>
                <span>{board.name}</span>
              </div>
            </div>

            {/* Scan-line overlay effect */}
            <style jsx>{`
              div :global(.scan-lines) {
                background: repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 255, 65, 0.03) 2px,
                  rgba(0, 255, 65, 0.03) 4px
                );
                pointer-events: none;
                position: absolute;
                inset: 0;
                border-radius: 0.5rem;
              }
            `}</style>
          </div>
        ) : (
          <div className="text-xs text-[var(--text-secondary)]">No flight data available for {country}</div>
        )
      }
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{summaryEmoji}</div>
        <div>
          <p className="text-sm font-bold">{summaryText}</p>
          <p className="text-[10px] text-[var(--text-secondary)]">
            {board ? `${board.iata} • ${cancelledCount > 0 ? `${cancelledCount} cancelled` : 'Tap to view board'}` : `Airspace & flights for ${country}`}
          </p>
        </div>
      </div>
    </WidgetCard>
  )
}
