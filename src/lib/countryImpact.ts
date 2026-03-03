export interface ImpactEvent {
  id: string
  label: string
  emoji: string
}

const EVENT_META: Record<string, ImpactEvent> = {
  'middle-east': { id: 'middle-east', label: 'US-Israel-Iran War', emoji: '🔥' },
  'ukraine-russia': { id: 'ukraine-russia', label: 'Ukraine-Russia', emoji: '⚔️' },
  'china-taiwan': { id: 'china-taiwan', label: 'China-Taiwan', emoji: '🌊' },
  'taliban-pakistan': { id: 'taliban-pakistan', label: 'Taliban-Pakistan', emoji: '🏔️' },
  'venezuela': { id: 'venezuela', label: 'Venezuela Crisis', emoji: '🛢️' },
  'sudan': { id: 'sudan', label: 'Sudan Civil War', emoji: '🇸🇩' },
  'korea': { id: 'korea', label: 'Korean Peninsula', emoji: '🚀' },
  'sahel': { id: 'sahel', label: 'Sahel Conflict', emoji: '🏜️' },
}

const COUNTRY_IMPACT: Record<string, string[]> = {
  'iran': ['middle-east'],
  'israel': ['middle-east'],
  'palestine': ['middle-east'],
  'lebanon': ['middle-east'],
  'syria': ['middle-east', 'ukraine-russia'],
  'iraq': ['middle-east'],
  'yemen': ['middle-east'],
  'united-arab-emirates': ['middle-east', 'sudan'],
  'saudi-arabia': ['middle-east', 'sudan', 'sahel'],
  'qatar': ['middle-east'],
  'kuwait': ['middle-east'],
  'bahrain': ['middle-east'],
  'oman': ['middle-east'],
  'jordan': ['middle-east'],
  'egypt': ['middle-east', 'sudan'],
  'turkey': ['middle-east', 'ukraine-russia'],
  'pakistan': ['taliban-pakistan', 'middle-east', 'china-taiwan'],
  'india': ['middle-east', 'taliban-pakistan', 'china-taiwan'],
  'united-states': ['middle-east', 'ukraine-russia', 'china-taiwan', 'korea', 'venezuela'],
  'united-kingdom': ['ukraine-russia', 'middle-east'],
  'germany': ['ukraine-russia', 'middle-east'],
  'france': ['ukraine-russia', 'middle-east', 'sahel'],
  'ukraine': ['ukraine-russia'],
  'russia': ['ukraine-russia', 'middle-east'],
  'taiwan': ['china-taiwan', 'korea'],
  'china': ['china-taiwan', 'korea', 'middle-east'],
  'south-korea': ['korea', 'china-taiwan'],
  'north-korea': ['korea', 'china-taiwan'],
  'venezuela': ['venezuela', 'middle-east'],
  'sudan': ['sudan', 'sahel', 'middle-east'],
  'nigeria': ['sahel', 'sudan'],
  'kenya': ['sudan', 'sahel'],
  'south-africa': ['middle-east', 'sudan'],
  'brazil': ['venezuela', 'middle-east'],
  'canada': ['ukraine-russia', 'middle-east', 'china-taiwan'],
  'australia': ['china-taiwan', 'korea', 'middle-east'],
  'japan': ['china-taiwan', 'korea', 'middle-east'],
  'afghanistan': ['taliban-pakistan', 'middle-east'],
  'colombia': ['venezuela'],
}

// Default fallback for unmapped countries
const DEFAULT_EVENTS = ['middle-east']

export function getImpactEvents(countrySlug: string): ImpactEvent[] {
  const ids = COUNTRY_IMPACT[countrySlug] || DEFAULT_EVENTS
  return ids.map(id => EVENT_META[id]).filter(Boolean)
}

export function getImpactEventIds(countrySlug: string): string[] {
  return COUNTRY_IMPACT[countrySlug] || DEFAULT_EVENTS
}

export { EVENT_META }
