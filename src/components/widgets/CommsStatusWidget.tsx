'use client'
import { Radio, Wifi, WifiOff, Phone } from 'lucide-react'
import WidgetCard from './WidgetCard'

interface Props {
  status: string
  country: string
}

const STATUS_INFO: Record<string, { label: string; color: string; icon: 'on' | 'off' }> = {
  normal: { label: 'Operational', color: 'text-green-500', icon: 'on' },
  'partially-disrupted': { label: 'Partially Disrupted', color: 'text-yellow-500', icon: 'on' },
  disrupted: { label: 'Disrupted', color: 'text-orange-500', icon: 'on' },
  blackout: { label: 'Blackout', color: 'text-red-500', icon: 'off' },
}

export default function CommsStatusWidget({ status, country }: Props) {
  const info = STATUS_INFO[status] || STATUS_INFO.normal
  const WifiIcon = info.icon === 'off' ? WifiOff : Wifi

  return (
    <WidgetCard
sources={[{'name':'IODA (Georgia Tech)','url':'https://ioda.inetintel.cc.gatech.edu'},{'name':'Cloudflare Radar','url':'https://radar.cloudflare.com'}]}
            icon={Radio}
      title="Communications"
      urgency={status === 'blackout' ? 'critical' : status === 'disrupted' ? 'warning' : 'safe'}
      expandedContent={
        <div className="space-y-2 text-xs">
          <p className="font-medium">Alternative Methods:</p>
          <div className="space-y-1.5 text-[var(--text-secondary)]">
            <p>• Satellite phones (Thuraya/Iridium)</p>
            <p>• Ham radio frequencies</p>
            <p>• Mesh networking apps (Briar, Bridgefy)</p>
            <p>• SMS may still work on limited networks</p>
          </div>
        </div>
      }
    >
      <div className="flex items-center gap-3">
        <WifiIcon className={`w-8 h-8 ${info.color}`} />
        <div>
          <p className={`text-lg font-bold ${info.color}`}>{info.label}</p>
          <p className="text-[10px] text-[var(--text-secondary)]">Internet & Phone — {country}</p>
        </div>
      </div>
    </WidgetCard>
  )
}
