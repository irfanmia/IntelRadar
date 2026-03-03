'use client'
import { Pill } from 'lucide-react'
import WidgetCard from './WidgetCard'
import { HelpDbCountry } from '@/types'

interface Props {
  country: string
  helpData?: HelpDbCountry | null
}

function getEssentialStatus(advisoryLevel?: number) {
  if (!advisoryLevel || advisoryLevel <= 2) {
    return {
      water: { status: 'Available', color: 'text-green-500' },
      food: { status: 'Available', color: 'text-green-500' },
      medicine: { status: 'Available', color: 'text-green-500' },
    }
  }
  if (advisoryLevel === 3) {
    return {
      water: { status: 'Available', color: 'text-green-500' },
      food: { status: 'Limited', color: 'text-amber-500' },
      medicine: { status: 'Available', color: 'text-green-500' },
    }
  }
  // Level 4+
  return {
    water: { status: 'Limited', color: 'text-amber-500' },
    food: { status: 'Scarce', color: 'text-amber-500' },
    medicine: { status: 'Critical', color: 'text-red-500' },
  }
}

export default function EssentialsWidget({ country, helpData }: Props) {
  const essentials = getEssentialStatus(helpData?.advisoryLevel)

  return (
    <WidgetCard
      sources={[{ name: 'WFP', url: 'https://www.wfp.org' }, { name: 'OCHA', url: 'https://www.unocha.org' }]}
      icon={Pill}
      title="Essentials"
      urgency={helpData?.advisoryLevel && helpData.advisoryLevel >= 4 ? 'critical' : helpData?.advisoryLevel && helpData.advisoryLevel >= 3 ? 'warning' : 'safe'}
      expandedContent={
        <div className="space-y-2 text-xs text-[var(--text-secondary)]">
          <p className="font-medium text-[var(--text-primary)]">Stockpiling Checklist:</p>
          <div className="grid grid-cols-2 gap-1">
            {['Water (3-day supply)', 'Non-perishable food', 'First aid kit', 'Flashlight & batteries',
              'Medications', 'Important documents', 'Cash', 'Phone charger/power bank'].map((item, i) => (
              <p key={i} className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                {item}
              </p>
            ))}
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-[var(--bg-primary)]">
          <p className="text-sm">💧</p>
          <p className="text-[10px] text-[var(--text-secondary)]">Water</p>
          <p className={`text-[10px] font-medium ${essentials.water.color}`}>{essentials.water.status}</p>
        </div>
        <div className="p-2 rounded-lg bg-[var(--bg-primary)]">
          <p className="text-sm">🍞</p>
          <p className="text-[10px] text-[var(--text-secondary)]">Food</p>
          <p className={`text-[10px] font-medium ${essentials.food.color}`}>{essentials.food.status}</p>
        </div>
        <div className="p-2 rounded-lg bg-[var(--bg-primary)]">
          <p className="text-sm">💊</p>
          <p className="text-[10px] text-[var(--text-secondary)]">Medicine</p>
          <p className={`text-[10px] font-medium ${essentials.medicine.color}`}>{essentials.medicine.status}</p>
        </div>
      </div>
    </WidgetCard>
  )
}
