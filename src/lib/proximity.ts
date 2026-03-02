export type ProximityTier = 'direct' | 'indirect' | 'world'

const DIRECT_COUNTRIES = ['Iran', 'Israel', 'Palestine', 'United States']
const INDIRECT_COUNTRIES = [
  'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Lebanon', 'Iraq',
  'Pakistan', 'Kuwait', 'Bahrain', 'Oman', 'Jordan', 'Egypt',
  'Turkey', 'Syria', 'Yemen', 'India',
]

export function getProximityTier(country: string): ProximityTier {
  if (DIRECT_COUNTRIES.includes(country)) return 'direct'
  if (INDIRECT_COUNTRIES.includes(country)) return 'indirect'
  return 'world'
}

export const TIER_META: Record<ProximityTier, { label: string; color: string; emoji: string; bg: string }> = {
  direct: { label: 'Directly Involved', color: 'text-red-500', emoji: '🔴', bg: 'bg-red-500/10' },
  indirect: { label: 'Indirectly Affected', color: 'text-amber-500', emoji: '🟠', bg: 'bg-amber-500/10' },
  world: { label: 'Rest of World', color: 'text-yellow-500', emoji: '🟡', bg: 'bg-yellow-500/10' },
}

export const ALL_COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria',
  'Bahrain', 'Bangladesh', 'Belgium', 'Brazil', 'Canada', 'Chile', 'China',
  'Colombia', 'Czech Republic', 'Denmark', 'Egypt', 'Ethiopia', 'Finland',
  'France', 'Germany', 'Ghana', 'Greece', 'Hungary', 'India', 'Indonesia',
  'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan', 'Kazakhstan',
  'Kenya', 'Kuwait', 'Lebanon', 'Libya', 'Malaysia', 'Mexico', 'Morocco',
  'Nepal', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Oman',
  'Pakistan', 'Palestine', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Singapore', 'Somalia',
  'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan', 'Sweden',
  'Switzerland', 'Syria', 'Taiwan', 'Thailand', 'Tunisia', 'Turkey',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Venezuela', 'Vietnam', 'Yemen',
]
