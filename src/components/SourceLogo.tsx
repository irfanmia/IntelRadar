'use client'
import { useState } from 'react'

interface Props {
  logo: string
  name: string
  size?: number
  className?: string
}

/** Renders a source logo — if it's a URL, shows as <img>; if emoji, shows as <span> */
export default function SourceLogo({ logo, name, size = 16, className = '' }: Props) {
  const [error, setError] = useState(false)
  const isUrl = logo.startsWith('http')

  if (isUrl && !error) {
    return (
      <img
        src={logo}
        alt={name}
        width={size}
        height={size}
        className={`rounded-sm inline-block ${className}`}
        style={{ width: size, height: size, minWidth: size }}
        onError={() => setError(true)}
      />
    )
  }

  // Fallback: emoji or first letter
  return (
    <span
      className={`inline-flex items-center justify-center rounded-sm bg-[var(--bg-primary)] text-[10px] font-bold ${className}`}
      style={{ width: size, height: size, minWidth: size, fontSize: isUrl ? size * 0.6 : size * 0.8 }}
    >
      {isUrl ? name.charAt(0).toUpperCase() : logo}
    </span>
  )
}
