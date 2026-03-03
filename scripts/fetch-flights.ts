/**
 * Fetch REAL flight data from Flightradar24's public API.
 * For each country's top airport, fetches departures and arrivals.
 * Writes to public/data/flights.json
 *
 * Rate limiting: FR24 may rate-limit, so we add delays between requests
 * and only fetch the primary airport per country (37 airports × 2 modes = 74 requests).
 */

import * as fs from 'fs'
import * as path from 'path'

const ROOT = path.resolve(__dirname, '..')
const OUTPUT_PATH = path.join(ROOT, 'public/data/flights.json')

interface FlightEntry {
  flight: string
  airline: string
  destination: string
  destIata: string
  time: string
  status: 'on-time' | 'delayed' | 'cancelled' | 'departed' | 'landed' | 'boarding' | 'scheduled' | 'unknown'
  statusText: string
  type: 'departure' | 'arrival'
  terminal?: string
  gate?: string
}

interface AirportBoard {
  iata: string
  name: string
  city: string
  departures: FlightEntry[]
  arrivals: FlightEntry[]
}

// Primary airport per country (IATA code)
const COUNTRY_AIRPORTS: Record<string, { iata: string; name: string; city: string }> = {
  'united-arab-emirates': { iata: 'DXB', name: 'Dubai International', city: 'Dubai' },
  'saudi-arabia': { iata: 'RUH', name: 'King Khalid International', city: 'Riyadh' },
  india: { iata: 'DEL', name: 'Indira Gandhi International', city: 'Delhi' },
  pakistan: { iata: 'ISB', name: 'Islamabad International', city: 'Islamabad' },
  'united-kingdom': { iata: 'LHR', name: 'London Heathrow', city: 'London' },
  'united-states': { iata: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
  turkey: { iata: 'IST', name: 'Istanbul Airport', city: 'Istanbul' },
  qatar: { iata: 'DOH', name: 'Hamad International', city: 'Doha' },
  egypt: { iata: 'CAI', name: 'Cairo International', city: 'Cairo' },
  japan: { iata: 'NRT', name: 'Narita International', city: 'Tokyo' },
  'south-korea': { iata: 'ICN', name: 'Incheon International', city: 'Seoul' },
  germany: { iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' },
  france: { iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris' },
  australia: { iata: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney' },
  russia: { iata: 'SVO', name: 'Sheremetyevo', city: 'Moscow' },
  ukraine: { iata: 'KBP', name: 'Boryspil International', city: 'Kyiv' },
  china: { iata: 'PEK', name: 'Beijing Capital', city: 'Beijing' },
  lebanon: { iata: 'BEY', name: 'Rafic Hariri International', city: 'Beirut' },
  israel: { iata: 'TLV', name: 'Ben Gurion International', city: 'Tel Aviv' },
  iraq: { iata: 'BGW', name: 'Baghdad International', city: 'Baghdad' },
  iran: { iata: 'IKA', name: 'Imam Khomeini International', city: 'Tehran' },
  jordan: { iata: 'AMM', name: 'Queen Alia International', city: 'Amman' },
  kuwait: { iata: 'KWI', name: 'Kuwait International', city: 'Kuwait City' },
  bahrain: { iata: 'BAH', name: 'Bahrain International', city: 'Manama' },
  oman: { iata: 'MCT', name: 'Muscat International', city: 'Muscat' },
  syria: { iata: 'DAM', name: 'Damascus International', city: 'Damascus' },
  yemen: { iata: 'SAH', name: "Sana'a International", city: "Sana'a" },
  sudan: { iata: 'KRT', name: 'Khartoum International', city: 'Khartoum' },
  palestine: { iata: 'GZA', name: 'Gaza International (Closed)', city: 'Gaza' },
  'north-korea': { iata: 'FNJ', name: 'Pyongyang Sunan', city: 'Pyongyang' },
  nigeria: { iata: 'LOS', name: 'Murtala Muhammed', city: 'Lagos' },
  kenya: { iata: 'NBO', name: 'Jomo Kenyatta', city: 'Nairobi' },
  'south-africa': { iata: 'JNB', name: 'OR Tambo International', city: 'Johannesburg' },
  brazil: { iata: 'GRU', name: 'São Paulo–Guarulhos', city: 'São Paulo' },
  canada: { iata: 'YYZ', name: 'Toronto Pearson', city: 'Toronto' },
  taiwan: { iata: 'TPE', name: 'Taiwan Taoyuan', city: 'Taipei' },
  venezuela: { iata: 'CCS', name: 'Simón Bolívar', city: 'Caracas' },
}

const FR24_BASE = 'https://api.flightradar24.com/common/v1/airport.json'
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

function mapStatus(statusText: string, icon: string): FlightEntry['status'] {
  const t = (statusText || '').toLowerCase()
  if (t.includes('cancel')) return 'cancelled'
  if (t.includes('delay')) return 'delayed'
  if (t.includes('depart') || t.includes('en route') || t.includes('airborne')) return 'departed'
  if (t.includes('land') || t.includes('arrived')) return 'landed'
  if (t.includes('board')) return 'boarding'
  if (t.includes('schedul') || t === '' || t.includes('estimated')) return 'scheduled'
  if (icon === 'green') return 'on-time'
  if (icon === 'red') return 'cancelled'
  if (icon === 'yellow') return 'delayed'
  if (icon === 'grey' || icon === 'gray') return 'landed'
  return 'on-time'
}

function formatTime(ts: number | null): string {
  if (!ts) return '--:--'
  const d = new Date(ts * 1000)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

async function fetchSchedule(iata: string, mode: 'departures' | 'arrivals'): Promise<FlightEntry[]> {
  const url = `${FR24_BASE}?code=${iata.toLowerCase()}&plugin%5B%5D=schedule&plugin-setting%5Bschedule%5D%5Bmode%5D=${mode}&limit=10`

  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    })

    if (!resp.ok) {
      console.warn(`  ⚠ FR24 ${resp.status} for ${iata}/${mode}`)
      return []
    }

    const data = await resp.json()
    const scheduleData = data?.result?.response?.airport?.pluginData?.schedule?.[mode]?.data
    if (!scheduleData || !Array.isArray(scheduleData)) return []

    return scheduleData.map((item: any) => {
      const fl = item.flight
      if (!fl) return null

      const isArrival = mode === 'arrivals'
      const endpoint = isArrival ? fl.airport?.origin : fl.airport?.destination
      const originInfo = isArrival ? fl.airport?.origin : fl.airport?.origin
      const timeKey = isArrival ? 'arrival' : 'departure'

      const destIata = endpoint?.code?.iata || '???'
      const destCity = endpoint?.position?.region?.city || destIata
      const statusText = fl.status?.text || ''
      const statusIcon = fl.status?.icon || ''
      const scheduled = fl.time?.scheduled?.[timeKey]
      const estimated = fl.time?.estimated?.[timeKey]
      const real = fl.time?.real?.[timeKey]

      // Use real > estimated > scheduled time
      const displayTime = real || estimated || scheduled

      const terminalInfo = isArrival
        ? fl.airport?.origin?.info?.terminal
        : fl.airport?.origin?.info?.terminal
      const gateInfo = fl.airport?.origin?.info?.gate

      return {
        flight: fl.identification?.number?.default || '????',
        airline: fl.airline?.name || 'Unknown',
        destination: destCity,
        destIata,
        time: formatTime(displayTime),
        status: mapStatus(statusText, statusIcon),
        statusText: statusText || 'Scheduled',
        type: isArrival ? 'arrival' : 'departure',
        ...(terminalInfo ? { terminal: terminalInfo } : {}),
        ...(gateInfo ? { gate: gateInfo } : {}),
      } as FlightEntry
    }).filter(Boolean) as FlightEntry[]
  } catch (err: any) {
    console.warn(`  ⚠ Error fetching ${iata}/${mode}: ${err.message}`)
    return []
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log('🛫 Fetching real flight data from Flightradar24...')

  const result: Record<string, AirportBoard[]> = {}
  const entries = Object.entries(COUNTRY_AIRPORTS)
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < entries.length; i++) {
    const [slug, airport] = entries[i]
    console.log(`  [${i + 1}/${entries.length}] ${airport.iata} (${airport.city})...`)

    const departures = await fetchSchedule(airport.iata, 'departures')
    // Small delay to avoid rate limiting
    await sleep(800)
    const arrivals = await fetchSchedule(airport.iata, 'arrivals')

    if (departures.length > 0 || arrivals.length > 0) {
      successCount++
    } else {
      failCount++
    }

    result[slug] = [{
      iata: airport.iata,
      name: airport.name,
      city: airport.city,
      departures,
      arrivals,
    }]

    // Delay between airports to avoid rate limiting
    if (i < entries.length - 1) {
      await sleep(1200)
    }
  }

  // Load existing data as fallback for airports that failed
  const existingPath = OUTPUT_PATH
  let existing: any = null
  try {
    existing = JSON.parse(fs.readFileSync(existingPath, 'utf-8'))
  } catch {}

  // Merge: keep existing data for airports that returned empty this time
  if (existing?.airports) {
    for (const [slug, boards] of Object.entries(existing.airports as Record<string, AirportBoard[]>)) {
      if (result[slug]?.[0]?.departures?.length === 0 && result[slug]?.[0]?.arrivals?.length === 0) {
        if (boards?.[0]?.departures?.length > 0) {
          result[slug] = boards
          console.log(`  ↩ Kept cached data for ${slug}`)
        }
      }
    }
  }

  const output = {
    lastUpdated: new Date().toISOString(),
    source: 'Flightradar24',
    airports: result,
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2))
  console.log(`\n✅ Wrote real flight data: ${successCount} airports with data, ${failCount} empty`)
}

main().catch(console.error)
