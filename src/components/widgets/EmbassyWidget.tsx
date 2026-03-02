'use client'
import { Landmark, Phone } from 'lucide-react'
import WidgetCard from './WidgetCard'
import { HelpDbCountry } from '@/types'
import { countryFlagUrl } from '@/lib/countryFlags'

interface Props {
  helpData: HelpDbCountry | null
}

export default function EmbassyWidget({ helpData }: Props) {
  const embassies = helpData?.embassies || []
  const advisory = helpData?.advisoryLevel || 1
  const advisoryNote = helpData?.advisoryNote || ''

  const levels = ['', 'Normal Precautions', 'Increased Caution', 'Reconsider Travel', 'Do Not Travel']
  const colors = ['', 'text-green-500', 'text-yellow-500', 'text-orange-500', 'text-red-500']

  return (
    <WidgetCard
sources={[{'name':'US State Department','url':'https://travel.state.gov'}]}
            icon={Landmark}
      title="Embassy Advisory"
      urgency={advisory >= 4 ? 'critical' : advisory >= 3 ? 'warning' : 'info'}
      expandedContent={
        <div className="space-y-2">
          {advisoryNote && <p className="text-xs text-[var(--text-secondary)]">{advisoryNote}</p>}
          {embassies.length > 0 && (
            <div className="space-y-1.5">
              {embassies.slice(0, 3).map((e, i) => {
                const flag = countryFlagUrl(e.country, 16)
                return (
                  <div key={i} className="text-xs flex items-center gap-1.5">
                    {flag && <img src={flag} alt={e.country} className="w-4 h-3 rounded-sm object-cover" />}
                    <span className="font-medium">{e.country}</span>
                    <a href={`tel:${e.phone}`} className="text-blue-500 ml-1" onClick={ev => ev.stopPropagation()}>
                      {e.phone}
                    </a>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      }
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-lg font-bold ${colors[advisory]}`}>Level {advisory}</p>
          <p className="text-xs text-[var(--text-secondary)]">{levels[advisory]}</p>
        </div>
        <div className="text-right text-[10px] text-[var(--text-secondary)]">
          {embassies.length} embassies listed
        </div>
      </div>
    </WidgetCard>
  )
}
