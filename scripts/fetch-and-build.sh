#!/bin/bash
set -e
cd "$(dirname "$0")/.."
echo "[$(date)] Running IntelRadar data fetch..."
npx tsx scripts/fetch-data.ts
echo "[$(date)] Done."
