'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UsePollingFeedResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function usePollingFeed<T = unknown>(
  url: string,
  interval: number = 30000
): UsePollingFeedResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const focusedRef = useRef(true)

  const fetchData = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller

    try {
      setError(null)
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as T
      setData(json)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError((err as Error).message ?? 'Unknown error')
      }
    } finally {
      setLoading(false)
    }
  }, [url])

  const scheduleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (focusedRef.current) {
        fetchData().then(scheduleNext)
      }
    }, interval)
  }, [fetchData, interval])

  const refetch = useCallback(() => {
    setLoading(true)
    fetchData().then(scheduleNext)
  }, [fetchData, scheduleNext])

  useEffect(() => {
    const onFocus = () => {
      focusedRef.current = true
      fetchData().then(scheduleNext)
    }
    const onBlur = () => {
      focusedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }

    window.addEventListener('focus', onFocus)
    window.addEventListener('blur', onBlur)

    // Initial fetch
    fetchData().then(scheduleNext)

    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)
      if (timerRef.current) clearTimeout(timerRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [fetchData, scheduleNext])

  return { data, loading, error, refetch }
}
