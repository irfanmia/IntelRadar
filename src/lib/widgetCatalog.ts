import { WidgetId } from '@/types'
import { ProximityTier } from './proximity'

export interface WidgetMeta {
  id: WidgetId
  label: string
  emoji: string
  description: string
  tier: ProximityTier // which tier it belongs to by default
}

export const WIDGET_CATALOG: WidgetMeta[] = [
  // Direct tier
  { id: 'safety-alert', label: 'Safety Alert', emoji: '🚨', description: 'Live safety & advisory status', tier: 'direct' },
  { id: 'strike-list', label: 'Strike Updates', emoji: '💥', description: 'Conflict strike reports', tier: 'direct' },
  { id: 'comms-status', label: 'Comms Status', emoji: '📡', description: 'Internet & phone network status', tier: 'direct' },
  { id: 'hospitals', label: 'Hospitals', emoji: '🏥', description: 'Nearby hospitals & emergency rooms', tier: 'direct' },
  { id: 'airport', label: 'Airport Status', emoji: '✈️', description: 'Airport operations & closures', tier: 'direct' },
  { id: 'military-orders', label: 'Military Orders', emoji: '🪖', description: 'Military directives & curfews', tier: 'direct' },
  { id: 'evacuation', label: 'Evacuation', emoji: '🚁', description: 'Evacuation routes & shelters', tier: 'direct' },
  { id: 'essentials', label: 'Essentials', emoji: '🛒', description: 'Food, water, fuel availability', tier: 'direct' },
  { id: 'news-ticker', label: 'News Ticker', emoji: '📰', description: 'Live news headlines', tier: 'direct' },
  { id: 'articles', label: 'Key Articles', emoji: '📑', description: 'Curated articles from major outlets', tier: 'direct' },
  // Indirect tier
  { id: 'threat-assessment', label: 'Threat Level', emoji: '🎯', description: 'Regional threat assessment', tier: 'indirect' },
  { id: 'economy', label: 'Economy', emoji: '📊', description: 'Stock, gold & oil overview', tier: 'indirect' },
  { id: 'flight-status', label: 'Flights', emoji: '🛫', description: 'Flight disruptions & reroutes', tier: 'indirect' },
  { id: 'fuel-supply', label: 'Fuel Supply', emoji: '⛽', description: 'Fuel prices & supply chain', tier: 'indirect' },
  { id: 'embassy', label: 'Embassies', emoji: '🏛️', description: 'Embassy contacts & alerts', tier: 'indirect' },
  { id: 'family-safety', label: 'Family Safety', emoji: '👨‍👩‍👧‍👦', description: 'Family safety checklist', tier: 'indirect' },
  { id: 'oil-price', label: 'Oil Price', emoji: '🛢️', description: 'Brent crude tracker', tier: 'indirect' },
  // World tier
  { id: 'market-impact', label: 'Market Impact', emoji: '📈', description: 'Global market effects', tier: 'world' },
  { id: 'geopolitics', label: 'Geopolitics', emoji: '🌍', description: 'Geopolitical analysis', tier: 'world' },
  { id: 'travel-safety', label: 'Travel Safety', emoji: '🧳', description: 'Travel advisories & warnings', tier: 'world' },
  { id: 'sanctions', label: 'Sanctions', emoji: '🚫', description: 'Sanctions & trade restrictions', tier: 'world' },
  { id: 'how-to-help', label: 'How to Help', emoji: '🤝', description: 'Humanitarian aid & donations', tier: 'world' },
  { id: 'investment', label: 'Investment', emoji: '💰', description: 'Investment outlook & risks', tier: 'world' },
]

export const DEFAULT_WIDGETS: Record<ProximityTier, WidgetId[]> = {
  direct: ['safety-alert', 'strike-list', 'comms-status', 'hospitals', 'airport', 'military-orders', 'evacuation', 'essentials', 'articles', 'news-ticker'],
  indirect: ['threat-assessment', 'economy', 'flight-status', 'fuel-supply', 'embassy', 'family-safety', 'articles', 'news-ticker', 'oil-price'],
  world: ['oil-price', 'market-impact', 'geopolitics', 'travel-safety', 'sanctions', 'how-to-help', 'articles', 'news-ticker', 'investment'],
}

export function getExtraWidgetOptions(tier: ProximityTier): WidgetMeta[] {
  const defaults = DEFAULT_WIDGETS[tier]
  return WIDGET_CATALOG.filter(w => !defaults.includes(w.id))
}
