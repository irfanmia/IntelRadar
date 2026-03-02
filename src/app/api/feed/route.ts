import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function GET() {
  const filePath = join(process.cwd(), 'public', 'data', 'live-feed.json')
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'No feed data yet. Run scripts/fetch-data.ts first.' }, { status: 404 })
  }
  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' },
  })
}
