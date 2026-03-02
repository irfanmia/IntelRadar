/** Get country flag emoji from ISO2 code */
export function flagEmoji(iso2: string): string {
  const code = iso2.toUpperCase()
  return String.fromCodePoint(...Array.from(code).map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
}

/** Get flag image URL from ISO2 code (flagcdn.com - free, no key) */
export function flagUrl(iso2: string, size: 16 | 20 | 24 | 28 | 32 | 40 | 48 | 56 | 64 = 32): string {
  return `https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${iso2.toLowerCase()}.png`
}

/** Country name → ISO2 mapping for common countries */
const NAME_TO_ISO2: Record<string, string> = {
  'Afghanistan': 'AF', 'Algeria': 'DZ', 'Australia': 'AU', 'Bahrain': 'BH',
  'Bangladesh': 'BD', 'Brazil': 'BR', 'Burkina Faso': 'BF', 'Canada': 'CA',
  'China': 'CN', 'Colombia': 'CO', 'Democratic Republic of Congo': 'CD',
  'Egypt': 'EG', 'Ethiopia': 'ET', 'France': 'FR', 'Germany': 'DE',
  'India': 'IN', 'Indonesia': 'ID', 'Iran': 'IR', 'Iraq': 'IQ',
  'Israel': 'IL', 'Japan': 'JP', 'Jordan': 'JO', 'Kenya': 'KE',
  'Kuwait': 'KW', 'Lebanon': 'LB', 'Libya': 'LY', 'Malaysia': 'MY',
  'Mali': 'ML', 'Mexico': 'MX', 'Morocco': 'MA', 'Myanmar': 'MM',
  'Nepal': 'NP', 'New Zealand': 'NZ', 'Niger': 'NE', 'Nigeria': 'NG',
  'North Korea': 'KP', 'Oman': 'OM', 'Pakistan': 'PK', 'Palestine': 'PS',
  'Philippines': 'PH', 'Qatar': 'QA', 'Russia': 'RU', 'Saudi Arabia': 'SA',
  'Singapore': 'SG', 'Somalia': 'SO', 'South Africa': 'ZA', 'South Korea': 'KR',
  'South Sudan': 'SS', 'Sri Lanka': 'LK', 'Sudan': 'SD', 'Syria': 'SY',
  'Taiwan': 'TW', 'Thailand': 'TH', 'Turkey': 'TR', 'Ukraine': 'UA',
  'United Arab Emirates': 'AE', 'United Kingdom': 'GB', 'United States': 'US',
  'Venezuela': 'VE', 'Vietnam': 'VN', 'Yemen': 'YE',
}

export function countryToIso2(name: string): string | null {
  return NAME_TO_ISO2[name] || null
}

export function countryFlagUrl(name: string, size: 16 | 20 | 24 | 28 | 32 | 40 | 48 | 56 | 64 = 32): string | null {
  const iso2 = countryToIso2(name)
  return iso2 ? flagUrl(iso2, size) : null
}
