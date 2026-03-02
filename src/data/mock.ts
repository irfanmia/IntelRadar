import { NewsItem, FinancialData, HelpInfo, CountryFinancials, Source } from '@/types'

export const TOPICS = [
  { id: 'middle-east', label: 'US-Israel-Iran War', icon: '🔴', impact: 1 },
  { id: 'ukraine-russia', label: 'Ukraine-Russia', icon: '🇺🇦', impact: 2 },
  { id: 'china-taiwan', label: 'China-Taiwan', icon: '🇹🇼', impact: 3 },
  { id: 'taliban-pakistan', label: 'Taliban-Pakistan', icon: '⚔️', impact: 4 },
  { id: 'venezuela', label: 'Venezuela Crisis', icon: '🇻🇪', impact: 5 },
  { id: 'sudan', label: 'Sudan Civil War', icon: '🇸🇩', impact: 6 },
  { id: 'korea', label: 'Korean Peninsula', icon: '🇰🇷', impact: 7 },
  { id: 'sahel', label: 'Sahel Conflict', icon: '🌍', impact: 8 },
]

export const COUNTRIES = [
  'United Arab Emirates', 'Saudi Arabia', 'United States', 'United Kingdom',
  'India', 'Pakistan', 'Egypt', 'Turkey', 'Germany', 'France',
  'Canada', 'Australia', 'Japan', 'South Korea', 'Brazil',
  'South Africa', 'Nigeria', 'Kenya', 'Jordan', 'Lebanon',
  'Iraq', 'Palestine', 'Israel', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
]

const sources: Record<string, Source> = {
  aljazeera: { name: 'Al Jazeera', logo: '🟢', url: 'https://aljazeera.com', category: 'global_media' },
  reuters: { name: 'Reuters', logo: '🟠', url: 'https://reuters.com', category: 'global_media' },
  bbc: { name: 'BBC', logo: '🔴', url: 'https://bbc.com/news', category: 'global_media' },
  ap: { name: 'AP News', logo: '🔵', url: 'https://apnews.com', category: 'global_media' },
  un: { name: 'United Nations', logo: '🏛️', url: 'https://news.un.org', category: 'government' },
  who: { name: 'WHO', logo: '🏥', url: 'https://who.int', category: 'government' },
  pentagon: { name: 'US DoD', logo: '🇺🇸', url: 'https://defense.gov', category: 'government' },
  middleeasteye: { name: 'Middle East Eye', logo: '👁️', url: 'https://middleeasteye.net', category: 'local_media' },
  wafa: { name: 'WAFA', logo: '🇵🇸', url: 'https://english.wafa.ps', category: 'local_media' },
}

