'use client'

import { createContext, useContext, useRef, useCallback } from 'react'

export type CharRect = {
  id: string
  x: number
  y: number
  width: number
  height: number
}

type CharPositionContextType = {
  getPositions: () => CharRect[]
  setPositions: (rects: CharRect[]) => void
}

const CharPositionContext = createContext<CharPositionContextType>({
  getPositions: () => [],
  setPositions: () => {},
})

export function CharPositionProvider({ children }: { children: React.ReactNode }) {
  const posRef = useRef<CharRect[]>([])

  const getPositions = useCallback(() => posRef.current, [])
  const setPositions = useCallback((rects: CharRect[]) => {
    posRef.current = rects
  }, [])

  return (
    <CharPositionContext value={{ getPositions, setPositions }}>
      {children}
    </CharPositionContext>
  )
}

export function useCharPositions() {
  return useContext(CharPositionContext)
}
