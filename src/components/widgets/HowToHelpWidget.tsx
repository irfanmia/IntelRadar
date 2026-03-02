'use client'
import { Heart, ExternalLink } from 'lucide-react'
import WidgetCard from './WidgetCard'

export default function HowToHelpWidget() {
  const orgs = [
    { name: 'UNRWA', url: 'https://donate.unrwa.org', desc: 'Palestine Refugees' },
    { name: 'ICRC', url: 'https://icrc.org/donate', desc: 'International Red Cross' },
    { name: 'MSF', url: 'https://msf.org/donate', desc: 'Doctors Without Borders' },
    { name: 'UNHCR', url: 'https://unhcr.org/donate', desc: 'UN Refugee Agency' },
  ]

  return (
    <WidgetCard
sources={[{'name':'ICRC','url':'https://www.icrc.org'},{'name':'UNHCR','url':'https://www.unhcr.org'},{'name':'WFP','url':'https://www.wfp.org'}]}
            icon={Heart}
      title="How to Help"
      urgency="info"
    >
      <div className="space-y-1.5">
        {orgs.map((o, i) => (
          <a
            key={i}
            href={o.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <p className="text-xs font-medium">{o.name}</p>
              <p className="text-[10px] text-[var(--text-secondary)]">{o.desc}</p>
            </div>
            <ExternalLink className="w-3 h-3 text-[var(--text-secondary)]" />
          </a>
        ))}
      </div>
    </WidgetCard>
  )
}