export const NEWS_DATA: NewsItem[] = [
  // US-Israel-Iran War
  {
    id: '1', headline: 'US-Israel Launch Coordinated Strikes on Iranian Nuclear Facilities',
    summary: 'The US and Israel conducted joint military operations targeting Iranian nuclear infrastructure. Secretary of Defense Hegseth confirmed strikes on multiple sites. Iran vows retaliation as IRGC mobilizes forces.',
    urgency: 'breaking', topic: 'middle-east',
    sources: [sources.reuters, sources.pentagon, sources.aljazeera],
    timestamp: '2026-03-02T14:30:00Z', widgetType: 'news',
  },
  {
    id: '2', headline: 'Iranian Missiles Strike Beersheba, Israel — Casualties Reported',
    summary: 'CCTV footage confirms Iranian ballistic missiles hit residential areas in Beersheba. Israeli defense systems intercepted majority of incoming projectiles but several got through. Casualty figures still emerging.',
    urgency: 'breaking', topic: 'middle-east',
    sources: [sources.bbc, sources.aljazeera, sources.ap],
    timestamp: '2026-03-02T12:00:00Z', widgetType: 'news',
  },
  {
    id: '3', headline: 'QatarEnergy Halts LNG Production — Global Gas Prices Soar',
    summary: 'QatarEnergy, the world\'s largest LNG producer, suspended operations following proximity of strikes to Gulf infrastructure. European and Asian gas futures surge 18% in a single session.',
    urgency: 'breaking', topic: 'middle-east',
    sources: [sources.reuters, sources.aljazeera, sources.bbc],
    timestamp: '2026-03-02T10:15:00Z', widgetType: 'chart',
    chartData: [
      { label: 'Oct', value: 12 }, { label: 'Nov', value: 14 },
      { label: 'Dec', value: 16 }, { label: 'Jan', value: 19 },
      { label: 'Feb', value: 24 }, { label: 'Mar', value: 38 },
    ],
  },
  {
    id: '4', headline: 'UAE Closes Stock Exchanges Amid Regional Escalation',
    summary: 'Abu Dhabi and Dubai stock exchanges shut trading as regional instability intensifies. Central Bank of UAE issues statement reassuring financial stability. Dirham peg to USD remains firm.',
    urgency: 'important', topic: 'middle-east',
    sources: [sources.reuters, sources.aljazeera, sources.middleeasteye],
    timestamp: '2026-03-02T08:00:00Z', widgetType: 'news',
  },
  {
    id: '5', headline: 'Pakistan Deploys Army as 24 Killed in Pro-Iran Rallies',
    summary: 'Pakistan declares 3-day curfew in northern Gilgit-Baltistan after violent protests over Khamenei assassination reports. Army deployed to restore order. Internet services suspended in affected areas.',
    urgency: 'breaking', topic: 'middle-east',
    sources: [sources.aljazeera, sources.ap, sources.reuters],
    timestamp: '2026-03-02T06:00:00Z', widgetType: 'news',
  },
  {
    id: '6', headline: 'Hezbollah Launches Major Attack on Northern Israel — 31 Killed in Response',
    summary: 'Israel intensifies war on Lebanon after Hezbollah rocket barrages hit Haifa and Tiberias. Israeli strikes kill at least 31 in southern Lebanon. Mass displacement underway as 200,000 flee north.',
    urgency: 'breaking', topic: 'middle-east',
    sources: [sources.aljazeera, sources.bbc, sources.un],
    timestamp: '2026-03-02T04:00:00Z', widgetType: 'stats',
    chartData: [
      { label: 'Displaced', value: 200000 }, { label: 'Casualties', value: 31 },
      { label: 'Rockets Fired', value: 340 }, { label: 'Intercepted', value: 280 },
    ],
  },
  // Ukraine-Russia
  {
    id: '7', headline: 'Ukraine Launches Drone Offensive on Russian Oil Refineries',
    summary: 'Ukrainian forces struck three major Russian oil refineries in Krasnodar and Rostov regions. Russia reports fires at two facilities. Brent crude rises 3% on supply concerns.',
    urgency: 'important', topic: 'ukraine-russia',
    sources: [sources.reuters, sources.bbc, sources.ap],
    timestamp: '2026-03-02T13:00:00Z', widgetType: 'news',
  },
  {
    id: '8', headline: 'Russia Advances in Donetsk — Pokrovsk Under Threat',
    summary: 'Russian forces gain ground near the strategic logistics hub of Pokrovsk. Ukrainian commanders report intense fighting along a 15km front. NATO allies expedite ammunition deliveries.',
    urgency: 'important', topic: 'ukraine-russia',
    sources: [sources.bbc, sources.reuters, sources.ap],
    timestamp: '2026-03-02T09:00:00Z', widgetType: 'chart',
    chartData: [
      { label: 'Oct', value: 18 }, { label: 'Nov', value: 22 },
      { label: 'Dec', value: 28 }, { label: 'Jan', value: 35 },
      { label: 'Feb', value: 42 }, { label: 'Mar', value: 48 },
    ],
  },
  // China-Taiwan
  {
    id: '9', headline: 'China Conducts Largest Military Drill Near Taiwan This Year',
    summary: 'PLA deploys 71 aircraft and 14 naval vessels around Taiwan in show of force. Taiwan scrambles fighters and activates missile defense systems. US 7th Fleet repositions in Western Pacific.',
    urgency: 'important', topic: 'china-taiwan',
    sources: [sources.reuters, sources.ap, sources.bbc],
    timestamp: '2026-03-01T22:00:00Z', widgetType: 'news',
  },
  // Taliban-Pakistan
  {
    id: '10', headline: 'TTP Attacks Kill 40 Pakistani Soldiers in Waziristan',
    summary: 'Tehrik-i-Taliban Pakistan (TTP) claims responsibility for coordinated attacks on military checkpoints in North and South Waziristan. Pakistan Army launches retaliatory airstrikes on Afghan border areas.',
    urgency: 'breaking', topic: 'taliban-pakistan',
    sources: [sources.aljazeera, sources.reuters, sources.ap],
    timestamp: '2026-03-02T07:00:00Z', widgetType: 'news',
  },
  // Venezuela
  {
    id: '11', headline: 'Venezuela Opposition Leader Arrested — Mass Protests Erupt',
    summary: 'Security forces detained opposition figures amid renewed protests over disputed election results. US and EU condemn arrests and threaten additional sanctions. Oil exports at risk.',
    urgency: 'important', topic: 'venezuela',
    sources: [sources.reuters, sources.bbc, sources.ap],
    timestamp: '2026-03-01T20:00:00Z', widgetType: 'news',
  },
  // Sudan
  {
    id: '12', headline: 'Sudan: RSF Besieges El-Fasher — 500,000 Trapped',
    summary: 'Rapid Support Forces tighten siege on El-Fasher, the last major city in Darfur not under their control. UN warns of imminent humanitarian catastrophe. Aid convoys blocked for third week.',
    urgency: 'breaking', topic: 'sudan',
    sources: [sources.un, sources.aljazeera, sources.bbc],
    timestamp: '2026-03-02T11:00:00Z', widgetType: 'stats',
    chartData: [
      { label: 'Displaced', value: 500000 }, { label: 'Aid Blocked (days)', value: 21 },
      { label: 'Casualties (est)', value: 1200 }, { label: 'Refugees', value: 180000 },
    ],
  },
  // Korea
  {
    id: '13', headline: 'North Korea Test-Fires ICBM Toward Sea of Japan',
    summary: 'Pyongyang launches Hwasong-18 solid-fuel ICBM in defiance of UN resolutions. Missile flew 1,000km before splashing down in Japan\'s EEZ. South Korea and Japan convene emergency security meetings.',
    urgency: 'important', topic: 'korea',
    sources: [sources.reuters, sources.ap, sources.bbc],
    timestamp: '2026-03-01T18:00:00Z', widgetType: 'news',
  },
  // Sahel
  {
    id: '14', headline: 'Mali-Niger-Burkina Alliance Expels French Military Presence',
    summary: 'The Sahel Alliance of military juntas completes the removal of French troops from the region. Russia\'s Wagner Group fills the vacuum. EU warns of growing instability and migration pressures.',
    urgency: 'info', topic: 'sahel',
    sources: [sources.aljazeera, sources.reuters, sources.bbc],
    timestamp: '2026-03-01T15:00:00Z', widgetType: 'news',
  },
]

