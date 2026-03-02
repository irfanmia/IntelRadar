export type UrgencyLevel = 'breaking' | 'important' | 'info'
export type WidgetType = 'news' | 'chart' | 'map' | 'stats' | 'help'
export type SourceCategory = 'government' | 'global_media' | 'local_media'
export type TimeRange = '1D' | '1W' | '1M' | '1Y' | '5Y'

export interface Source {
  name: string
  logo: string
  url: string
  category: SourceCategory
}

export interface NewsItem {
  id: string
  headline: string
  summary: string
  urgency: UrgencyLevel
  topic: string
  sources: Source[]
  timestamp: string
  widgetType: WidgetType
  link?: string
  chartData?: { label: string; value: number }[]
}

export interface FinancialData {
  label: string
  value: number
  change: number
  changePercent: number
  data: { time: string; value: number }[]
  historicalData?: Record<TimeRange, { time: string; value: number }[]>
}

export interface HelpInfo {
  country: string
  hospitals: { name: string; address: string; phone: string }[]
  emergencyContacts: { service: string; number: string }[]
  shelters: { name: string; address: string }[]
  embassies: { country: string; address: string; phone: string }[]
}

export interface HelpDbCountry {
  name: string
  code: string
  callingCode: string
  currency: string
  languages: string[]
  timezone: string
  commsStatus: 'normal' | 'disrupted' | 'blackout' | 'partially-disrupted'
  airportStatus: 'open' | 'closed' | 'restricted' | 'partially-open' | 'frequent-cancellations' | 'diversions-active'
  advisoryLevel: 1 | 2 | 3 | 4
  advisoryNote: string
  emergencyContacts: { service: string; number: string }[]
  hospitals: {
    name: string
    city: string
    address: string
    phone: string
    type: 'Government' | 'Private' | 'Military'
    hasEmergency: boolean
  }[]
  embassies: {
    country: string
    address: string
    phone: string
    emergencyLine: string | null
  }[]
  shelters: {
    name: string
    address: string
    phone: string | null
    type: string
  }[]
  humanitarianOrgs: {
    name: string
    type: string
    phone: string | null
    address: string
  }[]
  travelWarnings: string[]
}

export interface HelpDb {
  lastUpdated: string
  countries: Record<string, HelpDbCountry>
}

export type WidgetId =
  | 'safety-alert' | 'strike-list' | 'comms-status' | 'hospitals' | 'airport'
  | 'military-orders' | 'evacuation' | 'essentials' | 'news-ticker' | 'articles'
  | 'threat-assessment' | 'economy' | 'flight-status' | 'fuel-supply' | 'embassy'
  | 'family-safety' | 'oil-price' | 'geopolitics' | 'market-impact' | 'travel-safety'
  | 'sanctions' | 'how-to-help' | 'investment'

export interface UserPreferences {
  country: string
  topics: string[]
  focusTopic: string
  darkMode: boolean
  onboarded: boolean
  extraWidgets?: WidgetId[]
}

export interface CountryFinancials {
  index: string
  indexName: string
  currency: string
  currencySymbol: string
}
