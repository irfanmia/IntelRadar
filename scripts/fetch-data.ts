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
  const lower = text.toLowerCase()
  const mapping: [string[], string][] = [
    // Ukraine-Russia (check before middle-east since some keywords overlap)
    [['ukraine', 'kyiv', 'zelensky', 'zelenskyy', 'kremlin', 'putin', 'donetsk', 'crimea', 'kherson', 'zaporizhzhia', 'bakhmut', 'pokrovsk', 'dnipro', 'odesa', 'nato expansion', 'wagner'], 'ukraine-russia'],
    // China-Taiwan
    [['taiwan', 'taipei', 'pla ', 'south china sea', 'china military', 'strait of taiwan', 'tsai ing', 'lai ching', 'aukus', 'china drill', 'china exercise'], 'china-taiwan'],
    // Taliban-Pakistan
    [['taliban', 'ttp ', 'waziristan', 'balochistan', 'peshawar', 'khyber', 'pakistan army', 'afghan border', 'pashtun'], 'taliban-pakistan'],
    // Venezuela
    [['venezuela', 'maduro', 'caracas', 'guaido', 'machado', 'pdvsa', 'venezuelan'], 'venezuela'],
    // Sudan
    [['sudan', 'khartoum', 'darfur', 'rsf ', 'rapid support', 'el-fasher', 'sudanese'], 'sudan'],
    // Korean Peninsula
    [['north korea', 'pyongyang', 'kim jong', 'icbm', 'hwasong', 'korean peninsula', 'dmz ', 'denuclearization'], 'korea'],
    // Sahel
    [['sahel', 'mali ', 'niger ', 'burkina faso', 'wagner africa', 'junta ', 'francophone'], 'sahel'],
    // Middle East / US-Israel-Iran (broadest — keep last)
    [['gaza', 'israel', 'palestine', 'hamas', 'hezbollah', 'lebanon', 'syria', 'iran', 'iraq', 'yemen', 'houthi', 'west bank', 'middle east', 'netanyahu', 'tehran', 'idf ', 'irgc', 'khamenei', 'beersheba', 'tel aviv', 'beirut', 'pentagon', 'us strike', 'israeli', 'iranian'], 'middle-east'],
  ]
  for (const [keywords, topic] of mapping) {
    if (keywords.some(k => lower.includes(k))) return topic
  }
  return 'middle-east'
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
      const combined = `${item.title} ${item.description}`
      return {
        id: `${sourceName.toLowerCase().replace(/\s/g, '-')}-${i}`,
        headline: item.title,
        summary: item.description.slice(0, 300) || item.title,
        urgency: determineUrgency(combined),
        topic: determineTopic(combined),
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

  // Fetch all in parallel
  const feeds = await Promise.all([
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
  log('=== Fetch Complete ===')
}

main().catch(e => { console.error(e); process.exit(1) })