function generatePriceData(base: number, volatility: number, points: number): { time: string; value: number }[] {
  const data: { time: string; value: number }[] = []
  let val = base
  for (let i = points; i >= 0; i--) {
    val += (Math.random() - 0.48) * volatility
    data.push({ time: `${i}`, value: Math.round(val * 100) / 100 })
  }
  return data.reverse()
}

export const COUNTRY_FINANCIALS: Record<string, CountryFinancials> = {
  'United Arab Emirates': { index: 'ADX', indexName: 'Abu Dhabi Securities Exchange', currency: 'AED', currencySymbol: 'د.إ' },
  'Saudi Arabia': { index: 'TASI', indexName: 'Tadawul All Share Index', currency: 'SAR', currencySymbol: '﷼' },
  'United States': { index: 'S&P 500', indexName: 'S&P 500', currency: 'USD', currencySymbol: '$' },
  'United Kingdom': { index: 'FTSE 100', indexName: 'FTSE 100', currency: 'GBP', currencySymbol: '£' },
  'India': { index: 'SENSEX', indexName: 'BSE Sensex', currency: 'INR', currencySymbol: '₹' },
  'Japan': { index: 'Nikkei 225', indexName: 'Nikkei 225', currency: 'JPY', currencySymbol: '¥' },
  'Germany': { index: 'DAX', indexName: 'DAX', currency: 'EUR', currencySymbol: '€' },
}

const defaultFinancials: CountryFinancials = { index: 'MSCI World', indexName: 'MSCI World Index', currency: 'USD', currencySymbol: '$' }

