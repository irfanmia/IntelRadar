'use client'
import { motion } from 'framer-motion'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { FinancialData, TimeRange } from '@/types'
import { useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const TIME_RANGES: TimeRange[] = ['1D', '1W', '1M', '1Y', '5Y']

function formatDate(dateStr: string, range: TimeRange): string {
  const d = new Date(dateStr)
  if (range === '1D') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (range === '1W') return d.toLocaleDateString([], { weekday: 'short' })
  if (range === '1M') return d.toLocaleDateString([], { day: 'numeric', month: 'short' })
  if (range === '1Y') return d.toLocaleDateString([], { month: 'short', year: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', year: '2-digit' })
}

export default function FinancialWidget({ data, delay = 0 }: { data: FinancialData; delay?: number }) {
  const [range, setRange] = useState<TimeRange>('1M')
  
  // Get data for selected range
  const chartData = data.historicalData?.[range]?.length
    ? data.historicalData[range]
    : data.data

  // Calculate change for selected range
  let rangeChange = data.change
  let rangeChangePercent = data.changePercent
  if (chartData.length >= 2) {
    const first = chartData[0].value
    const last = chartData[chartData.length - 1].value
    rangeChange = Math.round((last - first) * 100) / 100
    rangeChangePercent = first ? Math.round((rangeChange / first) * 10000) / 100 : 0
  }

  const positive = rangeChange >= 0
  const color = positive ? '#22c55e' : '#ef4444'

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      className="glass rounded-2xl p-4 flex-1 min-w-[220px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-[var(--text-secondary)]">{data.label}</span>
        <div className="flex gap-0.5">
          {TIME_RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium transition-all ${
                range === r ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold">{data.value.toLocaleString()}</span>
        <span className={`text-xs font-semibold flex items-center gap-0.5 ${positive ? 'text-green-500' : 'text-red-500'}`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {positive ? '+' : ''}{rangeChangePercent}%
        </span>
      </div>
      <div className="h-20 mt-2 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`fin-${data.label}-${range}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <Tooltip
              contentStyle={{ fontSize: 10, borderRadius: 8, border: 'none', background: 'var(--bg-card)', padding: '4px 8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              formatter={(v: number) => [v.toLocaleString(), data.label]}
              labelFormatter={(label) => formatDate(label, range)}
            />
            <Area type="monotone" dataKey="value" stroke={color} fill={`url(#fin-${data.label}-${range})`} strokeWidth={1.5} dot={false} animationDuration={500} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
