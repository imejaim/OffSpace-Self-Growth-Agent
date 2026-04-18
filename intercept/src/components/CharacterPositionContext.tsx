'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'

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
  anchorId: string | null            // ADDED: active topic/section ID
  setAnchorId: (id: string | null) => void // ADDED
  anchorRect: DOMRect | null        // ADDED: rect of the anchored element
  setAnchorRect: (rect: DOMRect | null) => void // ADDED
}

const CharPositionContext = createContext<CharPositionContextType>({
  getPositions: () => [],
  setPositions: () => {},
  anchorId: null,
  setAnchorId: () => {},
  anchorRect: null,
  setAnchorRect: () => {},
})

export function CharPositionProvider({ children }: { children: React.ReactNode }) {
  const posRef = useRef<CharRect[]>([])
  const [anchorId, setAnchorId] = useState<string | null>(null)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)

  const getPositions = useCallback(() => posRef.current, [])
  const setPositions = useCallback((rects: CharRect[]) => {
    posRef.current = rects
  }, [])

  return (
    <CharPositionContext value={{ 
      getPositions, 
      setPositions, 
      anchorId, 
      setAnchorId, 
      anchorRect, 
      setAnchorRect 
    }}>
      {children}
    </CharPositionContext>
  )
}

export function useCharPositions() {
  return useContext(CharPositionContext)
}
