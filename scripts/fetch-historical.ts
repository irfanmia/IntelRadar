#!/usr/bin/env npx tsx
/**
 * Fetch 5-year historical data for financial widgets
 * Sources: Yahoo Finance (free, no API key)
 * Symbols: ADX, TASI, S&P500, FTSE, SENSEX, Nikkei, DAX, Gold, Brent Oil
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

function log(msg: string) { console.log(`[${new Date().toISOString()}] ${msg}`) }

interface HistoricalPoint {
  date: string
  value: number
}

interface HistoricalData {
  lastUpdated: string
  symbols: Record<string, {
    label: string
    current: number
    change: number
    changePercent: number
    data: {
      '1D': HistoricalPoint[]
      '1W': HistoricalPoint[]
      '1M': HistoricalPoint[]
      '1Y': HistoricalPoint[]
      '5Y': HistoricalPoint[]
    }
  }>
}

const SYMBOLS: Record<string, { yahoo: string; label: string }> = {
  'ADX': { yahoo: '%5EADX', label: 'ADX' },
  'TASI': { yahoo: '%5ETASI.SR', label: 'TASI' },
  'S&P 500': { yahoo: '%5EGSPC', label: 'S&P 500' },
  'FTSE 100': { yahoo: '%5EFTSE', label: 'FTSE 100' },
  'SENSEX': { yahoo: '%5EBSESN', label: 'SENSEX' },
  'Nikkei 225': { yahoo: '%5EN225', label: 'Nikkei 225' },
  'DAX': { yahoo: '%5EGDAXI', label: 'DAX' },
  'Gold': { yahoo: 'GC%3DF', label: 'Gold (USD/oz)' },
  'Oil': { yahoo: 'BZ%3DF', label: 'Brent Crude (USD)' },
}

const RANGES: { key: string; range: string; interval: string }[] = [
  { key: '1D', range: '1d', interval: '5m' },
  { key: '1W', range: '5d', interval: '30m' },
  { key: '1M', range: '1mo', interval: '1d' },
  { key: '1Y', range: '1y', interval: '1wk' },
  { key: '5Y', range: '5y', interval: '1mo' },
]

async function fetchYahoo(symbol: string, range: string, interval: string): Promise<{ timestamps: number[]; closes: number[] } | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const result = json.chart?.result?.[0]
    if (!result) return null
    const timestamps = result.timestamp || []
    const closes = result.indicators?.quote?.[0]?.close || []
    return { timestamps, closes }
  } catch (e: any) {
    log(`  ERROR ${symbol} ${range}: ${e.message}`)
    return null
  }
}

async function fetchSymbolData(key: string, config: { yahoo: string; label: string }) {
  log(`Fetching ${key}...`)
  const results: Record<string, HistoricalPoint[]> = {}
  let current = 0
  let prevClose = 0

  for (const r of RANGES) {
    const data = await fetchYahoo(config.yahoo, r.range, r.interval)
    if (data && data.timestamps.length > 0) {
      const points: HistoricalPoint[] = []
      for (let i = 0; i < data.timestamps.length; i++) {
        const val = data.closes[i]
        if (val != null && !isNaN(val)) {
          points.push({
            date: new Date(data.timestamps[i] * 1000).toISOString(),
            value: Math.round(val * 100) / 100,
          })
        }
      }
      results[r.key] = points
      if (r.key === '1D' && points.length > 0) {
        current = points[points.length - 1].value
        prevClose = points[0].value
      }
    } else {
      results[r.key] = []
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300))
  }

  // If no 1D data, use 5Y last point
  if (!current && results['5Y']?.length) {
    current = results['5Y'][results['5Y'].length - 1].value
    prevClose = results['5Y'].length > 1 ? results['5Y'][results['5Y'].length - 2].value : current
  }

  const change = Math.round((current - prevClose) * 100) / 100
  const changePercent = prevClose ? Math.round((change / prevClose) * 10000) / 100 : 0

  log(`  ${key}: ${current} (${change >= 0 ? '+' : ''}${changePercent}%) — ${Object.values(results).reduce((a, b) => a + b.length, 0)} data points`)

  return {
    label: config.label,
    current,
    change,
    changePercent,
    data: results as any,
  }
}

async function main() {
  log('=== Fetching Historical Financial Data (5Y) ===')

  const historicalData: HistoricalData = {
    lastUpdated: new Date().toISOString(),
    symbols: {},
  }

  for (const [key, config] of Object.entries(SYMBOLS)) {
    historicalData.symbols[key] = await fetchSymbolData(key, config)
    // Delay between symbols to avoid rate limiting
    await new Promise(r => setTimeout(r, 500))
  }

  const outDir = join(import.meta.dirname || __dirname, '..', 'public', 'data')
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, 'historical.json')
  writeFileSync(outPath, JSON.stringify(historicalData))
  log(`Written historical data to ${outPath}`)
  log('=== Done ===')
}

main().catch(e => { console.error(e); process.exit(1) })
