'use client'
import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X, LucideIcon } from 'lucide-react'
import { useWidgetClose } from './WidgetContext'
import SourceAttribution, { WidgetSource } from './SourceAttribution'

export type WidgetSize = 'sm' | 'md' | 'lg' | 'full'

interface Props {
  icon: LucideIcon
  title: string
  size?: WidgetSize
  accentColor?: string
  urgency?: 'critical' | 'warning' | 'safe' | 'info'
  children: ReactNode
  expandedContent?: ReactNode
  className?: string
  onClose?: () => void
  sources?: WidgetSource[]
}

const urgencyBorder: Record<string, string> = {
  critical: 'border-l-red-500',
  warning: 'border-l-amber-500',
  safe: 'border-l-green-500',
  info: 'border-l-blue-500',
}

const urgencyIconBg: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-500',
  warning: 'bg-amber-500/10 text-amber-500',
  safe: 'bg-green-500/10 text-green-500',
  info: 'bg-blue-500/10 text-blue-500',
}

export default function WidgetCard({
  icon: Icon,
  title,
  size = 'md',
  urgency = 'info',
  children,
  expandedContent,
  className = '',
  onClose: onCloseProp,
  sources,
}: Props) {
  const contextClose = useWidgetClose()
  const onClose = onCloseProp || contextClose
  const [expanded, setExpanded] = useState(false)
  const hasExpanded = !!(expandedContent || (sources && sources.length > 0))

  const sizeClass = {
    sm: 'break-inside-avoid',
    md: 'break-inside-avoid',
    lg: 'break-inside-avoid',
    full: 'break-inside-avoid col-span-full',
  }[size]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`glass rounded-2xl overflow-hidden border-l-4 ${urgencyBorder[urgency]} mb-4 ${sizeClass} ${className}`}
      onClick={() => hasExpanded && setExpanded(!expanded)}
      style={{ cursor: hasExpanded ? 'pointer' : 'default' }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${urgencyIconBg[urgency]}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {hasExpanded && (
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              </motion.div>
            )}
            {onClose && (
              <button
                onClick={e => { e.stopPropagation(); onClose() }}
                className="p-1 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                title="Remove widget"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        {children}
      </div>
      <AnimatePresence>
        {expanded && hasExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-[var(--border)] pt-3">
              {expandedContent}
              {sources && sources.length > 0 && <SourceAttribution sources={sources} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