export function getFinancials(country: string): { stock: FinancialData; gold: FinancialData; oil: FinancialData } {
  const cf = COUNTRY_FINANCIALS[country] || defaultFinancials
  const goldBaseUSD = 2045
  const rates: Record<string, number> = {
    AED: 3.67, SAR: 3.75, USD: 1, GBP: 0.79, INR: 83.1, JPY: 150.2, EUR: 0.92,
  }
  const rate = rates[cf.currency] || 1
  const stockBases: Record<string, number> = {
    ADX: 9234, TASI: 12456, 'S&P 500': 5137, 'FTSE 100': 7682, SENSEX: 73142, 'Nikkei 225': 39910, DAX: 17678, 'MSCI World': 3420,
  }
  const stockBase = stockBases[cf.index] || 3420
  return {
    stock: {
      label: cf.index, value: stockBase + Math.round(Math.random() * 100),
      change: 45.2, changePercent: 0.58,
      data: generatePriceData(stockBase, stockBase * 0.005, 24),
    },
    gold: {
      label: `Gold (${cf.currencySymbol})`, value: Math.round(goldBaseUSD * rate * 100) / 100,
      change: Math.round(12.5 * rate * 100) / 100, changePercent: 0.61,
      data: generatePriceData(goldBaseUSD * rate, goldBaseUSD * rate * 0.003, 24),
    },
    oil: {
      label: 'Brent Crude (USD)', value: 82.45,
      change: -0.73, changePercent: -0.88,
      data: generatePriceData(82.45, 0.5, 24),
    },
  }
}

export const HELP_DATA: Record<string, HelpInfo> = {
  'United Arab Emirates': {
    country: 'United Arab Emirates',
    hospitals: [
      { name: 'Cleveland Clinic Abu Dhabi', address: 'Al Maryah Island, Abu Dhabi', phone: '+971 2 501 9000' },
      { name: 'Rashid Hospital', address: 'Oud Metha, Dubai', phone: '+971 4 219 2000' },
    ],
    emergencyContacts: [
      { service: 'Police', number: '999' }, { service: 'Ambulance', number: '998' },
      { service: 'Fire', number: '997' }, { service: 'Coast Guard', number: '996' },
    ],
    shelters: [
      { name: 'Dubai Civil Defense Center', address: 'Al Qusais, Dubai' },
    ],
    embassies: [
      { country: 'United States', address: 'Embassies District, Abu Dhabi', phone: '+971 2 414 2200' },
      { country: 'United Kingdom', address: 'Al Seef Rd, Abu Dhabi', phone: '+971 2 610 1100' },
      { country: 'India', address: 'Plot 10, Diplomatic Area, Abu Dhabi', phone: '+971 2 449 2700' },
    ],
  },
  Palestine: {
    country: 'Palestine',
    hospitals: [
      { name: 'Al-Shifa Medical Complex', address: 'Gaza City', phone: '+970 8 286 4070' },
      { name: 'European Gaza Hospital', address: 'Khan Younis', phone: '+970 8 264 0064' },
      { name: 'Augusta Victoria Hospital', address: 'Mount of Olives, Jerusalem', phone: '+972 2 627 9911' },
    ],
    emergencyContacts: [
      { service: 'Palestinian Red Crescent', number: '101' },
      { service: 'Police', number: '100' }, { service: 'Fire', number: '102' },
      { service: 'UNRWA Emergency', number: '+972 8 677 7531' },
    ],
    shelters: [
      { name: 'UNRWA Shelter - Beach Camp', address: 'Gaza City' },
      { name: 'UNRWA Shelter - Jabalia', address: 'Jabalia Camp' },
    ],
    embassies: [],
  },
  'United States': {
    country: 'United States',
    hospitals: [
      { name: 'Johns Hopkins Hospital', address: 'Baltimore, MD', phone: '+1 410-955-5000' },
      { name: 'Mayo Clinic', address: 'Rochester, MN', phone: '+1 507-284-2511' },
    ],
    emergencyContacts: [
      { service: 'Emergency', number: '911' }, { service: 'FEMA', number: '1-800-621-3362' },
    ],
    shelters: [{ name: 'American Red Cross', address: 'Visit redcross.org for locations' }],
    embassies: [],
  },
}

export function getHelpData(country: string): HelpInfo {
  return HELP_DATA[country] || {
    country, hospitals: [], emergencyContacts: [{ service: 'Emergency', number: '112' }],
    shelters: [], embassies: [],
  }
}
