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

// All international airports per country
type AirportInfo = { iata: string; name: string; city: string }
const COUNTRY_AIRPORTS: Record<string, AirportInfo[]> = {
  'united-arab-emirates': [
    { iata: 'DXB', name: 'Dubai International', city: 'Dubai' },
    { iata: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi' },
    { iata: 'SHJ', name: 'Sharjah International', city: 'Sharjah' },
    { iata: 'DWC', name: 'Al Maktoum International', city: 'Dubai' },
    { iata: 'RKT', name: 'Ras Al Khaimah International', city: 'Ras Al Khaimah' },
  ],
  'saudi-arabia': [
    { iata: 'RUH', name: 'King Khalid International', city: 'Riyadh' },
    { iata: 'JED', name: 'King Abdulaziz International', city: 'Jeddah' },
  ],
  india: [
    { iata: 'DEL', name: 'Indira Gandhi International', city: 'Delhi' },
    { iata: 'BOM', name: 'Chhatrapati Shivaji International', city: 'Mumbai' },
  ],
  pakistan: [
    { iata: 'ISB', name: 'Islamabad International', city: 'Islamabad' },
    { iata: 'KHI', name: 'Jinnah International', city: 'Karachi' },
  ],
  'united-kingdom': [
    { iata: 'LHR', name: 'London Heathrow', city: 'London' },
    { iata: 'LGW', name: 'London Gatwick', city: 'London' },
  ],
  'united-states': [
    { iata: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
    { iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles' },
  ],
  turkey: [
    { iata: 'IST', name: 'Istanbul Airport', city: 'Istanbul' },
    { iata: 'SAW', name: 'Sabiha Gökçen', city: 'Istanbul' },
  ],
  qatar: [{ iata: 'DOH', name: 'Hamad International', city: 'Doha' }],
  egypt: [
    { iata: 'CAI', name: 'Cairo International', city: 'Cairo' },
    { iata: 'HRG', name: 'Hurghada International', city: 'Hurghada' },
    { iata: 'SSH', name: 'Sharm El Sheikh International', city: 'Sharm El Sheikh' },
  ],
  japan: [
    { iata: 'NRT', name: 'Narita International', city: 'Tokyo' },
    { iata: 'HND', name: 'Haneda Airport', city: 'Tokyo' },
    { iata: 'KIX', name: 'Kansai International', city: 'Osaka' },
  ],
  'south-korea': [
    { iata: 'ICN', name: 'Incheon International', city: 'Seoul' },
    { iata: 'GMP', name: 'Gimpo International', city: 'Seoul' },
  ],
  germany: [
    { iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' },
    { iata: 'MUC', name: 'Munich Airport', city: 'Munich' },
    { iata: 'BER', name: 'Berlin Brandenburg', city: 'Berlin' },
  ],
  france: [
    { iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris' },
    { iata: 'ORY', name: 'Paris Orly', city: 'Paris' },
    { iata: 'NCE', name: 'Nice Côte d\'Azur', city: 'Nice' },
  ],
  australia: [
    { iata: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney' },
    { iata: 'MEL', name: 'Melbourne Tullamarine', city: 'Melbourne' },
    { iata: 'BNE', name: 'Brisbane Airport', city: 'Brisbane' },
  ],
  russia: [
    { iata: 'SVO', name: 'Sheremetyevo', city: 'Moscow' },
    { iata: 'DME', name: 'Domodedovo', city: 'Moscow' },
    { iata: 'LED', name: 'Pulkovo Airport', city: 'St. Petersburg' },
  ],
  ukraine: [{ iata: 'KBP', name: 'Boryspil International', city: 'Kyiv' }],
  china: [
    { iata: 'PEK', name: 'Beijing Capital', city: 'Beijing' },
    { iata: 'PVG', name: 'Shanghai Pudong', city: 'Shanghai' },
    { iata: 'CAN', name: 'Guangzhou Baiyun', city: 'Guangzhou' },
    { iata: 'HKG', name: 'Hong Kong International', city: 'Hong Kong' },
  ],
  lebanon: [{ iata: 'BEY', name: 'Rafic Hariri International', city: 'Beirut' }],
  israel: [{ iata: 'TLV', name: 'Ben Gurion International', city: 'Tel Aviv' }],
  iraq: [
    { iata: 'BGW', name: 'Baghdad International', city: 'Baghdad' },
    { iata: 'EBL', name: 'Erbil International', city: 'Erbil' },
  ],
  iran: [
    { iata: 'IKA', name: 'Imam Khomeini International', city: 'Tehran' },
    { iata: 'THR', name: 'Mehrabad International', city: 'Tehran' },
    { iata: 'MHD', name: 'Mashhad International', city: 'Mashhad' },
  ],
  jordan: [{ iata: 'AMM', name: 'Queen Alia International', city: 'Amman' }],
  kuwait: [{ iata: 'KWI', name: 'Kuwait International', city: 'Kuwait City' }],
  bahrain: [{ iata: 'BAH', name: 'Bahrain International', city: 'Manama' }],
  oman: [
    { iata: 'MCT', name: 'Muscat International', city: 'Muscat' },
    { iata: 'SLL', name: 'Salalah Airport', city: 'Salalah' },
  ],
  syria: [{ iata: 'DAM', name: 'Damascus International', city: 'Damascus' }],
  yemen: [{ iata: 'SAH', name: "Sana'a International", city: "Sana'a" }],
  sudan: [{ iata: 'KRT', name: 'Khartoum International', city: 'Khartoum' }],
  palestine: [{ iata: 'GZA', name: 'Gaza International (Closed)', city: 'Gaza' }],
  'north-korea': [{ iata: 'FNJ', name: 'Pyongyang Sunan', city: 'Pyongyang' }],
  nigeria: [
    { iata: 'LOS', name: 'Murtala Muhammed', city: 'Lagos' },
    { iata: 'ABV', name: 'Nnamdi Azikiwe', city: 'Abuja' },
  ],
  kenya: [{ iata: 'NBO', name: 'Jomo Kenyatta', city: 'Nairobi' }],
  'south-africa': [
    { iata: 'JNB', name: 'OR Tambo International', city: 'Johannesburg' },
    { iata: 'CPT', name: 'Cape Town International', city: 'Cape Town' },
  ],
  brazil: [
    { iata: 'GRU', name: 'São Paulo–Guarulhos', city: 'São Paulo' },
    { iata: 'GIG', name: 'Rio de Janeiro–Galeão', city: 'Rio de Janeiro' },
  ],
  canada: [
    { iata: 'YYZ', name: 'Toronto Pearson', city: 'Toronto' },
    { iata: 'YVR', name: 'Vancouver International', city: 'Vancouver' },
    { iata: 'YUL', name: 'Montréal-Trudeau', city: 'Montréal' },
  ],
  taiwan: [{ iata: 'TPE', name: 'Taiwan Taoyuan', city: 'Taipei' }],
  venezuela: [{ iata: 'CCS', name: 'Simón Bolívar', city: 'Caracas' }],
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
  const url = `${FR24_BASE}?code=${iata.toLowerCase()}&plugin%5B%5D=schedule&plugin-setting%5Bschedule%5D%5Bmode%5D=${mode}&limit=15`

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
  let totalAirports = 0

  for (let i = 0; i < entries.length; i++) {
    const [slug, airports] = entries[i]
    result[slug] = []

    for (let j = 0; j < airports.length; j++) {
      const airport = airports[j]
      totalAirports++
      console.log(`  [${totalAirports}] ${airport.iata} (${airport.city}) — ${slug}...`)

      const departures = await fetchSchedule(airport.iata, 'departures')
      await sleep(800)
      const arrivals = await fetchSchedule(airport.iata, 'arrivals')

      if (departures.length > 0 || arrivals.length > 0) {
        successCount++
      } else {
        failCount++
      }

      result[slug].push({
        iata: airport.iata,
        name: airport.name,
        city: airport.city,
        departures,
        arrivals,
      })

      // Delay between airports to avoid rate limiting
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
      if (!result[slug]) continue
      for (let k = 0; k < result[slug].length; k++) {
        const cur = result[slug][k]
        if (cur.departures.length === 0 && cur.arrivals.length === 0) {
          const cached = (boards || []).find(b => b.iata === cur.iata)
          if (cached && (cached.departures?.length > 0 || cached.arrivals?.length > 0)) {
            result[slug][k] = cached
            console.log(`  ↩ Kept cached data for ${cur.iata}`)
          }
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
