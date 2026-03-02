'use client'
import { Hospital, Phone, MapPin } from 'lucide-react'
import WidgetCard from './WidgetCard'
import { HelpDbCountry } from '@/types'

interface Props {
  helpData: HelpDbCountry | null
}

export default function HospitalsWidget({ helpData }: Props) {
  const hospitals = helpData?.hospitals || []

  return (
    <WidgetCard
sources={[{'name':'WHO','url':'https://www.who.int'},{'name':'Local Health Ministry','url':'#'}]}
            icon={Hospital}
      title={`Hospitals (${hospitals.length})`}
      urgency="info"
      expandedContent={
        hospitals.length > 2 ? (
          <div className="space-y-2">
            {hospitals.slice(2).map((h, i) => (
              <div key={i} className="p-2 rounded-lg bg-[var(--bg-primary)]">
                <p className="text-xs font-medium">{h.name}</p>
                <p className="text-[10px] text-[var(--text-secondary)]">{h.city}</p>
                <a href={`tel:${h.phone.replace(/[^+\d]/g, '')}`} className="text-[10px] text-blue-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-2.5 h-2.5" />{h.phone}
                </a>
              </div>
            ))}
          </div>
        ) : undefined
      }
    >
      <div className="space-y-2">
        {hospitals.slice(0, 2).map((h, i) => (
          <div key={i} className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{h.name}</p>
              <p className="text-[10px] text-[var(--text-secondary)]">{h.city}</p>
            </div>
            <a
              href={`tel:${h.phone.replace(/[^+\d]/g, '')}`}
              className="flex-shrink-0 px-2 py-1 rounded-lg bg-green-500/10 text-green-600 text-[10px] font-medium"
              onClick={e => e.stopPropagation()}
            >
              📞 Call
            </a>
          </div>
        ))}
        {hospitals.length === 0 && (
          <p className="text-xs text-[var(--text-secondary)]">No hospital data available</p>
        )}
      </div>
    </WidgetCard>
  )
}
