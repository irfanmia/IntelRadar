import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IntelRadar — Public Intelligence Dashboard',
  description: 'Real-time intelligence dashboard for global events, finance, and crisis monitoring.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
