'use client'
import { Droplets, TrendingUp, TrendingDown } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import WidgetCard from './WidgetCard'
import { FinancialData } from '@/types'

interface Props {
  oil: FinancialData
}

export default function OilPriceWidget({ oil }: Props) {
  const positive = oil.change >= 0
  const color = positive ? '#ef4444' : '#22c55e' // Red for oil up (bad for consumers)

  return (
    <WidgetCard
sources={[{'name':'Yahoo Finance','url':'https://finance.yahoo.com'}]}
            icon={Droplets}
      title="Oil Price Tracker"
      urgency={oil.changePercent > 5 ? 'critical' : oil.changePercent > 2 ? 'warning' : 'info'}
    >
      <div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold">${oil.value}</span>
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${positive ? 'text-red-500' : 'text-green-500'}`}>
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {positive ? '+' : ''}{oil.changePercent}%
          </span>
        </div>
        <p className="text-[10px] text-[var(--text-secondary)] mb-2">Brent Crude (USD/barrel)</p>
        <div className="h-16 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={oil.data.slice(-20)}>
              <defs>
                <linearGradient id="oil-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={color} fill="url(#oil-grad)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  )
}
