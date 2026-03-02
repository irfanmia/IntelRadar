'use client'
import { Radar, Moon, Sun, RotateCcw, RefreshCw, LayoutDashboard, CircleHelp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface Props {
  darkMode: boolean
  onToggleDark: () => void
  onReset: () => void
  lastUpdated?: string | null
  onRefresh?: () => void
  showHelp: boolean
  onToggleHelp: (show: boolean) => void
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Header({ darkMode, onToggleDark, onReset, lastUpdated, onRefresh, showHelp, onToggleHelp }: Props) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(i)
  }, [])

  return (
    <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="glass sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Radar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight">IntelRadar</h1>
          <p className="text-[10px] text-[var(--text-secondary)] leading-tight">
            {lastUpdated ? `Updated ${timeAgo(lastUpdated)}` : 'Public Intelligence Dashboard'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {/* Dashboard / Help toggle */}
        <button onClick={() => onToggleHelp(!showHelp)} 
          className="p-2 rounded-xl hover:bg-[var(--bg-primary)] transition-colors" 
          title={showHelp ? 'Dashboard' : 'Help'}>
          {showHelp 
            ? <LayoutDashboard className="w-4.5 h-4.5" /> 
            : <CircleHelp className="w-4.5 h-4.5" />
          }
        </button>
        {onRefresh && (
          <button onClick={onRefresh} className="p-2 rounded-xl hover:bg-[var(--bg-primary)] transition-colors" title="Refresh data">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
        <button onClick={onToggleDark} className="p-2 rounded-xl hover:bg-[var(--bg-primary)] transition-colors" title="Toggle theme">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button onClick={onReset} className="p-2 rounded-xl hover:bg-[var(--bg-primary)] transition-colors" title="Reset preferences">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </motion.header>
  )
}
