'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type ViewType = 'teatime' | 'my' | 'feed'

interface RouterContextType {
  activeView: ViewType
  lastDirection: 'left' | 'right' | null
  navigate: (view: ViewType, direction: 'left' | 'right') => void
  viewData: Record<string, any>
  updateViewData: (view: ViewType, data: any) => void
}

const RouterContext = createContext<RouterContextType | undefined>(undefined)

function viewFromPath(path: string): ViewType {
  if (path === '/my') return 'my'
  if (path === '/feed') return 'feed'
  return 'teatime'
}

const STORAGE_KEY = 'intercept_view_state'

export function AppRouterProvider({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState<ViewType>('teatime')
  const [lastDirection, setLastDirection] = useState<'left' | 'right' | null>(null)
  const [viewData, setViewData] = useState<Record<string, any>>({})

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setViewData(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved state', e)
      }
    }
  }, [])

  // Persist state when it changes
  useEffect(() => {
    if (Object.keys(viewData).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(viewData))
    }
  }, [viewData])

  const navigate = useCallback((view: ViewType, direction: 'left' | 'right') => {
    setLastDirection(direction)
    setActiveView(view)
    
    // Update URL without full page reload
    const path = view === 'teatime' ? '/teatime' : `/${view}`
    window.history.pushState({ view }, '', path)
  }, [])

  const updateViewData = useCallback((view: ViewType, data: any) => {
    setViewData((prev) => ({
      ...prev,
      [view]: { ...(prev[view] || {}), ...data }
    }))
  }, [])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setActiveView(viewFromPath(window.location.pathname))
    }

    // Align context state with the actual URL on first client mount.
    handlePopState()
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <RouterContext.Provider value={{ activeView, navigate, lastDirection, viewData, updateViewData }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useAppRouter() {
  const context = useContext(RouterContext)
  if (!context) throw new Error('useAppRouter must be used within AppRouterProvider')
  return context
}
