#!/usr/bin/env npx tsx
/**
 * IntelRadar Live Data Fetcher
 * Fetches news from RSS feeds and financial data from free APIs
 * Writes to public/data/live-feed.json
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

// --- Types ---
interface FeedItem {
  id: string
  headline: string
  summary: string
  urgency: 'breaking' | 'important' | 'info'
  topic: string
  sources: { name: string; logo: string; url: string; category: string }[]
  timestamp: string
  widgetType: 'news' | 'chart' | 'stats'
  link?: string
  chartData?: { label: string; value: number }[]
}

interface FinancialEntry {
  label: string
  value: number
  change: number
  changePercent: number
}

interface LiveFeed {
  lastUpdated: string
  news: FeedItem[]
  financials: {
    exchangeRates: Record<string, number>
    gold: FinancialEntry
    oil: FinancialEntry
  }
}

// --- Helpers ---
function log(msg: string) { console.log(`[${new Date().toISOString()}] ${msg}`) }

function determineUrgency(text: string): 'breaking' | 'important' | 'info' {
  const lower = text.toLowerCase()
  const breaking = ['war', 'attack', 'breaking', 'killed', 'explosion', 'missile', 'strike', 'bomb', 'dead', 'massacre', 'invasion', 'genocide', 'ceasefire']
  const important = ['economy', 'crisis', 'sanctions', 'summit', 'election', 'protest', 'refugee', 'inflation', 'collapse', 'earthquake', 'hurricane', 'famine']
  if (breaking.some(k => lower.includes(k))) return 'breaking'
  if (important.some(k => lower.includes(k))) return 'important'
  return 'info'
}

function determineTopic(text: string): string {
  // Strip HTML tags and URLs to avoid false matches from link hrefs
  const clean = text.replace(/<[^>]+>/g, ' ').replace(/https?:\/\/\S+/g, ' ').replace(/\s+/g, ' ').toLowerCase()

  // Use word-boundary matching to avoid substring false positives (e.g., "iran" in "veteran")
  function hasWord(kw: string): boolean {
    // Keywords with trailing space (like 'pla ') use includes
    if (kw.endsWith(' ')) return clean.includes(kw)
    // Otherwise use word boundary regex
    const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    return re.test(clean)
  }

  const mapping: [string[], string][] = [
    // Ukraine-Russia
    [['ukraine', 'kyiv', 'zelensky', 'zelenskyy', 'kremlin', 'putin', 'donetsk', 'crimea', 'kherson', 'zaporizhzhia', 'bakhmut', 'pokrovsk', 'dnipro', 'odesa', 'nato expansion', 'wagner group'], 'ukraine-russia'],
    // China-Taiwan
    [['taiwan', 'taipei', 'pla ', 'south china sea', 'china military', 'strait of taiwan', 'tsai ing-wen', 'lai ching-te', 'aukus', 'china drill', 'china exercise'], 'china-taiwan'],
    // Taliban-Pakistan
    [['taliban', 'ttp ', 'waziristan', 'balochistan', 'peshawar', 'khyber', 'pakistan army', 'afghan border', 'pashtun'], 'taliban-pakistan'],
    // Venezuela
    [['venezuela', 'maduro', 'caracas', 'guaido', 'machado', 'pdvsa', 'venezuelan'], 'venezuela'],
    // Sudan
    [['sudan', 'khartoum', 'darfur', 'rsf ', 'rapid support', 'el-fasher', 'sudanese'], 'sudan'],
    // Korean Peninsula
    [['north korea', 'pyongyang', 'kim jong', 'icbm', 'hwasong', 'korean peninsula', 'dmz ', 'denuclearization'], 'korea'],
    // Sahel
    [['sahel', 'mali coup', 'niger coup', 'burkina faso', 'wagner africa', 'ecowas'], 'sahel'],
    // Middle East / US-Israel-Iran (broadest — keep last)
    [['gaza', 'israel', 'palestine', 'hamas', 'hezbollah', 'lebanon war', 'syria', 'iran', 'iraq war', 'yemen', 'houthi', 'west bank', 'middle east', 'netanyahu', 'tehran', 'idf', 'irgc', 'khamenei', 'beersheba', 'tel aviv', 'beirut', 'pentagon strike', 'us strike', 'israeli', 'iranian', 'airspace closed', 'iron dome'], 'middle-east'],
  ]
  for (const [keywords, topic] of mapping) {
    if (keywords.some(k => hasWord(k))) return topic
  }
  return 'general'
}

function extractText(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${tag}>`, 's')
  const m = xml.match(re)
  return m ? m[1].trim().replace(/<[^>]+>/g, '').trim() : ''
}

function extractItems(xml: string): { title: string; description: string; link: string; pubDate: string }[] {
  const items: { title: string; description: string; link: string; pubDate: string }[] = []
  const itemRegex = /<item[^>]*>(.*?)<\/item>/gs
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    items.push({
      title: extractText(match[1], 'title'),
      description: extractText(match[1], 'description'),
      link: extractText(match[1], 'link'),
      pubDate: extractText(match[1], 'pubDate'),
    })
  }
  return items
}

// --- Fetchers ---
async function fetchRSS(url: string, sourceName: string, logo: string, sourceUrl: string, category: string = 'global_media'): Promise<FeedItem[]> {
  try {
    log(`Fetching ${sourceName}...`)
    const res = await fetch(url, { headers: { 'User-Agent': 'IntelRadar/1.0' }, signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()
    const rawItems = extractItems(xml)
    log(`  Got ${rawItems.length} items from ${sourceName}`)
    return rawItems.slice(0, 20).map((item, i) => {
      // Classify topic based on TITLE ONLY (descriptions often contain cross-linked/irrelevant content)
      // Use full text only for urgency detection
      const combined = `${item.title} ${item.description}`
      return {
        id: `${sourceName.toLowerCase().replace(/\s/g, '-')}-${i}`,
        headline: item.title,
        summary: item.description.slice(0, 300) || item.title,
        urgency: determineUrgency(combined),
        topic: determineTopic(item.title),
        sources: [{ name: sourceName, logo, url: sourceUrl, category }],
        timestamp: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        widgetType: 'news' as const,
        link: item.link,
      }
    })
  } catch (e: any) {
    log(`  ERROR fetching ${sourceName}: ${e.message}`)
    return []
  }
}

async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    log('Fetching exchange rates...')
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(10000) })
    const data = await res.json()
    if (data.rates) {
      const keep = ['AED', 'SAR', 'GBP', 'INR', 'JPY', 'EUR', 'PKR', 'EGP', 'TRY', 'CAD', 'AUD', 'BRL', 'ZAR', 'NGN', 'KES', 'JOD', 'LBP', 'IQD', 'QAR', 'KWD', 'BHD', 'OMR', 'ILS', 'KRW']
      const rates: Record<string, number> = { USD: 1 }
      for (const k of keep) if (data.rates[k]) rates[k] = data.rates[k]
      log(`  Got ${Object.keys(rates).length} exchange rates`)
      return rates
    }
    throw new Error('No rates')
  } catch (e: any) {
    log(`  ERROR exchange rates: ${e.message}`)
    return { USD: 1, AED: 3.67, SAR: 3.75, GBP: 0.79, INR: 83.1, JPY: 150.2, EUR: 0.92 }
  }
}

async function fetchGoldPrice(): Promise<FinancialEntry> {
  try {
    log('Fetching gold price...')
    // Use a free metals price proxy
    const res = await fetch('https://api.metalpriceapi.com/v1/latest?api_key=demo&base=USD&currencies=XAU', { signal: AbortSignal.timeout(10000) })
    const data = await res.json()
    if (data.rates?.USDXAU) {
      const price = Math.round((1 / data.rates.USDXAU) * 100) / 100
      return { label: 'Gold (USD/oz)', value: price, change: 0, changePercent: 0 }
    }
    throw new Error('No gold data')
  } catch {
    // Fallback: try goldapi alternative
    try {
      const res = await fetch('https://www.goldapi.io/api/XAU/USD', {
        headers: { 'x-access-token': 'goldapi-demo' },
        signal: AbortSignal.timeout(10000)
      })
      const data = await res.json()
      if (data.price) {
        return { label: 'Gold (USD/oz)', value: data.price, change: data.ch || 0, changePercent: data.chp || 0 }
      }
    } catch {}
    log('  Using fallback gold price')
    return { label: 'Gold (USD/oz)', value: 2650, change: 12.5, changePercent: 0.47 }
  }
}

async function fetchOilPrice(): Promise<FinancialEntry> {
  try {
    log('Fetching oil price...')
    // Try free commodity endpoint
    const res = await fetch('https://api.commodities-api.com/api/latest?access_key=demo&base=USD&symbols=BRENTOIL', { signal: AbortSignal.timeout(10000) })
    const data = await res.json()
    if (data.data?.rates?.BRENTOIL) {
      const price = Math.round((1 / data.data.rates.BRENTOIL) * 100) / 100
      return { label: 'Brent Crude (USD)', value: price, change: 0, changePercent: 0 }
    }
    throw new Error('No oil data')
  } catch {
    log('  Using fallback oil price')
    return { label: 'Brent Crude (USD)', value: 73.5, change: -0.45, changePercent: -0.61 }
  }
}

// --- Main ---
async function main() {
  log('=== IntelRadar Data Fetch Started ===')

  // Topic-specific Google News search fetcher — forces topic tag
  async function fetchTopicNews(query: string, topic: string): Promise<FeedItem[]> {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en&gl=US&ceid=US:en`
    const items = await fetchRSS(url, 'Google News', 'https://www.google.com/s2/favicons?domain=news.google.com&sz=32', 'https://news.google.com', 'global_media')
    // Force-tag with correct topic since these are targeted searches
    return items.map(item => ({ ...item, topic }))
  }

  // Fetch all in parallel
  const feeds = await Promise.all([
    // === TOPIC-SPECIFIC TARGETED SEARCHES ===
    fetchTopicNews('US Israel Iran war latest updates 2026', 'middle-east'),
    fetchTopicNews('Gaza Palestine Hamas conflict latest', 'middle-east'),
    fetchTopicNews('Hezbollah Lebanon war strikes', 'middle-east'),
    fetchTopicNews('Yemen Houthi Red Sea attacks', 'middle-east'),
    fetchTopicNews('Ukraine Russia war frontline latest', 'ukraine-russia'),
    fetchTopicNews('China Taiwan military tensions', 'china-taiwan'),
    fetchTopicNews('Taliban Pakistan border conflict', 'taliban-pakistan'),
    fetchTopicNews('Venezuela crisis Maduro latest', 'venezuela'),
    fetchTopicNews('Sudan war Khartoum RSF latest', 'sudan'),
    fetchTopicNews('North Korea missile nuclear tensions', 'korea'),
    fetchTopicNews('Sahel Mali Niger Burkina Faso conflict', 'sahel'),

    // === GENERAL RSS FEEDS ===
    // Global Media - General
    fetchRSS('https://www.aljazeera.com/xml/rss/all.xml', 'Al Jazeera', 'https://www.google.com/s2/favicons?domain=aljazeera.com&sz=32', 'https://aljazeera.com'),
    fetchRSS('http://feeds.bbci.co.uk/news/world/rss.xml', 'BBC World', 'https://www.google.com/s2/favicons?domain=bbc.com&sz=32', 'https://bbc.com/news'),
    fetchRSS('http://feeds.bbci.co.uk/news/world/middle_east/rss.xml', 'BBC', 'https://www.google.com/s2/favicons?domain=bbc.com&sz=32', 'https://bbc.com/news'),
    fetchRSS('https://feeds.reuters.com/reuters/worldNews', 'Reuters', 'https://www.google.com/s2/favicons?domain=reuters.com&sz=32', 'https://reuters.com'),
    // Ukraine-Russia specific
    fetchRSS('http://feeds.bbci.co.uk/news/world/europe/rss.xml', 'BBC Europe', 'https://www.google.com/s2/favicons?domain=bbc.com&sz=32', 'https://bbc.com/news'),
    fetchRSS('https://www.aljazeera.com/xml/rss/all.xml', 'Al Jazeera', 'https://www.google.com/s2/favicons?domain=aljazeera.com&sz=32', 'https://aljazeera.com'),
    // Asia-Pacific (China-Taiwan, Korea)
    fetchRSS('http://feeds.bbci.co.uk/news/world/asia/rss.xml', 'BBC Asia', 'https://www.google.com/s2/favicons?domain=bbc.com&sz=32', 'https://bbc.com/news'),
    // Latin America (Venezuela)
    fetchRSS('http://feeds.bbci.co.uk/news/world/latin_america/rss.xml', 'BBC LatAm', 'https://www.google.com/s2/favicons?domain=bbc.com&sz=32', 'https://bbc.com/news'),
    // Africa (Sudan, Sahel)
    fetchRSS('http://feeds.bbci.co.uk/news/world/africa/rss.xml', 'BBC Africa', 'https://www.google.com/s2/favicons?domain=bbc.com&sz=32', 'https://bbc.com/news'),
    // Government / Official Sources
    fetchRSS('https://news.un.org/feed/subscribe/en/news/topic/peace-and-security/feed/rss.xml', 'United Nations', 'https://www.google.com/s2/favicons?domain=un.org&sz=32', 'https://news.un.org', 'government'),
    fetchRSS('https://news.un.org/feed/subscribe/en/news/region/middle-east/feed/rss.xml', 'UN Middle East', 'https://www.google.com/s2/favicons?domain=un.org&sz=32', 'https://news.un.org', 'government'),
    fetchRSS('https://news.un.org/feed/subscribe/en/news/region/africa/feed/rss.xml', 'UN Africa', 'https://www.google.com/s2/favicons?domain=un.org&sz=32', 'https://news.un.org', 'government'),
    fetchRSS('https://news.un.org/feed/subscribe/en/news/region/europe/feed/rss.xml', 'UN Europe', 'https://www.google.com/s2/favicons?domain=un.org&sz=32', 'https://news.un.org', 'government'),
    fetchRSS('https://news.un.org/feed/subscribe/en/news/region/asia-pacific/feed/rss.xml', 'UN Asia', 'https://www.google.com/s2/favicons?domain=un.org&sz=32', 'https://news.un.org', 'government'),
    fetchRSS('https://news.un.org/feed/subscribe/en/news/region/americas/feed/rss.xml', 'UN Americas', 'https://www.google.com/s2/favicons?domain=un.org&sz=32', 'https://news.un.org', 'government'),
    fetchRSS('https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?max=20&ContentType=1&Site=945', 'US Pentagon', 'https://www.google.com/s2/favicons?domain=defense.gov&sz=32', 'https://defense.gov', 'government'),
    fetchRSS('https://www.state.gov/rss-feed/press-releases/feed/', 'US State Dept', 'https://www.google.com/s2/favicons?domain=state.gov&sz=32', 'https://state.gov', 'government'),
    fetchRSS('https://www.wam.ae/en/rss/all', 'WAM (UAE)', 'https://www.google.com/s2/favicons?domain=wam.ae&sz=32', 'https://wam.ae', 'government'),
    fetchRSS('https://en.irna.ir/rss.aspx', 'IRNA (Iran)', 'https://www.google.com/s2/favicons?domain=irna.ir&sz=32', 'https://en.irna.ir', 'government'),
    fetchRSS('https://news.google.com/rss/search?q=site:spa.gov.sa+english&hl=en', 'SPA (Saudi)', 'https://www.google.com/s2/favicons?domain=spa.gov.sa&sz=32', 'https://spa.gov.sa', 'government'),
    // Local / Regional Media
    fetchRSS('https://news.google.com/rss/search?q=site:khaleejtimes.com&hl=en', 'Khaleej Times', 'https://www.google.com/s2/favicons?domain=khaleejtimes.com&sz=32', 'https://khaleejtimes.com', 'local_media'),
    fetchRSS('https://gulfnews.com/feed', 'Gulf News', 'https://www.google.com/s2/favicons?domain=gulfnews.com&sz=32', 'https://gulfnews.com', 'local_media'),
    fetchRSS('https://www.thenationalnews.com/arc/outboundfeeds/rss/category/world/?outputType=xml', 'The National', 'https://www.google.com/s2/favicons?domain=thenationalnews.com&sz=32', 'https://thenationalnews.com', 'local_media'),
    fetchRSS('https://news.google.com/rss/search?q=site:arabnews.com&hl=en', 'Arab News', 'https://www.google.com/s2/favicons?domain=arabnews.com&sz=32', 'https://arabnews.com', 'local_media'),
    fetchRSS('https://timesofindia.indiatimes.com/rssfeeds/296589292.cms', 'Times of India', 'https://www.google.com/s2/favicons?domain=timesofindia.indiatimes.com&sz=32', 'https://timesofindia.indiatimes.com', 'local_media'),
    fetchRSS('https://www.dawn.com/feeds/home', 'Dawn', 'https://www.google.com/s2/favicons?domain=dawn.com&sz=32', 'https://dawn.com', 'local_media'),
    fetchRSS('https://news.google.com/rss/search?q=site:alarabiya.net+english&hl=en', 'Al Arabiya', 'https://www.google.com/s2/favicons?domain=alarabiya.net&sz=32', 'https://english.alarabiya.net', 'local_media'),
    fetchRSS('https://news.google.com/rss/search?q=site:middleeasteye.net&hl=en', 'Middle East Eye', 'https://www.google.com/s2/favicons?domain=middleeasteye.net&sz=32', 'https://middleeasteye.net', 'local_media'),
    fetchRSS('https://news.google.com/rss/search?q=site:kyivindependent.com&hl=en', 'Kyiv Independent', 'https://www.google.com/s2/favicons?domain=kyivindependent.com&sz=32', 'https://kyivindependent.com', 'local_media'),
    fetchRSS('https://www.scmp.com/rss/91/feed', 'SCMP', 'https://www.google.com/s2/favicons?domain=scmp.com&sz=32', 'https://scmp.com', 'local_media'),
    fetchRSS('https://www.france24.com/en/rss', 'France 24', 'https://www.google.com/s2/favicons?domain=france24.com&sz=32', 'https://france24.com', 'global_media'),
    fetchRSS('https://rss.nytimes.com/services/xml/rss/nyt/World.xml', 'NY Times', 'https://www.google.com/s2/favicons?domain=nytimes.com&sz=32', 'https://nytimes.com', 'global_media'),
    fetchRSS('https://feeds.washingtonpost.com/rss/world', 'Washington Post', 'https://www.google.com/s2/favicons?domain=washingtonpost.com&sz=32', 'https://washingtonpost.com', 'global_media'),
    fetchRSS('https://www.theguardian.com/world/rss', 'The Guardian', 'https://www.google.com/s2/favicons?domain=theguardian.com&sz=32', 'https://theguardian.com', 'global_media'),
    // Financial
    fetchExchangeRates(),
    fetchGoldPrice(),
    fetchOilPrice(),
  ])

  // Separate financial data from news feeds (last 3 are financials)
  const totalFeeds = feeds.length
  const newsFeeds = feeds.slice(0, totalFeeds - 3) as FeedItem[][]
  const rates = feeds[totalFeeds - 3] as unknown as Record<string, number>
  const gold = feeds[totalFeeds - 2] as unknown as FinancialEntry
  const oil = feeds[totalFeeds - 1] as unknown as FinancialEntry

  // Merge all news
  const allNews = newsFeeds.flat()

  // Sort by timestamp (newest first), deduplicate similar headlines
  allNews.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const seen = new Set<string>()
  const deduped: FeedItem[] = []
  for (const item of allNews) {
    const key = item.headline.toLowerCase().split(/\s+/).slice(0, 5).join(' ')
    if (!seen.has(key)) {
      seen.add(key)
      deduped.push({ ...item, id: `news-${deduped.length}` })
    }
  }

  const feed: LiveFeed = {
    lastUpdated: new Date().toISOString(),
    news: deduped.slice(0, 100),
    financials: {
      exchangeRates: rates,
      gold,
      oil,
    },
  }

  const outDir = join(import.meta.dirname || __dirname, '..', 'public', 'data')
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, 'live-feed.json')
  writeFileSync(outPath, JSON.stringify(feed, null, 2))
  log(`Written ${deduped.length} news items to ${outPath}`)

  // --- Generate dynamic impact event scores from actual news data ---
  generateImpactScores(deduped, outDir)

  log('=== Fetch Complete ===')
}

/**
 * Analyze news to score impact events and generate dynamic rankings.
 * Writes public/data/impact-events.json
 */
