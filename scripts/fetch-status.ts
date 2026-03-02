#!/usr/bin/env npx tsx
/**
 * IntelRadar Country Status Fetcher
 * Updates help-db.json with REAL data from:
 * 1. US State Dept Travel Advisories (RSS)
 * 2. IODA Internet Outage Detection (API)
 * 3. Airport status derived from advisories + news keywords
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

function log(msg: string) { console.log(`[${new Date().toISOString()}] ${msg}`) }

// --- Country name → ISO2 mapping (for IODA) ---
const NAME_TO_ISO2: Record<string, string> = {
  'afghanistan': 'AF', 'algeria': 'DZ', 'bahrain': 'BH', 'bangladesh': 'BD',
  'brazil': 'BR', 'burkina-faso': 'BF', 'canada': 'CA', 'china': 'CN',
  'colombia': 'CO', 'democratic-republic-of-congo': 'CD', 'egypt': 'EG',
  'ethiopia': 'ET', 'france': 'FR', 'germany': 'DE', 'india': 'IN',
  'indonesia': 'ID', 'iran': 'IR', 'iraq': 'IQ', 'israel': 'IL',
  'japan': 'JP', 'jordan': 'JO', 'kenya': 'KE', 'kuwait': 'KW',
  'lebanon': 'LB', 'libya': 'LY', 'mali': 'ML', 'mexico': 'MX',
  'morocco': 'MA', 'myanmar': 'MM', 'niger': 'NE', 'nigeria': 'NG',
  'north-korea': 'KP', 'oman': 'OM', 'pakistan': 'PK', 'palestine': 'PS',
  'qatar': 'QA', 'russia': 'RU', 'saudi-arabia': 'SA', 'somalia': 'SO',
  'south-korea': 'KR', 'south-sudan': 'SS', 'sudan': 'SD', 'syria': 'SY',
  'taiwan': 'TW', 'turkey': 'TR', 'ukraine': 'UA', 'united-arab-emirates': 'AE',
  'united-kingdom': 'GB', 'united-states': 'US', 'venezuela': 'VE', 'yemen': 'YE',
  'australia': 'AU', 'new-zealand': 'NZ', 'south-africa': 'ZA', 'thailand': 'TH',
  'vietnam': 'VN', 'philippines': 'PH', 'singapore': 'SG', 'malaysia': 'MY',
  'sri-lanka': 'LK', 'nepal': 'NP',
}

// Reverse: country display name → slug (approximate)
const ADVISORY_NAME_MAP: Record<string, string> = {
  'United Arab Emirates': 'united-arab-emirates',
  'Saudi Arabia': 'saudi-arabia',
  'South Korea': 'south-korea',
  'North Korea': 'north-korea',
  'United Kingdom': 'united-kingdom',
  'United States': 'united-states',
  'South Africa': 'south-africa',
  'South Sudan': 'south-sudan',
  'New Zealand': 'new-zealand',
  'Burkina Faso': 'burkina-faso',
  'Sri Lanka': 'sri-lanka',
  'Democratic Republic of Congo': 'democratic-republic-of-congo',
}

function nameToSlug(name: string): string {
  if (ADVISORY_NAME_MAP[name]) return ADVISORY_NAME_MAP[name]
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// --- 1. Fetch US State Dept Travel Advisories ---
async function fetchAdvisories(): Promise<Map<string, { level: number; note: string }>> {
  const map = new Map<string, { level: number; note: string }>()
  try {
    log('Fetching US State Dept travel advisories...')
    const res = await fetch('https://travel.state.gov/_res/rss/TAsTWs.xml', {
      headers: { 'User-Agent': 'IntelRadar/1.0' },
      signal: AbortSignal.timeout(15000),
    })
    const xml = await res.text()

    // Parse items: title format is "Country - Level N: Description" or "Country Travel Advisory - Level N: ..."
    const itemRegex = /<item[^>]*>(.*?)<\/item>/gs
    let match
    while ((match = itemRegex.exec(xml)) !== null) {
      const titleMatch = match[1].match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s)
      if (!titleMatch) continue
      const title = titleMatch[1].trim()

      // Parse: "Country Name - Level N: Description" or "Country Name Travel Advisory - Level N: ..."
      const levelMatch = title.match(/^(.+?)(?:\s+Travel Advisory)?\s*-\s*Level\s+(\d):\s*(.+)$/i)
      if (!levelMatch) continue

      const countryName = levelMatch[1].trim()
      const level = parseInt(levelMatch[2])
      const note = levelMatch[3].trim()
      const slug = nameToSlug(countryName)

      map.set(slug, { level, note })
    }
    log(`  Got ${map.size} advisories`)
  } catch (e: any) {
    log(`  ERROR: ${e.message}`)
  }
  return map
}

// --- 2. Fetch IODA Internet Status ---
async function fetchInternetStatus(countryCodes: string[]): Promise<Map<string, 'normal' | 'disrupted' | 'blackout'>> {
  const map = new Map<string, 'normal' | 'disrupted' | 'blackout'>()
  const now = Math.floor(Date.now() / 1000)
  const hourAgo = now - 3600

  // Fetch all in parallel (batches of 10)
  const batchSize = 10
  for (let i = 0; i < countryCodes.length; i += batchSize) {
    const batch = countryCodes.slice(i, i + batchSize)
    await Promise.all(batch.map(async (code) => {
      try {
        const url = `https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/country/${code}?from=${hourAgo}&until=${now}`
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
        const data = await res.json()

        if (data.data && data.data[0]) {
          let status: 'normal' | 'disrupted' | 'blackout' = 'normal'

          for (const signal of data.data[0]) {
            if (signal.datasource === 'bgp' && signal.values) {
              const vals = signal.values.filter((v: any) => v !== null)
              if (vals.length >= 2) {
                const latest = vals[vals.length - 1]
                const baseline = vals[0]
                if (latest < baseline * 0.3) status = 'blackout'
                else if (latest < baseline * 0.7) status = 'disrupted'
              }
            }
            if (signal.datasource === 'ping-slash24' && signal.values) {
              const vals = signal.values.filter((v: any) => v !== null)
              if (vals.length >= 2) {
                const latest = vals[vals.length - 1]
                const baseline = vals[0]
                if (latest < baseline * 0.3 && status !== 'blackout') status = 'blackout'
                else if (latest < baseline * 0.7 && status === 'normal') status = 'disrupted'
              }
            }
          }
          map.set(code, status)
        }
      } catch {
        // Skip on error
      }
    }))
  }
  log(`  Got internet status for ${map.size} countries`)
  return map
}

// --- 3. Derive airport & comms status from multiple signals ---
type AirportStatus = 'open' | 'closed' | 'restricted' | 'partially-open' | 'frequent-cancellations' | 'diversions-active'
type CommsStatus = 'normal' | 'disrupted' | 'blackout' | 'partially-disrupted'

function deriveAirportStatus(
  advisoryLevel: number,
  commsStatus: string,
  countryName: string,
  newsHeadlines: string[]
): AirportStatus {
  const lower = newsHeadlines.join(' ').toLowerCase()
  const countryLower = countryName.toLowerCase()

  // Check news for airport-specific signals about this country
  const relevantNews = lower.includes(countryLower) || lower.includes(countryLower.split(' ')[0])

  if (advisoryLevel >= 4 || commsStatus === 'blackout') return 'closed'

  if (relevantNews) {
    if (lower.includes('airspace closed') || lower.includes('airports closed') || lower.includes('no-fly zone'))
      return 'closed'
    if (lower.includes('airspace partially') || lower.includes('some flights') || lower.includes('limited flights'))
      return 'partially-open'
    if (lower.includes('divert') || lower.includes('reroute') || lower.includes('diverted'))
      return 'diversions-active'
    if (lower.includes('cancel') && (lower.includes('flight') || lower.includes('airline')))
      return 'frequent-cancellations'
    if (lower.includes('airport restrict') || lower.includes('airspace restrict'))
      return 'restricted'
  }

  if (advisoryLevel >= 3) return 'restricted'
  if (advisoryLevel === 2 && commsStatus === 'disrupted') return 'frequent-cancellations'
  return 'open'
}

function refineCommsStatus(
  iodaStatus: 'normal' | 'disrupted' | 'blackout',
  advisoryLevel: number,
  countryName: string,
  newsHeadlines: string[]
): CommsStatus {
  const lower = newsHeadlines.join(' ').toLowerCase()
  const countryLower = countryName.toLowerCase()
  const relevant = lower.includes(countryLower) || lower.includes(countryLower.split(' ')[0])

  if (iodaStatus === 'blackout') return 'blackout'
  if (iodaStatus === 'disrupted') return 'disrupted'

  if (relevant) {
    if (lower.includes('internet blackout') || lower.includes('internet shutdown') || lower.includes('communications cut'))
      return 'blackout'
    if (lower.includes('internet disrupted') || lower.includes('internet slow') || lower.includes('social media blocked'))
      return 'disrupted'
    if (lower.includes('internet throttl') || lower.includes('partial outage') || lower.includes('intermittent'))
      return 'partially-disrupted'
  }

  return iodaStatus
}

// --- Main ---
async function main() {
  log('=== IntelRadar Status Fetch Started ===')

  const dbPath = join(import.meta.dirname || __dirname, '..', 'public', 'data', 'help-db.json')
  const feedPath = join(import.meta.dirname || __dirname, '..', 'public', 'data', 'live-feed.json')
  const db = JSON.parse(readFileSync(dbPath, 'utf-8'))
  const slugs = Object.keys(db.countries)

  // Load recent news headlines for context-aware status derivation
  let newsHeadlines: string[] = []
  try {
    const feed = JSON.parse(readFileSync(feedPath, 'utf-8'))
    newsHeadlines = (feed.news || []).map((n: any) => `${n.headline} ${n.summary}`).slice(0, 200)
    log(`  Loaded ${newsHeadlines.length} news headlines for context`)
  } catch {
    log('  No live-feed.json found, skipping news context')
  }

  // 1. Fetch advisories
  const advisories = await fetchAdvisories()

  // 2. Fetch internet status for all countries we have
  const iso2Codes: string[] = []
  const iso2ToSlug = new Map<string, string>()
  for (const slug of slugs) {
    const code = NAME_TO_ISO2[slug]
    if (code) {
      iso2Codes.push(code)
      iso2ToSlug.set(code, slug)
    }
  }

  log(`Fetching internet status for ${iso2Codes.length} countries...`)
  const internetStatus = await fetchInternetStatus(iso2Codes)

  // 3. Update help-db.json
  let updated = 0
  for (const slug of slugs) {
    const country = db.countries[slug]
    let changed = false

    // Update advisory
    const advisory = advisories.get(slug)
    if (advisory) {
      if (country.advisoryLevel !== advisory.level || country.advisoryNote !== advisory.note) {
        country.advisoryLevel = advisory.level
        country.advisoryNote = advisory.note
        changed = true
      }
    }

    // Update comms status (IODA + news context)
    const iso2 = NAME_TO_ISO2[slug]
    const iodaStatus = (iso2 && internetStatus.has(iso2)) ? internetStatus.get(iso2)! : 'normal' as const
    const newComms = refineCommsStatus(iodaStatus, country.advisoryLevel, country.name, newsHeadlines)
    if (country.commsStatus !== newComms) {
      country.commsStatus = newComms
      changed = true
    }

    // Update airport status (advisory + comms + news context)
    const newAirport = deriveAirportStatus(country.advisoryLevel, country.commsStatus, country.name, newsHeadlines)
    if (country.airportStatus !== newAirport) {
      country.airportStatus = newAirport
      changed = true
    }

    if (changed) {
      updated++
      log(`  Updated: ${country.name} → Advisory L${country.advisoryLevel}, Comms: ${country.commsStatus}, Airport: ${country.airportStatus}`)
    }
  }

  db.lastUpdated = new Date().toISOString()
  writeFileSync(dbPath, JSON.stringify(db, null, 2))
  log(`Updated ${updated} countries, written to ${dbPath}`)
  log('=== Status Fetch Complete ===')
}

main().catch(e => { console.error(e); process.exit(1) })
