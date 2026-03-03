'use client'
import { NewsItem, FinancialData, HelpDbCountry, WidgetId } from '@/types'
import { WidgetCloseProvider } from './WidgetContext'
import WidgetPicker from './WidgetPicker'
import SafetyAlertWidget from './SafetyAlertWidget'
import StrikeListWidget from './StrikeListWidget'
import CommsStatusWidget from './CommsStatusWidget'
import HospitalsWidget from './HospitalsWidget'
import AirportWidget from './AirportWidget'
import MilitaryOrdersWidget from './MilitaryOrdersWidget'
import EvacuationWidget from './EvacuationWidget'
import EssentialsWidget from './EssentialsWidget'
import NewsTickerWidget from './NewsTickerWidget'
import ThreatAssessmentWidget from './ThreatAssessmentWidget'
import EconomyWidget from './EconomyWidget'
import FlightStatusWidget from './FlightStatusWidget'
import FuelSupplyWidget from './FuelSupplyWidget'
import EmbassyWidget from './EmbassyWidget'
import FamilySafetyWidget from './FamilySafetyWidget'
import OilPriceWidget from './OilPriceWidget'
import GeopoliticsWidget from './GeopoliticsWidget'
import MarketImpactWidget from './MarketImpactWidget'
import TravelSafetyWidget from './TravelSafetyWidget'
import SanctionsWidget from './SanctionsWidget'
import HowToHelpWidget from './HowToHelpWidget'
import InvestmentWidget from './InvestmentWidget'
import ArticlesWidget from './ArticlesWidget'
import { getImpactEventIds } from '@/lib/countryImpact'

interface Props {
  country: string
  news: NewsItem[]
  financials: { stock: FinancialData; gold: FinancialData; oil: FinancialData }
  helpData: HelpDbCountry | null
  widgets: WidgetId[]
  onUpdateWidgets: (widgets: WidgetId[]) => void
  filterTopic?: string | null
}

function RenderWidget({ id, country, news, financials, helpData, filterTopic }: {
  id: WidgetId
  country: string
  news: NewsItem[]
  financials: Props['financials']
  helpData: HelpDbCountry | null
  filterTopic?: string | null
}) {
  const slug = country.toLowerCase().replace(/\s+/g, '-')
  const impactOrder = getImpactEventIds(slug)

  // Filter or sort news based on active impact filter
  const filteredNews = filterTopic
    ? news.filter(n => n.topic === filterTopic)
    : news.sort((a, b) => {
        const aIdx = impactOrder.indexOf(a.topic)
        const bIdx = impactOrder.indexOf(b.topic)
        const aScore = aIdx >= 0 ? aIdx : 999
        const bScore = bIdx >= 0 ? bIdx : 999
        return aScore - bScore
      })

  const middleEastNews = filterTopic
    ? filteredNews
    : news.filter(n => n.topic === 'middle-east')

  switch (id) {
    case 'safety-alert':
      return <SafetyAlertWidget country={country} advisoryLevel={helpData?.advisoryLevel} advisoryNote={helpData?.advisoryNote} commsStatus={helpData?.commsStatus} />
    case 'strike-list':
      return <StrikeListWidget news={middleEastNews} />
    case 'comms-status':
      return <CommsStatusWidget status={helpData?.commsStatus || 'normal'} country={country} />
    case 'hospitals':
      return <HospitalsWidget helpData={helpData} />
    case 'airport':
      return <AirportWidget status={helpData?.airportStatus || 'restricted'} country={country} />
    case 'military-orders':
      return <MilitaryOrdersWidget news={middleEastNews} country={country} />
    case 'evacuation':
      return <EvacuationWidget helpData={helpData} />
    case 'essentials':
      return <EssentialsWidget country={country} />
    case 'news-ticker':
      return <NewsTickerWidget news={filterTopic ? filteredNews : middleEastNews} title="Latest Updates" />
    case 'articles':
      return <ArticlesWidget news={filterTopic ? filteredNews : middleEastNews} title="Key Articles" />
    case 'threat-assessment':
      return <ThreatAssessmentWidget country={country} />
    case 'economy':
      return <EconomyWidget stock={financials.stock} gold={financials.gold} oil={financials.oil} />
    case 'flight-status':
      return <FlightStatusWidget country={country} airportStatus={helpData?.airportStatus} />
    case 'fuel-supply':
      return <FuelSupplyWidget country={country} oilPrice={financials.oil.value} oilChange={financials.oil.changePercent} />
    case 'embassy':
      return <EmbassyWidget helpData={helpData} />
    case 'family-safety':
      return <FamilySafetyWidget />
    case 'oil-price':
      return <OilPriceWidget oil={financials.oil} />
    case 'market-impact':
      return <MarketImpactWidget stock={financials.stock} gold={financials.gold} />
    case 'geopolitics':
      return <GeopoliticsWidget />
    case 'travel-safety':
      return <TravelSafetyWidget />
    case 'sanctions':
      return <SanctionsWidget />
    case 'how-to-help':
      return <HowToHelpWidget />
    case 'investment':
      return <InvestmentWidget />
    default:
      return null
  }
}

export default function WidgetGrid({ country, news, financials, helpData, widgets, onUpdateWidgets, filterTopic }: Props) {
  return (
    <div className="px-4 sm:px-6 py-4 space-y-4">
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
        {widgets.map(id => (
          <WidgetCloseProvider key={id} onClose={() => onUpdateWidgets(widgets.filter(w => w !== id))}>
            <RenderWidget id={id} country={country} news={news} financials={financials} helpData={helpData} filterTopic={filterTopic} />
          </WidgetCloseProvider>
        ))}
      </div>

      {/* Customize button */}
      <WidgetPicker selected={widgets} onUpdate={onUpdateWidgets} />
    </div>
  )
}
