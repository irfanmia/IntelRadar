'use client'
import { createContext, useContext } from 'react'

const WidgetCloseContext = createContext<(() => void) | undefined>(undefined)

export function WidgetCloseProvider({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return <WidgetCloseContext.Provider value={onClose}>{children}</WidgetCloseContext.Provider>
}

export function useWidgetClose() {
  return useContext(WidgetCloseContext)
}
