'use client'
import { Users, ExternalLink } from 'lucide-react'
import WidgetCard from './WidgetCard'

export default function FamilySafetyWidget() {
  const links = [
    { label: 'Red Cross Family Links', url: 'https://familylinks.icrc.org', emoji: '🔴' },
    { label: 'Google Person Finder', url: 'https://google.org/personfinder', emoji: '🔍' },
    { label: 'Send Money via Western Union', url: 'https://westernunion.com', emoji: '💸' },
    { label: 'UNRWA Emergency Contacts', url: 'https://unrwa.org', emoji: '🇺🇳' },
  ]

  return (
    <WidgetCard
sources={[{'name':'ICRC','url':'https://www.icrc.org'},{'name':'UNHCR','url':'https://www.unhcr.org'}]}
            icon={Users}
      title="Family Safety"
      urgency="warning"
      expandedContent={
        <div className="text-xs text-[var(--text-secondary)] space-y-1">
          <p>• Check in regularly via messaging apps</p>
          <p>• Share your location with family members</p>
          <p>• Register with your embassy if abroad</p>
          <p>• Keep emergency contacts saved offline</p>
        </div>
      }
    >
      <div className="space-y-1.5">
        {links.map((l, i) => (
          <a
            key={i}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs p-1.5 rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <span>{l.emoji}</span>
            <span className="flex-1">{l.label}</span>
            <ExternalLink className="w-3 h-3 text-[var(--text-secondary)]" />
          </a>
        ))}
      </div>
    </WidgetCard>
  )
}
