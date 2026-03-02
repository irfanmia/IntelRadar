import { useState, useEffect, useCallback } from 'react'
import { NewsItem, FinancialData, TimeRange } from '@/types'

interface LiveFeedData {
  lastUpdated: string
  news: any[]
  financials: {
    exchangeRates: Record<string, number>
    gold: { label: string; value: number; change: number; changePercent: number }
    oil: { label: string; value: number; change: number; changePercent: number }
  }
}

interface HistoricalSymbol {
  label: string
  current: number
  change: number
  changePercent: number
  data: Record<string, { date: string; value: number }[]>
}

interface HistoricalData {
  lastUpdated: string
  symbols: Record<string, HistoricalSymbol>
}

const COUNTRY_CURRENCY: Record<string, { currency: string; symbol: string; index: string }> = {
  'United Arab Emirates': { currency: 'AED', symbol: 'د.إ', index: 'TASI' }, // ADX not on Yahoo, use TASI as proxy
  'Saudi Arabia': { currency: 'SAR', symbol: '﷼', index: 'TASI' },
  'United States': { currency: 'USD', symbol: '$', index: 'S&P 500' },
  'United Kingdom': { currency: 'GBP', symbol: '£', index: 'FTSE 100' },
  'India': { currency: 'INR', symbol: '₹', index: 'SENSEX' },
  'Japan': { currency: 'JPY', symbol: '¥', index: 'Nikkei 225' },
  'Germany': { currency: 'EUR', symbol: '€', index: 'DAX' },
}

function toChartData(points: { date: string; value: number }[], rate: number = 1): { time: string; value: number }[] {
  return points.map(p => ({
    time: p.date,
    value: Math.round(p.value * rate * 100) / 100,
  }))
}

export function useLiveFeed(country: string) {
  const [feed, setFeed] = useState<LiveFeedData | null>(null)
  const [historical, setHistorical] = useState<HistoricalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchFeed = useCallback(async () => {
    // Fetch live news feed
    try {
      const res = await fetch('/data/live-feed.json?' + Date.now())
      if (res.ok) {
        const data = await res.json()
        setFeed(data)
        setLastUpdated(data.lastUpdated)
        try { localStorage.setItem('intelradar-last-feed', JSON.stringify(data)) } catch {}
      }
    } catch {
      try {
        const res = await fetch('/api/feed')
        if (res.ok) {
          const data = await res.json()
          setFeed(data)
          setLastUpdated(data.lastUpdated)
          try { localStorage.setItem('intelradar-last-feed', JSON.stringify(data)) } catch {}
        }
      } catch {
        try {
          const cached = localStorage.getItem('intelradar-last-feed')
          if (cached) {
            const data = JSON.parse(cached)
            setFeed(data)
            setLastUpdated(data.lastUpdated)
          }
        } catch {}
      }
    }
    setLoading(false)
  }, [])

  // Fetch historical data once
  useEffect(() => {
    async function loadHistorical() {
      try {
        const res = await fetch('/data/historical.json?' + Date.now())
        if (res.ok) {
          const data = await res.json()
          setHistorical(data)
          try { localStorage.setItem('intelradar-historical', JSON.stringify(data)) } catch {}
          return
        }
      } catch {}
      // Fallback to cached
      try {
        const cached = localStorage.getItem('intelradar-historical')
        if (cached) setHistorical(JSON.parse(cached))
      } catch {}
    }
    loadHistorical()
  }, [])

  useEffect(() => {
    fetchFeed()
    const interval = setInterval(fetchFeed, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchFeed])

  const news: NewsItem[] = (feed?.news || []).map((n: any) => ({
    ...n,
    widgetType: n.widgetType || 'news',
  }))

  // Build financials with real historical data
  const cc = COUNTRY_CURRENCY[country] || { currency: 'USD', symbol: '$', index: 'S&P 500' }
  const rate = feed?.financials?.exchangeRates?.[cc.currency] || 1

  function buildFinancial(symbolKey: string, label: string, currencyRate: number = 1): FinancialData {
    const sym = historical?.symbols?.[symbolKey]
    const ranges: TimeRange[] = ['1D', '1W', '1M', '1Y', '5Y']
    const histData: Record<TimeRange, { time: string; value: number }[]> = {} as any

    for (const r of ranges) {
      const points = sym?.data?.[r]
      histData[r] = points?.length ? toChartData(points, currencyRate) : []
    }

    // Default to 1M data for initial chart
    const defaultData = histData['1M']?.length ? histData['1M'] : histData['1W']?.length ? histData['1W'] : histData['5Y'] || []

    return {
      label,
      value: sym ? Math.round(sym.current * currencyRate * 100) / 100 : 0,
      change: sym ? Math.round(sym.change * currencyRate * 100) / 100 : 0,
      changePercent: sym?.changePercent || 0,
      data: defaultData,
      historicalData: histData,
    }
  }

  const financials = {
    stock: buildFinancial(cc.index, cc.index),
    gold: buildFinancial('Gold', `Gold (${cc.symbol})`, rate),
    oil: buildFinancial('Oil', 'Brent Crude (USD)'),
  }

  return { news, financials, lastUpdated, loading, refresh: fetchFeed }
}
