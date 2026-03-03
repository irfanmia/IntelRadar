export interface ImpactEvent {
  id: string
  label: string
  emoji: string
}

export const EVENT_META: Record<string, ImpactEvent> = {
  'middle-east': { id: 'middle-east', label: 'US-Israel-Iran War', emoji: '🔥' },
  'ukraine-russia': { id: 'ukraine-russia', label: 'Ukraine-Russia', emoji: '⚔️' },
  'china-taiwan': { id: 'china-taiwan', label: 'China-Taiwan', emoji: '🌊' },
  'taliban-pakistan': { id: 'taliban-pakistan', label: 'Taliban-Pakistan', emoji: '🏔️' },
  'venezuela': { id: 'venezuela', label: 'Venezuela Crisis', emoji: '🛢️' },
  'sudan': { id: 'sudan', label: 'Sudan Civil War', emoji: '🇸🇩' },
  'korea': { id: 'korea', label: 'Korean Peninsula', emoji: '🚀' },
  'sahel': { id: 'sahel', label: 'Sahel Conflict', emoji: '🏜️' },
}

// Static fallback mapping
const COUNTRY_IMPACT_STATIC: Record<string, string[]> = {
  'iran': ['middle-east'], 'israel': ['middle-east'], 'palestine': ['middle-east'],
  'lebanon': ['middle-east'], 'syria': ['middle-east', 'ukraine-russia'],
  'iraq': ['middle-east'], 'yemen': ['middle-east'],
  'united-arab-emirates': ['middle-east', 'sudan'],
  'saudi-arabia': ['middle-east', 'sudan', 'sahel'],
  'qatar': ['middle-east'], 'kuwait': ['middle-east'], 'bahrain': ['middle-east'],
  'oman': ['middle-east'], 'jordan': ['middle-east'],
  'egypt': ['middle-east', 'sudan'],
  'turkey': ['middle-east', 'ukraine-russia'],
  'pakistan': ['taliban-pakistan', 'middle-east', 'china-taiwan'],
  'india': ['middle-east', 'taliban-pakistan', 'china-taiwan'],
  'united-states': ['middle-east', 'ukraine-russia', 'china-taiwan', 'korea', 'venezuela'],
  'united-kingdom': ['ukraine-russia', 'middle-east'],
  'germany': ['ukraine-russia', 'middle-east'],
  'france': ['ukraine-russia', 'middle-east', 'sahel'],
  'ukraine': ['ukraine-russia'], 'russia': ['ukraine-russia', 'middle-east'],
  'taiwan': ['china-taiwan', 'korea'],
  'china': ['china-taiwan', 'korea', 'middle-east'],
  'south-korea': ['korea', 'china-taiwan'], 'north-korea': ['korea', 'china-taiwan'],
  'venezuela': ['venezuela', 'middle-east'],
  'sudan': ['sudan', 'sahel', 'middle-east'],
  'nigeria': ['sahel', 'sudan'], 'kenya': ['sudan', 'sahel'],
  'south-africa': ['middle-east', 'sudan'],
  'brazil': ['venezuela', 'middle-east'],
  'canada': ['ukraine-russia', 'middle-east', 'china-taiwan'],
  'australia': ['china-taiwan', 'korea', 'middle-east'],
  'japan': ['china-taiwan', 'korea', 'middle-east'],
  'afghanistan': ['taliban-pakistan', 'middle-east'],
  'colombia': ['venezuela'],
  'algeria': ['sahel', 'middle-east'], 'libya': ['middle-east', 'sahel'],
  'morocco': ['sahel', 'middle-east'], 'ethiopia': ['sudan'],
  'somalia': ['middle-east', 'sudan'],
  'bangladesh': ['middle-east', 'taliban-pakistan'],
  'indonesia': ['middle-east', 'china-taiwan'],
  'malaysia': ['middle-east', 'china-taiwan'],
  'philippines': ['china-taiwan', 'middle-east'],
  'singapore': ['china-taiwan', 'middle-east'],
  'thailand': ['china-taiwan', 'middle-east'],
  'vietnam': ['china-taiwan', 'middle-east'],
  'sri-lanka': ['middle-east', 'china-taiwan'],
  'nepal': ['middle-east', 'china-taiwan'],
  'myanmar': ['china-taiwan', 'middle-east'],
  'new-zealand': ['china-taiwan', 'middle-east'],
  'mexico': ['venezuela', 'middle-east'],
  'south-sudan': ['sudan', 'sahel'],
  'mali': ['sahel', 'sudan'], 'niger': ['sahel', 'sudan'],
  'burkina-faso': ['sahel', 'sudan'],
  'democratic-republic-of-congo': ['sudan', 'sahel'],
}

const DEFAULT_EVENTS = ['middle-east']

// Dynamic data cache (loaded from impact-events.json via useLiveFeed or at runtime)
let dynamicCountryEvents: Record<string, string[]> | null = null
let dynamicGlobalRanking: { id: string; score: number; count: number; breaking: number }[] | null = null

/**
 * Set dynamic impact data (called from frontend after loading impact-events.json)
 */
export function setDynamicImpactData(data: {
  countryEvents?: Record<string, string[]>
  globalRanking?: { id: string; score: number; count: number; breaking: number }[]
}) {
  if (data.countryEvents) dynamicCountryEvents = data.countryEvents
  if (data.globalRanking) dynamicGlobalRanking = data.globalRanking
}

/**
 * Get impact events for a country, using dynamic data if available
 */
export function getImpactEvents(countrySlug: string): ImpactEvent[] {
  const ids = getImpactEventIds(countrySlug)
  return ids.map(id => EVENT_META[id]).filter(Boolean)
}

/**
 * Get ordered impact event IDs for a country
 * Uses dynamic (news-scored) data first, falls back to static
 */
export function getImpactEventIds(countrySlug: string): string[] {
  // Dynamic data takes priority — it's re-ranked by current news volume
  if (dynamicCountryEvents && dynamicCountryEvents[countrySlug]) {
    return dynamicCountryEvents[countrySlug]
  }
  return COUNTRY_IMPACT_STATIC[countrySlug] || DEFAULT_EVENTS
}

/**
 * Get the global ranking of all events (by news score)
 */
export function getGlobalRanking() {
  return dynamicGlobalRanking || []
}