function generateImpactScores(news: FeedItem[], outDir: string) {
  log('Generating dynamic impact event scores...')

  const urgencyWeight = { breaking: 3, important: 2, info: 1 }

  // Score each topic by article count × urgency
  const topicScores: Record<string, { count: number; score: number; breaking: number; latest: string }> = {}
  for (const item of news) {
    if (!topicScores[item.topic]) {
      topicScores[item.topic] = { count: 0, score: 0, breaking: 0, latest: item.timestamp }
    }
    const t = topicScores[item.topic]
    t.count++
    t.score += urgencyWeight[item.urgency] || 1
    if (item.urgency === 'breaking') t.breaking++
    if (new Date(item.timestamp) > new Date(t.latest)) t.latest = item.timestamp
  }

  // Rank events globally by score
  const globalRanking = Object.entries(topicScores)
    .sort(([, a], [, b]) => b.score - a.score)
    .map(([topic, stats]) => ({
      id: topic,
      score: stats.score,
      count: stats.count,
      breaking: stats.breaking,
      latest: stats.latest,
    }))

  // Country → topic affinity (base mapping, same as countryImpact.ts)
  const COUNTRY_BASE: Record<string, string[]> = {
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

  // For each country, re-rank their relevant events by current news score
  const countryEvents: Record<string, string[]> = {}
  for (const [country, baseEvents] of Object.entries(COUNTRY_BASE)) {
    // Score each of the country's events by current news volume
    const scored = baseEvents.map(eventId => ({
      id: eventId,
      newsScore: topicScores[eventId]?.score || 0,
      hasBreaking: (topicScores[eventId]?.breaking || 0) > 0,
    }))

    // Sort: breaking events first, then by news score
    scored.sort((a, b) => {
      if (a.hasBreaking !== b.hasBreaking) return a.hasBreaking ? 1 : -1
      return b.newsScore - a.newsScore
    })

    // Also check: if a globally hot event (top 3) affects this country's region but isn't
    // in their base list, consider adding it
    for (const global of globalRanking.slice(0, 3)) {
      if (!baseEvents.includes(global.id) && global.score > 20) {
        // Only add if it's REALLY big and there's a plausible connection
        // (e.g., a new conflict everyone should know about)
        scored.push({ id: global.id, newsScore: global.score, hasBreaking: global.breaking > 0 })
      }
    }

    countryEvents[country] = scored.map(s => s.id)
  }

  const impactData = {
    lastUpdated: new Date().toISOString(),
    globalRanking,
    countryEvents,
  }

  const impactPath = join(outDir, 'impact-events.json')
  writeFileSync(impactPath, JSON.stringify(impactData, null, 2))
  log(`  Global ranking: ${globalRanking.map(r => `${r.id}(${r.score})`).join(', ')}`)
  log(`  Written impact events for ${Object.keys(countryEvents).length} countries`)
}

main().catch(e => { console.error(e); process.exit(1) })
