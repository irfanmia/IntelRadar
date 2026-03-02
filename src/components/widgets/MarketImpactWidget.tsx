'use client'
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import WidgetCard from './WidgetCard'
import { FinancialData } from '@/types'

interface Props {
  stock: FinancialData
  gold: FinancialData
}

export default function MarketImpactWidget({ stock, gold }: Props) {
  return (
    <WidgetCard
sources={[{'name':'Yahoo Finance','url':'https://finance.yahoo.com'},{'name':'Open Exchange Rates','url':'https://open.er-api.com'}]}
            icon={BarChart3}
      title="Market Impact"
      urgency="info"
      expandedContent={
        <div className="text-xs text-[var(--text-secondary)] space-y-1">
          <p>• Defense stocks surging globally</p>
          <p>• Energy sector highly volatile</p>
          <p>• Gold acting as safe haven</p>
          <p>• Crypto seeing inflows as hedge</p>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[var(--text-secondary)]">{stock.label}</span>
            <span className={`text-[10px] font-semibold ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
            </span>
          </div>
          <p className="text-sm font-bold">{stock.value.toLocaleString()}</p>
          <div className="h-8 mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stock.data.slice(-15)}>
                <Area type="monotone" dataKey="value" stroke={stock.change >= 0 ? '#22c55e' : '#ef4444'} fill="transparent" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[var(--text-secondary)]">{gold.label}</span>
            <span className={`text-[10px] font-semibold ${gold.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {gold.change >= 0 ? '+' : ''}{gold.changePercent}%
            </span>
          </div>
          <p className="text-sm font-bold">{gold.value.toLocaleString()}</p>
          <div className="h-8 mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gold.data.slice(-15)}>
                <Area type="monotone" dataKey="value" stroke={gold.change >= 0 ? '#22c55e' : '#ef4444'} fill="transparent" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </WidgetCard>
  )
}
