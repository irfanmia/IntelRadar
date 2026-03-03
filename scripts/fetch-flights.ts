#!/usr/bin/env npx tsx
/**
 * Fetch REAL live flight data from Flightradar24 public API
 * Writes to public/data/flights.json
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

function log(msg: string) { console.log(`[${new Date().toISOString()}] ${msg}`) }

interface FlightEntry {
  flight: string
  airline: string
  airlineIata: string
  destination: string
  destCity: string
  destIata: string
  time: string          // scheduled time HH:MM
  timeUnix: number
  terminal: string
  gate: string
  status: string        // "On Time", "Delayed", "Canceled", "Departed", "Landed", "Estimated HH:MM"
  statusColor: string   // green, red, yellow, gray
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

// Country → primary airport IATA (ICAO not needed, FR24 uses IATA)
const COUNTRY_AIRPORTS: Record<string, { iata: string; name: string; city: string }[]> = {
  'united-arab-emirates': [{ iata: 'DXB', name: 'Dubai International', city: 'Dubai' }],
  'saudi-arabia': [{ iata: 'RUH', name: 'King Khalid International', city: 'Riyadh' }],
  'qatar': [{ iata: 'DOH', name: 'Hamad International', city: 'Doha' }],
  'india': [{ iata: 'DEL', name: 'Indira Gandhi International', city: 'New Delhi' }],
  'pakistan': [{ iata: 'ISB', name: 'Islamabad International', city: 'Islamabad' }],
  'united-states': [{ iata: 'JFK', name: 'John F. Kennedy International', city: 'New York' }],
  'united-kingdom': [{ iata: 'LHR', name: 'Heathrow', city: 'London' }],
  'germany': [{ iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' }],
  'france': [{ iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris' }],
  'turkey': [{ iata: 'IST', name: 'Istanbul Airport', city: 'Istanbul' }],
  'egypt': [{ iata: 'CAI', name: 'Cairo International', city: 'Cairo' }],
  'japan': [{ iata: 'NRT', name: 'Narita International', city: 'Tokyo' }],
  'south-korea': [{ iata: 'ICN', name: 'Incheon International', city: 'Seoul' }],
  'china': [{ iata: 'PEK', name: 'Beijing Capital', city: 'Beijing' }],
  'australia': [{ iata: 'SYD', name: 'Kingsford Smith', city: 'Sydney' }],
  'russia': [{ iata: 'SVO', name: 'Sheremetyevo', city: 'Moscow' }],
  'iran': [{ iata: 'IKA', name: 'Imam Khomeini', city: 'Tehran' }],
  'israel': [{ iata: 'TLV', name: 'Ben Gurion', city: 'Tel Aviv' }],
  'lebanon': [{ iata: 'BEY', name: 'Rafic Hariri', city: 'Beirut' }],
  'iraq': [{ iata: 'BGW', name: 'Baghdad International', city: 'Baghdad' }],
  'jordan': [{ iata: 'AMM', name: 'Queen Alia International', city: 'Amman' }],
  'kuwait': [{ iata: 'KWI', name: 'Kuwait International', city: 'Kuwait City' }],
  'bahrain': [{ iata: 'BAH', name: 'Bahrain International', city: 'Manama' }],
  'oman': [{ iata: 'MCT', name: 'Muscat International', city: 'Muscat' }],
  'ukraine': [{ iata: 'KBP', name: 'Boryspil International', city: 'Kyiv' }],
  'taiwan': [{ iata: 'TPE', name: 'Taoyuan International', city: 'Taipei' }],
  'singapore': [{ iata: 'SIN', name: 'Changi', city: 'Singapore' }],
  'malaysia': [{ iata: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur' }],
  'thailand': [{ iata: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok' }],
  'indonesia': [{ iata: 'CGK', name: 'Soekarno-Hatta', city: 'Jakarta' }],
  'brazil': [{ iata: 'GRU', name: 'Guarulhos', city: 'São Paulo' }],
  'nigeria': [{ iata: 'LOS', name: 'Murtala Muhammed', city: 'Lagos' }],
  'south-africa': [{ iata: 'JNB', name: 'O.R. Tambo', city: 'Johannesburg' }],
  'kenya': [{ iata: 'NBO', name: 'Jomo Kenyatta', city: 'Nairobi' }],
  'canada': [{ iata: 'YYZ', name: 'Pearson International', city: 'Toronto' }],
  'mexico': [{ iata: 'MEX', name: 'Benito Juárez', city: 'Mexico City' }],
  'venezuela': [{ iata: 'CCS', name: 'Simón Bolívar', city: 'Caracas' }],
  'colombia': [{ iata: 'BOG', name: 'El Dorado', city: 'Bogotá' }],
  'sudan': [{ iata: 'KRT', name: 'Khartoum International', city: 'Khartoum' }],
  'syria': [{ iata: 'DAM', name: 'Damascus International', city: 'Damascus' }],
  'yemen': [{ iata: 'SAH', name: 'Sana\'a International', city: 'Sana\'a' }],
  'afghanistan': [{ iata: 'KBL', name: 'Kabul International', city: 'Kabul' }],
  'north-korea': [{ iata: 'FNJ', name: 'Sunan International', city: 'Pyongyang' }],
  'philippines': [{ iata: 'MNL', name: 'Ninoy Aquino', city: 'Manila' }],
  'vietnam': [{ iata: 'SGN', name: 'Tan Son Nhat', city: 'Ho Chi Minh City' }],
}

function formatTime(unixTs: number, tzOffset: number = 0): string {
  const d = new Date((unixTs + tzOffset) * 1000)
  return d.toISOString().slice(11, 16) // HH:MM UTC (offset applied)
}

async function fetchAirportFlights(iata: string, mode: 'departures' | 'arrivals'): Promise<FlightEntry[]> {
  try {
    const url = `https://api.flightradar24.com/common/v1/airport.json?code=${iata}&plugin[]=schedule&plugin-setting[schedule][mode]=${mode}&limit=10`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()

    const data = json?.result?.response?.airport?.pluginData?.schedule?.[mode]?.data
    if (!data || !Array.isArray(data)) return []

    return data.map((item: any) => {
      const f = item.flight
      const isDepart = mode === 'departures'
      const dest = isDepart ? f?.airport?.destination : f?.airport?.origin
      const tzOffset = isDepart
        ? (f?.airport?.origin?.timezone?.offset || 0)
        : (dest?.timezone?.offset || 0)
      const schedTime = isDepart
        ? f?.time?.scheduled?.departure
        : f?.time?.scheduled?.arrival

      return {
        flight: f?.identification?.number?.default || '???',
        airline: f?.airline?.name || f?.airline?.short || 'Unknown',
        airlineIata: f?.airline?.code?.iata || '',
        destination: dest?.name || 'Unknown',
        destCity: dest?.position?.region?.city || '',
        destIata: dest?.code?.iata || '',
        time: schedTime ? formatTime(schedTime, tzOffset) : '--:--',
        timeUnix: schedTime || 0,
        terminal: (isDepart ? f?.airport?.origin?.info?.terminal : dest?.info?.terminal) || '',
        gate: (isDepart ? f?.airport?.origin?.info?.gate : dest?.info?.gate) || '',
        status: f?.status?.text || 'Unknown',
        statusColor: f?.status?.generic?.status?.color || 'gray',
        type: mode === 'departures' ? 'departure' : 'arrival',
      } as FlightEntry
    })
  } catch (e: any) {
    log(`  ERROR fetching ${iata} ${mode}: ${e.message}`)
    return []
  }
}

async function main() {
  log('=== Fetching Live Flight Data ===')

  const allBoards: Record<string, AirportBoard> = {}

  // Get unique airports to fetch
  const toFetch: { iata: string; name: string; city: string; country: string }[] = []
  for (const [country, airports] of Object.entries(COUNTRY_AIRPORTS)) {
    for (const apt of airports) {
      toFetch.push({ ...apt, country })
    }
  }

  log(`Fetching ${toFetch.length} airports...`)

  // Fetch in batches of 3 with 3s delay to avoid FR24 rate limits
  const batchSize = 3
  for (let i = 0; i < toFetch.length; i += batchSize) {
    const batch = toFetch.slice(i, i + batchSize)
    const results = await Promise.all(
      batch.map(async (apt) => {
        const [departures, arrivals] = await Promise.all([
          fetchAirportFlights(apt.iata, 'departures'),
          fetchAirportFlights(apt.iata, 'arrivals'),
        ])
        log(`  ${apt.iata} (${apt.city}): ${departures.length} dep, ${arrivals.length} arr`)
        return {
          country: apt.country,
          board: {
            iata: apt.iata,
            name: apt.name,
            city: apt.city,
            country: apt.country,
            departures,
            arrivals,
          } as AirportBoard,
        }
      })
    )

    for (const r of results) {
      if (!allBoards[r.country]) {
        allBoards[r.country] = r.board
      }
    }

    // Delay between batches to avoid 429 rate limits
    if (i + batchSize < toFetch.length) {
      await new Promise(r => setTimeout(r, 3000))
    }
  }

  const output = {
    lastUpdated: new Date().toISOString(),
    airports: allBoards,
  }

  const outDir = join(import.meta.dirname || __dirname, '..', 'public', 'data')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'flights.json'), JSON.stringify(output, null, 2))
  log(`Written flight data for ${Object.keys(allBoards).length} countries`)
  log('=== Flight Fetch Complete ===')
}

main().catch(e => { console.error(e); process.exit(1) })
