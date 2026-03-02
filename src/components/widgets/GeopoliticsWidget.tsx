'use client'
import { Globe } from 'lucide-react'
import WidgetCard from './WidgetCard'

export default function GeopoliticsWidget() {
  const alliances = [
    { side: 'US Coalition', members: 'US, Israel, UK, Germany, France', color: 'text-blue-500' },
    { side: 'Iran Axis', members: 'Iran, Hezbollah, Houthis, Iraqi militias', color: 'text-red-500' },
    { side: 'Neutral/Mediators', members: 'China, Turkey, Qatar, Oman', color: 'text-amber-500' },
  ]

  return (
    <WidgetCard
sources={[{'name':'Al Jazeera','url':'https://aljazeera.com'},{'name':'BBC News','url':'https://bbc.com/news'},{'name':'Reuters','url':'https://reuters.com'}]}
            icon={Globe}
      title="Geopolitics"
      urgency="info"
      expandedContent={
        <div className="text-xs text-[var(--text-secondary)] space-y-1">
          <p>• NATO Article 5 not invoked — US acting independently</p>
          <p>• China calls for immediate ceasefire</p>
          <p>• Russia positioning as mediator</p>
          <p>• UN Security Council emergency session ongoing</p>
          <p>• Escalation risk: <span className="text-amber-500 font-medium">HIGH</span></p>
        </div>
      }
    >
      <div className="space-y-2">
        {alliances.map((a, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={`text-xs font-bold ${a.color} w-24 flex-shrink-0`}>{a.side}</span>
            <span className="text-[11px] text-[var(--text-secondary)]">{a.members}</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
