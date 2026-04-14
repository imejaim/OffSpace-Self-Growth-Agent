'use client'

import React, { useEffect, useRef } from 'react'
import { useAppRouter, ViewType } from '@/lib/router-context'
import CarouselStage from '@/components/CarouselStage'

export default function RootController({ initialView }: { initialView?: ViewType }) {
  const { activeView, navigate } = useAppRouter()
  const seededRef = useRef(false)

  useEffect(() => {
    if (seededRef.current) return
    seededRef.current = true
    if (initialView && activeView !== initialView) {
      navigate(initialView, 'right')
    }
  }, [initialView, activeView, navigate])

  return <CarouselStage />
}
