#!/bin/bash
# IntelRadar: Staggered fetch + deploy pipeline
# Runs every 20 minutes via cron
#
# Timeline within each 20-min cycle:
#   min 0:  Fetch news + financial data + country batch 1 (countries 1-20)
#   min 5:  Fetch country batch 2 (countries 21-40)
#   min 10: Fetch country batch 3 (countries 41-60)
#   min 15: Commit + push → Vercel auto-deploys

export PATH="/opt/homebrew/bin:$PATH"
cd /Users/muhammedirfanalict/.openclaw/workspace/intelradar

LOG="logs/sync-$(date +%Y%m%d).log"
mkdir -p logs

PHASE="${1:-full}"

case "$PHASE" in
  phase1)
    echo "=== $(date) PHASE 1: News + Financial + Countries Batch 1 ===" >> "$LOG"
    npx tsx scripts/fetch-data.ts >> "$LOG" 2>&1
    npx tsx scripts/fetch-flights.ts >> "$LOG" 2>&1
    npx tsx scripts/fetch-status.ts --batch 1 >> "$LOG" 2>&1
    echo "=== Phase 1 Done ===" >> "$LOG"
    ;;
  phase2)
    echo "=== $(date) PHASE 2: Countries Batch 2 ===" >> "$LOG"
    npx tsx scripts/fetch-status.ts --batch 2 >> "$LOG" 2>&1
    echo "=== Phase 2 Done ===" >> "$LOG"
    ;;
  phase3)
    echo "=== $(date) PHASE 3: Countries Batch 3 ===" >> "$LOG"
    npx tsx scripts/fetch-status.ts --batch 3 >> "$LOG" 2>&1
    echo "=== Phase 3 Done ===" >> "$LOG"
    ;;
  deploy)
    echo "=== $(date) DEPLOY: Commit + Push ===" >> "$LOG"
    git add -A >> "$LOG" 2>&1
    git diff --cached --quiet || git commit -m "data: auto-sync $(date +%Y-%m-%d_%H:%M)" >> "$LOG" 2>&1
    git push >> "$LOG" 2>&1
    echo "=== Deploy Done ===" >> "$LOG"
    ;;
  full)
    # Legacy: run everything at once
    echo "=== $(date) FULL SYNC ===" >> "$LOG"
    npx tsx scripts/fetch-data.ts >> "$LOG" 2>&1
    npx tsx scripts/fetch-status.ts >> "$LOG" 2>&1
    git add -A >> "$LOG" 2>&1
    git diff --cached --quiet || git commit -m "data: auto-sync $(date +%Y-%m-%d_%H:%M)" >> "$LOG" 2>&1
    git push >> "$LOG" 2>&1
    echo "=== Full Sync Done ===" >> "$LOG"
    ;;
esac
