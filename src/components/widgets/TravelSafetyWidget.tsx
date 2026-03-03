'use client'
import { Map } from 'lucide-react'
import WidgetCard from './WidgetCard'
import { getImpactEventIds } from '@/lib/countryImpact'
import { HelpDbCountry } from '@/types'

interface Props {
  country: string
  filterTopic?: string | null
  helpData?: HelpDbCountry | null
}

type Zone = { region: string; status: string; color: string; dot: string }

const ZONE_DATA: Record<string, Zone[]> = {
  'middle-east': [
    { region: 'Iran', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Israel/Palestine', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Lebanon', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Iraq', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Gulf States', status: 'Caution', color: 'text-amber-500', dot: 'bg-amber-500' },
    { region: 'Turkey', status: 'Caution', color: 'text-amber-500', dot: 'bg-amber-500' },
  ],
  'ukraine-russia': [
    { region: 'Ukraine (East)', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Ukraine (West)', status: 'High Risk', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Russia', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Belarus', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Moldova', status: 'Caution', color: 'text-amber-500', dot: 'bg-amber-500' },
    { region: 'Poland/Baltics', status: 'Normal', color: 'text-green-500', dot: 'bg-green-500' },
  ],
  'china-taiwan': [
    { region: 'Taiwan', status: 'High Risk', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'South China Sea', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'China', status: 'Caution', color: 'text-amber-500', dot: 'bg-amber-500' },
    { region: 'Philippines', status: 'Caution', color: 'text-amber-500', dot: 'bg-amber-500' },
    { region: 'Japan/S. Korea', status: 'Normal', color: 'text-green-500', dot: 'bg-green-500' },
  ],
  'taliban-pakistan': [
    { region: 'Afghanistan', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Pakistan (KP/FATA)', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Pakistan (Balochistan)', status: 'High Risk', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Pakistan (Urban)', status: 'Caution', color: 'text-amber-500', dot: 'bg-amber-500' },
    { region: 'India (Border)', status: 'Caution', color: 'text-amber-500', dot: 'bg-amber-500' },
  ],
  'venezuela': [
    { region: 'Venezuela', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Colombia (Border)', status: 'High Risk', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Brazil (Border)', status: 'Caution', color: 'text-amber-500', dot: 'bg-amber-500' },
    { region: 'Guyana', status: 'Caution', color: 'text-amber-500', dot: 'bg-amber-500' },
  ],
  'sudan': [
    { region: 'Khartoum', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Darfur', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Sudan (All)', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Chad (Border)', status: 'High Risk', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Egypt (South)', status: 'Caution', color: 'text-amber-500', dot: 'bg-amber-500' },
  ],
  'korea': [
    { region: 'North Korea', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'DMZ Area', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'South Korea', status: 'Caution', color: 'text-amber-500', dot: 'bg-amber-500' },
    { region: 'Japan', status: 'Normal', color: 'text-green-500', dot: 'bg-green-500' },
  ],
  'sahel': [
    { region: 'Mali', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Burkina Faso', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Niger', status: 'Do Not Travel', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Nigeria (North)', status: 'High Risk', color: 'text-red-500', dot: 'bg-red-500' },
    { region: 'Senegal/Ghana', status: 'Caution', color: 'text-amber-500', dot: 'bg-amber-500' },
  ],
}

const EXPANDED_NOTES: Record<string, string[]> = {
  'middle-east': ['• Many airlines rerouting around Iranian airspace', '• Travel insurance may not cover conflict zones', '• Register with your embassy before traveling'],
  'ukraine-russia': ['• All flights over Ukraine suspended', '• Land borders congested with refugees', '• Western airlines avoiding Russian airspace'],
  'china-taiwan': ['• Taiwan Strait shipping lanes at risk', '• Flight disruptions possible across East Asia', '• Monitor NOTAM updates for the region'],
  'taliban-pakistan': ['• Border crossings frequently closed', '• Kidnapping risk elevated for foreigners', '• Consular services extremely limited in Afghanistan'],
  'venezuela': ['• Commercial flights severely limited', '• Overland routes through Colombia dangerous', '• Embassy services suspended in Caracas'],
  'sudan': ['• All airports closed or heavily damaged', '• Evacuation flights sporadic', '• Humanitarian corridors unreliable'],
  'korea': ['• Seoul within artillery range of DMZ', '• Evacuation plans for 200K+ foreign nationals', '• Monitor missile test warnings'],
  'sahel': ['• French nationals advised to leave', '• Overland travel extremely dangerous', '• Jihadist attacks on highways common'],
}

export default function TravelSafetyWidget({ country, filterTopic, helpData }: Props) {
  const slug = country.toLowerCase().replace(/\s+/g, '-')
  const impactOrder = getImpactEventIds(slug)
  const eventId = filterTopic || impactOrder[0] || 'middle-east'
  const zones = ZONE_DATA[eventId] || ZONE_DATA['middle-east']
  const notes = EXPANDED_NOTES[eventId] || EXPANDED_NOTES['middle-east']

  // Override the current country's status with real advisory data if available
  const advisoryStatus = helpData?.advisoryLevel
    ? helpData.advisoryLevel >= 4 ? 'Do Not Travel'
      : helpData.advisoryLevel >= 3 ? 'High Risk'
      : helpData.advisoryLevel >= 2 ? 'Caution'
      : 'Normal'
    : null

  return (
    <WidgetCard
      sources={[{ name: 'US State Department', url: 'https://travel.state.gov' }, { name: 'UK FCDO', url: 'https://www.gov.uk/foreign-travel-advice' }]}
      icon={Map}
      title="Travel Safety"
      urgency={helpData?.advisoryLevel && helpData.advisoryLevel >= 3 ? 'critical' : 'warning'}
      expandedContent={
        <div className="text-xs text-[var(--text-secondary)] space-y-1">
          {advisoryStatus && <p>• <span className="font-medium text-[var(--text-primary)]">{country}</span>: {advisoryStatus} (Level {helpData?.advisoryLevel})</p>}
          {notes.map((n, i) => <p key={i}>{n}</p>)}
        </div>
      }
    >
      <div className="space-y-1">
        {zones.map((z, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${z.dot}`} />
              <span className="text-xs">{z.region}</span>
            </div>
            <span className={`text-[10px] font-medium ${z.color}`}>{z.status}</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
