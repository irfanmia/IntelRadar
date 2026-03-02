'use client'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import WidgetCard from './WidgetCard'
import { FinancialData } from '@/types'

interface Props {
  stock: FinancialData
  gold: FinancialData
  oil: FinancialData
}

function MiniChart({ data, color }: { data: { time: string; value: number }[]; color: string }) {
  return (
    <div className="h-10 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.slice(-20)}>
          <defs>
            <linearGradient id={`ec-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={color} fill={`url(#ec-${color})`} strokeWidth={1.5} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function Metric({ data }: { data: FinancialData }) {
  const positive = data.change >= 0
  const color = positive ? '#22c55e' : '#ef4444'
  const Icon = positive ? TrendingUp : TrendingDown

  return (
    <div className="p-2 rounded-xl bg-[var(--bg-primary)]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-[var(--text-secondary)] font-medium">{data.label}</span>
        <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${positive ? 'text-green-500' : 'text-red-500'}`}>
          <Icon className="w-2.5 h-2.5" />
          {positive ? '+' : ''}{data.changePercent}%
        </span>
      </div>
      <p className="text-sm font-bold">{data.value.toLocaleString()}</p>
      <MiniChart data={data.data} color={color} />
    </div>
  )
}

export default function EconomyWidget({ stock, gold, oil }: Props) {
  return (
    <WidgetCard
sources={[{'name':'Yahoo Finance','url':'https://finance.yahoo.com'},{'name':'Open Exchange Rates','url':'https://open.er-api.com'}]}
            icon={TrendingUp}
      title="Economy Dashboard"
      size="lg"
      urgency="info"
    >
      <div className="grid grid-cols-3 gap-2">
        <Metric data={stock} />
        <Metric data={gold} />
        <Metric data={oil} />
      </div>
    </WidgetCard>
  )
}
