'use client'
import { UserPreferences } from '@/types'

const STORAGE_KEY = 'intelradar_prefs'

const defaults: UserPreferences = {
  country: '', topics: [], focusTopic: 'middle-east', darkMode: false, onboarded: false,
}

export function getPreferences(): UserPreferences {
  if (typeof window === 'undefined') return defaults
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults
  } catch { return defaults }
}

export function savePreferences(prefs: Partial<UserPreferences>) {
  if (typeof window === 'undefined') return
  const current = getPreferences()
  const updated = { ...current, ...prefs }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function clearPreferences() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
