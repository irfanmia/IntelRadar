# 🛰️ IntelRadar

**Real-time geopolitical intelligence dashboard for the public.**

🔗 **Live:** [intelradar.vercel.app](https://intelradar.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green)

---

## What is IntelRadar?

IntelRadar aggregates data from verified, authoritative sources to give you a real-time picture of global conflicts and their impact — tailored to your country.

**No opinions. No assumptions. Just data.**

### Features

- 🌍 **Country-specific dashboard** — pick your country, see what matters to you
- 📰 **Live news from 30+ RSS feeds** — BBC, Al Jazeera, Reuters, NY Times, Guardian, Dawn, SCMP, France 24, and more
- 🏛️ **Government sources** — US State Dept, Pentagon, UN (all regions), WAM, IRNA, SPA
- 📊 **Financial data** — real exchange rates, stock indices (5Y history), gold, oil prices
- ✈️ **Airport & flight status** — derived from State Dept advisories + IODA + live news
- 📡 **Communications status** — real-time internet monitoring via IODA (Georgia Tech)
- 🛡️ **Travel advisories** — direct from US State Department (211 countries)
- 🏥 **Emergency help** — hospitals, embassies, shelters, emergency contacts for 37 countries
- 🔄 **Auto-refresh every 20 minutes** via cron
- 🎨 **23 customizable widgets** — pick what you want on your dashboard
- 🌙 **Dark mode by default** — Apple-style glassmorphism design

### Data Sources

| Category | Sources |
|----------|---------|
| **News** | Al Jazeera, BBC (World/Regional), Reuters, NY Times, Washington Post, The Guardian, France 24, SCMP, Dawn, Times of India |
| **Government** | US State Dept, US Pentagon, United Nations (6 regional feeds), WAM (UAE), IRNA (Iran), SPA (Saudi) |
| **Financial** | Yahoo Finance (indices + historical), Open Exchange Rates (25 currencies) |
| **Advisories** | US State Department Travel Advisories RSS (211 countries, Levels 1-4) |
| **Internet Status** | IODA - Internet Outage Detection & Analysis (Georgia Tech) — real BGP + ping data |
| **Airport Status** | Derived from: State Dept advisory level + IODA comms + news headline analysis |

### Geopolitical Topics Tracked

- 🇮🇱🇮🇷 US-Israel-Iran War
- 🇺🇦🇷🇺 Ukraine-Russia
- 🇨🇳🇹🇼 China-Taiwan
- 🇵🇰 Taliban-Pakistan
- 🇻🇪 Venezuela
- 🇸🇩 Sudan
- 🇰🇵 Korean Peninsula
- 🇲🇱 Sahel Region

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + CSS Variables
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Hosting:** Vercel (free tier)
- **Data:** RSS feeds + free APIs (no API keys required)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
git clone https://github.com/irfanmia/IntelRadar.git
cd IntelRadar
npm install

# Fetch live data
npx tsx scripts/fetch-data.ts        # News + financial data
npx tsx scripts/fetch-historical.ts  # 5-year stock/gold/oil history
npx tsx scripts/fetch-status.ts      # Travel advisories + internet status

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/irfanmia/IntelRadar)

Or manually:

```bash
npm i -g vercel
vercel --prod
```

### Auto-refresh (Cron)

Set up a local cron to fetch fresh data and redeploy every 20 minutes:

```bash
# Add to crontab
crontab -e

# Add this line:
*/20 * * * * /path/to/IntelRadar/scripts/sync.sh
```

The `sync.sh` script:
1. Fetches fresh RSS news + financial data
2. Updates country statuses (advisories, internet, airport)
3. Deploys to Vercel

---

## Project Structure

```
intelradar/
├── public/data/
│   ├── live-feed.json        # News + financial data (auto-generated)
│   ├── historical.json       # 5-year stock/gold/oil history
│   └── help-db.json          # Emergency help database (37 countries)
├── scripts/
│   ├── fetch-data.ts         # RSS + financial data fetcher
│   ├── fetch-historical.ts   # Yahoo Finance historical data
│   ├── fetch-status.ts       # Travel advisory + IODA internet status
│   └── sync.sh               # Cron script (fetch + deploy)
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main dashboard
│   │   └── api/feed/route.ts # API endpoint for live feed
│   ├── components/
│   │   ├── widgets/          # 23 widget components
│   │   ├── Header.tsx
│   │   ├── HelpSection.tsx
│   │   ├── CountryOnboarding.tsx
│   │   └── SourceLogo.tsx    # Favicon renderer
│   ├── lib/
│   │   ├── useLiveFeed.ts    # Data fetching hook
│   │   ├── widgetCatalog.ts  # Widget registry
│   │   ├── countryFlags.ts   # Flag utilities
│   │   └── preferences.ts   # localStorage persistence
│   └── types/index.ts
└── package.json
```

---

## Airport Status Derivation

IntelRadar derives airport status from multiple signals — no manual input:

| Status | Condition |
|--------|-----------|
| 🟢 Open | Advisory L1-2, no concerning news |
| 🟡 Partially Open | News mentions "limited flights" / "some flights" |
| 🟠 Frequent Cancellations | News mentions flight cancellations |
| 🟠 Diversions Active | News mentions rerouting / diversions |
| 🟡 Restricted | Advisory L3 or airspace restrictions in news |
| 🔴 Closed | Advisory L4 or "airspace closed" in news |

---

## Contributing

PRs welcome! Areas that need work:

- [ ] More country data in `help-db.json` (currently 37, need 195)
- [ ] Better gold/oil price APIs (current ones use fallback defaults)
- [ ] Fix failing RSS feeds (Khaleej Times, Gulf News, Al Arabiya)
- [ ] NOTAM integration for real airport data
- [ ] Push notifications for breaking news
- [ ] Mobile app (React Native)

---

## License

MIT

---

Built with ☕ in Dubai by [webcoffee.in](https://webcoffee.in)
