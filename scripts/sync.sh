#!/bin/bash
# IntelRadar: fetch data + status + deploy to Vercel
# Runs every 20 minutes via cron

export PATH="/opt/homebrew/bin:$PATH"
cd /Users/muhammedirfanalict/.openclaw/workspace/intelradar

LOG="logs/sync-$(date +%Y%m%d).log"
mkdir -p logs

echo "=== $(date) ===" >> "$LOG"

# Fetch fresh news + financial data
npx tsx scripts/fetch-data.ts >> "$LOG" 2>&1

# Fetch real country status (advisories, internet, airport)
npx tsx scripts/fetch-status.ts >> "$LOG" 2>&1

# Deploy to Vercel
npx vercel --prod --yes --no-color >> "$LOG" 2>&1

echo "=== Done ===" >> "$LOG"
