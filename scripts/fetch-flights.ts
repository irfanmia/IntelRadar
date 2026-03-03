/**
 * Generate contextual flight board data based on advisory levels and news.
 * Reads help-db.json for advisory levels, generates realistic flight boards.
 * Writes to public/data/flights.json
 */

import * as fs from 'fs'
import * as path from 'path'

const ROOT = path.resolve(__dirname, '..')
const HELP_DB_PATH = path.join(ROOT, 'public/data/help-db.json')
const OUTPUT_PATH = path.join(ROOT, 'public/data/flights.json')

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

// Inline airport/airline data to avoid import issues with tsx
const AIRPORTS: Record<string, { iata: string; name: string; city: string }[]> = {
  'united-arab-emirates': [{ iata: 'DXB', name: 'Dubai International', city: 'Dubai' }, { iata: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi' }],
  'saudi-arabia': [{ iata: 'RUH', name: 'King Khalid International', city: 'Riyadh' }, { iata: 'JED', name: 'King Abdulaziz International', city: 'Jeddah' }],
  india: [{ iata: 'DEL', name: 'Indira Gandhi International', city: 'Delhi' }, { iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj', city: 'Mumbai' }],
  pakistan: [{ iata: 'ISB', name: 'Islamabad International', city: 'Islamabad' }, { iata: 'KHI', name: 'Jinnah International', city: 'Karachi' }],
  'united-kingdom': [{ iata: 'LHR', name: 'London Heathrow', city: 'London' }],
  'united-states': [{ iata: 'JFK', name: 'John F. Kennedy International', city: 'New York' }, { iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles' }],
  turkey: [{ iata: 'IST', name: 'Istanbul Airport', city: 'Istanbul' }],
  qatar: [{ iata: 'DOH', name: 'Hamad International', city: 'Doha' }],
  egypt: [{ iata: 'CAI', name: 'Cairo International', city: 'Cairo' }],
  japan: [{ iata: 'NRT', name: 'Narita International', city: 'Tokyo' }, { iata: 'HND', name: 'Tokyo Haneda', city: 'Tokyo' }],
  'south-korea': [{ iata: 'ICN', name: 'Incheon International', city: 'Seoul' }],
  germany: [{ iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' }],
  france: [{ iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris' }],
  australia: [{ iata: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney' }],
  russia: [{ iata: 'SVO', name: 'Sheremetyevo', city: 'Moscow' }],
  ukraine: [{ iata: 'KBP', name: 'Boryspil International', city: 'Kyiv' }],
  china: [{ iata: 'PEK', name: 'Beijing Capital', city: 'Beijing' }],
  lebanon: [{ iata: 'BEY', name: 'Rafic Hariri International', city: 'Beirut' }],
  israel: [{ iata: 'TLV', name: 'Ben Gurion International', city: 'Tel Aviv' }],
  iraq: [{ iata: 'BGW', name: 'Baghdad International', city: 'Baghdad' }],
  iran: [{ iata: 'IKA', name: 'Imam Khomeini International', city: 'Tehran' }],
  jordan: [{ iata: 'AMM', name: 'Queen Alia International', city: 'Amman' }],
  kuwait: [{ iata: 'KWI', name: 'Kuwait International', city: 'Kuwait City' }],
  bahrain: [{ iata: 'BAH', name: 'Bahrain International', city: 'Manama' }],
  oman: [{ iata: 'MCT', name: 'Muscat International', city: 'Muscat' }],
  syria: [{ iata: 'DAM', name: 'Damascus International', city: 'Damascus' }],
  yemen: [{ iata: 'SAH', name: "Sana'a International", city: "Sana'a" }],
  sudan: [{ iata: 'KRT', name: 'Khartoum International', city: 'Khartoum' }],
  palestine: [{ iata: 'GZA', name: 'Gaza International (Closed)', city: 'Gaza' }],
  'north-korea': [{ iata: 'FNJ', name: 'Pyongyang Sunan', city: 'Pyongyang' }],
  nigeria: [{ iata: 'LOS', name: 'Murtala Muhammed', city: 'Lagos' }],
  kenya: [{ iata: 'NBO', name: 'Jomo Kenyatta', city: 'Nairobi' }],
  'south-africa': [{ iata: 'JNB', name: 'OR Tambo International', city: 'Johannesburg' }],
  brazil: [{ iata: 'GRU', name: 'São Paulo–Guarulhos', city: 'São Paulo' }],
  canada: [{ iata: 'YYZ', name: 'Toronto Pearson', city: 'Toronto' }],
  taiwan: [{ iata: 'TPE', name: 'Taiwan Taoyuan', city: 'Taipei' }],
  venezuela: [{ iata: 'CCS', name: 'Simón Bolívar', city: 'Caracas' }],
}

const ROUTES: Record<string, { code: string; airline: string; dests: string[] }[]> = {
  DXB: [{ code: 'EK', airline: 'Emirates', dests: ['LHR', 'JFK', 'BOM', 'DEL', 'CDG', 'SYD', 'ICN', 'NRT', 'IST', 'CAI'] }, { code: 'FZ', airline: 'flydubai', dests: ['IST', 'KHI', 'AMM', 'BAH', 'KWI'] }],
  AUH: [{ code: 'EY', airline: 'Etihad', dests: ['LHR', 'JFK', 'CDG', 'BOM', 'DEL', 'SYD'] }],
  LHR: [{ code: 'BA', airline: 'British Airways', dests: ['JFK', 'DXB', 'CDG', 'FRA', 'IST', 'DEL', 'NRT'] }, { code: 'VS', airline: 'Virgin Atlantic', dests: ['JFK', 'LAX', 'DEL'] }],
  JFK: [{ code: 'DL', airline: 'Delta', dests: ['LHR', 'CDG', 'FRA', 'NRT', 'LAX', 'ORD'] }, { code: 'EK', airline: 'Emirates', dests: ['DXB'] }],
  DOH: [{ code: 'QR', airline: 'Qatar Airways', dests: ['LHR', 'JFK', 'CDG', 'IST', 'DEL', 'BOM', 'NRT', 'SYD', 'CAI'] }],
  IST: [{ code: 'TK', airline: 'Turkish Airlines', dests: ['LHR', 'JFK', 'CDG', 'FRA', 'DXB', 'CAI', 'DEL'] }],
  CAI: [{ code: 'MS', airline: 'EgyptAir', dests: ['LHR', 'CDG', 'FRA', 'DXB', 'DOH', 'IST', 'AMM', 'JED'] }],
  DEL: [{ code: 'AI', airline: 'Air India', dests: ['LHR', 'JFK', 'DXB', 'BOM', 'SYD', 'NRT'] }, { code: '6E', airline: 'IndiGo', dests: ['BOM', 'DXB', 'DOH', 'IST'] }],
  RUH: [{ code: 'SV', airline: 'Saudia', dests: ['LHR', 'CDG', 'CAI', 'IST', 'DXB', 'KHI'] }],
  JED: [{ code: 'SV', airline: 'Saudia', dests: ['CAI', 'IST', 'DXB', 'LHR'] }],
  ICN: [{ code: 'KE', airline: 'Korean Air', dests: ['JFK', 'LAX', 'NRT', 'CDG', 'FRA', 'LHR'] }],
  BOM: [{ code: 'AI', airline: 'Air India', dests: ['LHR', 'JFK', 'DXB', 'DEL', 'DOH'] }],
  SYD: [{ code: 'QF', airline: 'Qantas', dests: ['LHR', 'LAX', 'NRT', 'ICN', 'DXB'] }],
  FRA: [{ code: 'LH', airline: 'Lufthansa', dests: ['JFK', 'LHR', 'CDG', 'NRT', 'DEL', 'DXB'] }],
  CDG: [{ code: 'AF', airline: 'Air France', dests: ['JFK', 'LHR', 'FRA', 'NRT', 'DXB', 'CAI'] }],
  NRT: [{ code: 'NH', airline: 'ANA', dests: ['JFK', 'LHR', 'FRA', 'ICN', 'PEK', 'SYD'] }],
  HND: [{ code: 'JL', airline: 'JAL', dests: ['JFK', 'LHR', 'ICN', 'PEK'] }],
  PEK: [{ code: 'CA', airline: 'Air China', dests: ['JFK', 'LHR', 'CDG', 'NRT', 'ICN'] }],
  SVO: [{ code: 'SU', airline: 'Aeroflot', dests: ['IST', 'PEK', 'DEL'] }],
  BEY: [{ code: 'ME', airline: 'MEA', dests: ['CDG', 'LHR', 'IST', 'CAI', 'AMM', 'DXB'] }],
  TLV: [{ code: 'LY', airline: 'El Al', dests: ['JFK', 'LHR', 'CDG', 'FRA', 'IST'] }],
  BGW: [{ code: 'IA', airline: 'Iraqi Airways', dests: ['IST', 'AMM', 'DXB', 'CAI'] }],
  IKA: [{ code: 'IR', airline: 'Iran Air', dests: ['IST', 'DXB', 'DEL', 'PEK'] }],
  ISB: [{ code: 'PK', airline: 'PIA', dests: ['DXB', 'LHR', 'IST', 'JED', 'DOH'] }],
  KHI: [{ code: 'PK', airline: 'PIA', dests: ['DXB', 'LHR', 'IST', 'JED'] }],
  AMM: [{ code: 'RJ', airline: 'Royal Jordanian', dests: ['LHR', 'CDG', 'DXB', 'CAI', 'IST'] }],
  KWI: [{ code: 'KU', airline: 'Kuwait Airways', dests: ['LHR', 'DXB', 'CAI', 'BOM'] }],
  BAH: [{ code: 'GF', airline: 'Gulf Air', dests: ['LHR', 'DXB', 'IST', 'BOM'] }],
  MCT: [{ code: 'WY', airline: 'Oman Air', dests: ['LHR', 'DXB', 'BOM', 'IST'] }],
  LAX: [{ code: 'AA', airline: 'American Airlines', dests: ['JFK', 'LHR', 'NRT', 'SYD'] }],
  NBO: [{ code: 'KQ', airline: 'Kenya Airways', dests: ['LHR', 'DXB', 'JNB', 'CDG'] }],
  JNB: [{ code: 'SA', airline: 'South African Airways', dests: ['LHR', 'JFK', 'NBO', 'CDG'] }],
  LOS: [{ code: 'W3', airline: 'Arik Air', dests: ['LHR', 'JNB', 'NBO'] }],
  GRU: [{ code: 'LA', airline: 'LATAM', dests: ['JFK', 'LHR', 'CDG', 'FRA'] }],
  YYZ: [{ code: 'AC', airline: 'Air Canada', dests: ['LHR', 'JFK', 'FRA', 'NRT', 'CDG'] }],
  TPE: [{ code: 'CI', airline: 'China Airlines', dests: ['NRT', 'ICN', 'LAX', 'JFK', 'LHR'] }],
}

const IATA_CITY: Record<string, string> = {
  DXB: 'Dubai', AUH: 'Abu Dhabi', LHR: 'London', JFK: 'New York', LAX: 'Los Angeles', ORD: 'Chicago',
  CDG: 'Paris', FRA: 'Frankfurt', IST: 'Istanbul', CAI: 'Cairo', DEL: 'Delhi', BOM: 'Mumbai',
  BLR: 'Bangalore', NRT: 'Tokyo', HND: 'Tokyo', ICN: 'Seoul', SYD: 'Sydney', DOH: 'Doha',
  RUH: 'Riyadh', JED: 'Jeddah', SVO: 'Moscow', PEK: 'Beijing', PVG: 'Shanghai', BEY: 'Beirut',
  TLV: 'Tel Aviv', BGW: 'Baghdad', IKA: 'Tehran', ISB: 'Islamabad', KHI: 'Karachi', LHE: 'Lahore',
  AMM: 'Amman', KWI: 'Kuwait City', BAH: 'Manama', MCT: 'Muscat', DAM: 'Damascus', SAH: "Sana'a",
  KRT: 'Khartoum', GZA: 'Gaza', FNJ: 'Pyongyang', LOS: 'Lagos', ABV: 'Abuja', NBO: 'Nairobi',
  JNB: 'Johannesburg', GRU: 'São Paulo', YYZ: 'Toronto', TPE: 'Taipei', CCS: 'Caracas',
  MEL: 'Melbourne', LGW: 'London', SAW: 'Istanbul', EBL: 'Erbil', KBP: 'Kyiv',
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

function generateFlights(
  airportIata: string,
  advisoryLevel: number,
  airportStatus: string,
  rand: () => number,
): { departures: FlightEntry[]; arrivals: FlightEntry[] } {
  const routes = ROUTES[airportIata] || [{ code: 'LC', airline: 'Local Carrier', dests: ['DXB', 'LHR', 'IST'] }]
  const departures: FlightEntry[] = []
  const arrivals: FlightEntry[] = []

  // Determine status distribution based on advisory level
  const getStatus = (): FlightEntry['status'] => {
    if (airportStatus === 'closed') return 'suspended'
    const r = rand()
    if (advisoryLevel === 4) {
      if (r < 0.5) return 'cancelled'
      if (r < 0.7) return 'suspended'
      if (r < 0.9) return 'delayed'
      return 'on-time'
    }
    if (advisoryLevel === 3) {
      if (r < 0.2) return 'cancelled'
      if (r < 0.45) return 'delayed'
      if (r < 0.6) return 'departed'
      return 'on-time'
    }
    if (advisoryLevel === 2) {
      if (r < 0.05) return 'cancelled'
      if (r < 0.2) return 'delayed'
      if (r < 0.4) return 'departed'
      return 'on-time'
    }
    // Level 1 - normal
    if (r < 0.02) return 'cancelled'
    if (r < 0.1) return 'delayed'
    if (r < 0.35) return 'departed'
    if (r < 0.45) return 'boarding'
    return 'on-time'
  }

  // Use current hour as base for times
  const now = new Date()
  const baseHour = now.getUTCHours()

  let flightNum = 100 + Math.floor(rand() * 900)

  for (const route of routes) {
    for (const dest of route.dests.slice(0, 4)) {
      const hour = (baseHour + Math.floor(rand() * 8)) % 24
      const min = Math.floor(rand() * 4) * 15
      const time = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
      const status = getStatus()

      departures.push({
        flight: `${route.code}${flightNum}`,
        airline: route.airline,
        destination: IATA_CITY[dest] || dest,
        destIata: dest,
        time,
        status,
        type: 'departure',
      })
      flightNum++

      // Generate a corresponding arrival
      const arrHour = (baseHour - 1 + Math.floor(rand() * 6)) % 24
      const arrMin = Math.floor(rand() * 4) * 15
      const arrStatus = getStatus()
      arrivals.push({
        flight: `${route.code}${flightNum}`,
        airline: route.airline,
        destination: IATA_CITY[dest] || dest,
        destIata: dest,
        time: `${String(arrHour < 0 ? arrHour + 24 : arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`,
        status: arrStatus === 'departed' ? 'landed' : arrStatus,
        type: 'arrival',
      })
      flightNum++
    }
  }

  // Sort by time
  departures.sort((a, b) => a.time.localeCompare(b.time))
  arrivals.sort((a, b) => a.time.localeCompare(b.time))

  return { departures: departures.slice(0, 10), arrivals: arrivals.slice(0, 10) }
}

async function main() {
  const helpDb = JSON.parse(fs.readFileSync(HELP_DB_PATH, 'utf-8'))
  const countries = helpDb.countries as Record<string, any>

  const result: Record<string, AirportBoard[]> = {}

  // Use date as seed so flights change daily but are stable within a day
  const dateSeed = Math.floor(Date.now() / (1000 * 60 * 60)) // changes hourly

  for (const [slug, data] of Object.entries(countries)) {
    const airports = AIRPORTS[slug]
    if (!airports) continue

    const boards: AirportBoard[] = []
    for (const apt of airports) {
      const seed = dateSeed + apt.iata.charCodeAt(0) * 1000 + apt.iata.charCodeAt(1) * 100
      const rand = seededRandom(seed)
      const { departures, arrivals } = generateFlights(
        apt.iata,
        data.advisoryLevel || 1,
        data.airportStatus || 'open',
        rand,
      )
      boards.push({
        iata: apt.iata,
        name: apt.name,
        city: apt.city,
        departures,
        arrivals,
      })
    }
    result[slug] = boards
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ lastUpdated: new Date().toISOString(), airports: result }, null, 2))
  console.log(`✅ Wrote flights data for ${Object.keys(result).length} countries`)
}

main().catch(console.error)
