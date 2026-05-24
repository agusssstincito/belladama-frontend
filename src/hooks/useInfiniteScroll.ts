'use client'

import { useEffect, useCallback, useRef } from 'react'

interface UseInfiniteScrollOptions {
  threshold?: number
  rootMargin?: string
}

export function useInfiniteScroll(
  callback: () => void,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 0, rootMargin = '100px' } = options
  const observerRef = useRef<IntersectionObserver | null>(null)
  const targetRef = useRef<HTMLDivElement | null>(null)

  const setTarget = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    if (node) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            callback()
          }
        },
        { threshold, rootMargin }
      )
      observerRef.current.observe(node)
    }

    targetRef.current = node
  }, [callback, threshold, rootMargin])

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return { setTarget }
}