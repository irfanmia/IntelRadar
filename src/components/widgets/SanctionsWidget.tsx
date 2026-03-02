'use client'
import { Landmark } from 'lucide-react'
import WidgetCard from './WidgetCard'

export default function SanctionsWidget() {
  return (
    <WidgetCard
sources={[{'name':'US Treasury (OFAC)','url':'https://ofac.treasury.gov'},{'name':'EU Sanctions Map','url':'https://sanctionsmap.eu'}]}
            icon={Landmark}
      title="Sanctions Watch"
      urgency="info"
      expandedContent={
        <div className="text-xs text-[var(--text-secondary)] space-y-1">
          <p>• New sanctions on Iranian oil exports</p>
          <p>• SWIFT restrictions expanded for Iranian banks</p>
          <p>• Shipping insurance complications in Gulf</p>
          <p>• Supply chain diversification recommended</p>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-[var(--bg-primary)] text-center">
          <p className="text-lg font-bold text-red-500">12</p>
          <p className="text-[10px] text-[var(--text-secondary)]">New Sanctions</p>
        </div>
        <div className="p-2 rounded-lg bg-[var(--bg-primary)] text-center">
          <p className="text-lg font-bold text-amber-500">8</p>
          <p className="text-[10px] text-[var(--text-secondary)]">Trade Impacts</p>
        </div>
      </div>
    </WidgetCard>
  )
}
