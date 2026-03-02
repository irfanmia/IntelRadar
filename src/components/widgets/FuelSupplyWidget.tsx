'use client'
import { Fuel } from 'lucide-react'
import WidgetCard from './WidgetCard'

interface Props {
  country: string
  oilPrice?: number
  oilChange?: number
  exchangeRate?: number
}

// Approximate retail fuel prices per litre in local currency (based on Brent crude + local taxes/subsidies)
// These are conversion factors from Brent USD/barrel to local pump price per litre
const FUEL_CONFIG: Record<string, { symbol: string; unit: string; factor: number; currency: string }> = {
  'United Arab Emirates': { symbol: 'د.إ', unit: '/litre', factor: 0.032, currency: 'AED' },
  'Saudi Arabia': { symbol: '﷼', unit: '/litre', factor: 0.014, currency: 'SAR' },
  'Qatar': { symbol: '﷼', unit: '/litre', factor: 0.022, currency: 'QAR' },
  'Kuwait': { symbol: 'د.ك', unit: '/litre', factor: 0.004, currency: 'KWD' },
  'Bahrain': { symbol: '.د.ب', unit: '/litre', factor: 0.004, currency: 'BHD' },
  'Oman': { symbol: '﷼', unit: '/litre', factor: 0.005, currency: 'OMR' },
  'Lebanon': { symbol: 'ل.ل', unit: '/litre', factor: 1150, currency: 'LBP' },
  'Iraq': { symbol: 'ع.د', unit: '/litre', factor: 9.5, currency: 'IQD' },
  'Jordan': { symbol: 'د.ا', unit: '/litre', factor: 0.012, currency: 'JOD' },
  'Egypt': { symbol: 'ج.م', unit: '/litre', factor: 0.57, currency: 'EGP' },
  'Turkey': { symbol: '₺', unit: '/litre', factor: 0.56, currency: 'TRY' },
  'Pakistan': { symbol: '₨', unit: '/litre', factor: 3.8, currency: 'PKR' },
  'India': { symbol: '₹', unit: '/litre', factor: 1.25, currency: 'INR' },
  'United States': { symbol: '$', unit: '/gallon', factor: 0.048, currency: 'USD' },
  'United Kingdom': { symbol: '£', unit: '/litre', factor: 0.019, currency: 'GBP' },
  'Germany': { symbol: '€', unit: '/litre', factor: 0.022, currency: 'EUR' },
  'France': { symbol: '€', unit: '/litre', factor: 0.024, currency: 'EUR' },
  'Japan': { symbol: '¥', unit: '/litre', factor: 2.1, currency: 'JPY' },
  'South Korea': { symbol: '₩', unit: '/litre', factor: 22, currency: 'KRW' },
  'Australia': { symbol: 'A$', unit: '/litre', factor: 0.022, currency: 'AUD' },
  'Canada': { symbol: 'C$', unit: '/litre', factor: 0.021, currency: 'CAD' },
  'Brazil': { symbol: 'R$', unit: '/litre', factor: 0.078, currency: 'BRL' },
  'Iran': { symbol: '﷼', unit: '/litre', factor: 0.8, currency: 'IRR' }, // heavily subsidized
  'Israel': { symbol: '₪', unit: '/litre', factor: 0.095, currency: 'ILS' },
}

const DEFAULT_CONFIG = { symbol: '$', unit: '/litre', factor: 0.018, currency: 'USD' }

export default function FuelSupplyWidget({ country, oilPrice = 77.53, oilChange = 0.22 }: Props) {
  const config = FUEL_CONFIG[country] || DEFAULT_CONFIG
  const localPrice = Math.round(oilPrice * config.factor * 100) / 100

  return (
    <WidgetCard
sources={[{'name':'Yahoo Finance','url':'https://finance.yahoo.com'},{'name':'Reuters','url':'https://reuters.com'}]}
            icon={Fuel}
      title="Fuel & Supplies"
      urgency="warning"
      expandedContent={
        <div className="text-xs text-[var(--text-secondary)] space-y-1">
          <p>• Brent Crude: ${oilPrice}/barrel ({oilChange >= 0 ? '+' : ''}{oilChange}%)</p>
          <p>• Global oil supply disrupted due to Gulf tensions</p>
          <p>• QatarEnergy LNG production halted</p>
          <p>• Supply chain delays expected for imports</p>
          <p>• Consider stockpiling essentials</p>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-[var(--bg-primary)] text-center">
          <p className="text-lg font-bold">{config.symbol}{localPrice}</p>
          <p className="text-[10px] text-[var(--text-secondary)]">Petrol{config.unit}</p>
          <p className={`text-[10px] font-medium ${oilChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            {oilChange >= 0 ? '↑' : '↓'} {Math.abs(oilChange)}%
          </p>
        </div>
        <div className="p-2 rounded-lg bg-[var(--bg-primary)] text-center">
          <p className="text-lg font-bold">⚠️</p>
          <p className="text-[10px] text-[var(--text-secondary)]">Supply Chain</p>
          <p className="text-[10px] font-medium text-amber-500">Disrupted</p>
        </div>
      </div>
    </WidgetCard>
  )
}
