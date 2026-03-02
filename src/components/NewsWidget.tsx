'use client'
import { motion } from 'framer-motion'
import { BarChart, Bar, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { Share2, ExternalLink } from 'lucide-react'
import { NewsItem } from '@/types'
import SourceLogo from './SourceLogo'
import { shareToTwitter, shareToWhatsApp, shareToTelegram, shareToFacebook, shareToLinkedIn } from '@/lib/share'
import { useState } from 'react'

const urgencyStyles = {
  breaking: { badge: 'bg-red-500/10 text-red-600 dark:text-red-400', dot: 'bg-red-500', border: 'border-l-red-500' },
  important: { badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', border: 'border-l-amber-500' },
  info: { badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', dot: 'bg-blue-500', border: 'border-l-blue-500' },
}

export default function NewsWidget({ item, index }: { item: NewsItem; index: number }) {
  const [showShare, setShowShare] = useState(false)
  const style = urgencyStyles[item.urgency]
  const shareText = `${item.headline} — via IntelRadar`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`glass rounded-2xl overflow-hidden border-l-4 ${style.border}`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`} />
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badge}`}>
              {item.urgency}
            </span>
            <span className="text-[10px] text-[var(--text-secondary)]">
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="relative">
            <button onClick={() => setShowShare(!showShare)} className="p-1.5 rounded-lg hover:bg-[var(--bg-primary)] transition-colors">
              <Share2 className="w-3.5 h-3.5" />
            </button>
            {showShare && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-8 glass rounded-xl p-2 flex gap-1 z-10">
                {[
                  { label: '𝕏', fn: shareToTwitter }, { label: 'WA', fn: shareToWhatsApp },
                  { label: 'TG', fn: shareToTelegram }, { label: 'FB', fn: shareToFacebook },
                  { label: 'in', fn: shareToLinkedIn },
                ].map(s => (
                  <button key={s.label} onClick={() => { s.fn(shareText); setShowShare(false) }}
                    className="w-8 h-8 rounded-lg hover:bg-[var(--bg-primary)] text-xs font-bold transition-colors">
                    {s.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-[15px] leading-snug mb-2">{item.headline}</h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">{item.summary}</p>

        {item.chartData && item.widgetType === 'chart' && (
          <div className="h-32 mb-3 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={item.chartData}>
                <defs>
                  <linearGradient id={`grad-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', background: 'var(--bg-card)' }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fill={`url(#grad-${item.id})`} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {item.chartData && item.widgetType === 'stats' && (
          <div className="h-32 mb-3 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={item.chartData}>
                <XAxis dataKey="label" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', background: 'var(--bg-card)' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {item.sources.map(s => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[var(--bg-primary)] transition-colors group" title={s.name}>
              <SourceLogo logo={s.logo} name={s.name} size={16} />
              <span className="text-[10px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{s.name}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
