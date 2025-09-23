'use client'

import { useState, useEffect, useCallback } from 'react'
import { commentsService } from '@/services/comments.service'
import { RealtimeManager } from '@/lib/realtime/realtime-manager'

interface UseCommentCountOptions {
  postSlug: string
  initialCount?: number
  enableRealtime?: boolean
}

export function useCommentCount({
  postSlug,
  initialCount = 0,
  enableRealtime = true
}: UseCommentCountOptions) {
  const [count, setCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Load initial count
  const loadCount = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const newCount = await commentsService.getCommentCount(postSlug)
      setCount(newCount)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [postSlug])

  // Setup realtime updates
  useEffect(() => {
    if (!enableRealtime || !postSlug) return

    const manager = new RealtimeManager(postSlug)

    // Listen for comment changes
    const unsubscribers = [
      manager.on('comment:new', () => {
        setCount(prev => prev + 1)
      }),
      manager.on('comment:delete', () => {
        setCount(prev => Math.max(0, prev - 1))
      })
    ]

    manager.subscribe()

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe())
      manager.unsubscribe()
    }
  }, [postSlug, enableRealtime])

  // Load initial count if not provided
  useEffect(() => {
    if (initialCount === 0 && postSlug) {
      loadCount()
    }
  }, [postSlug, initialCount, loadCount])

  return {
    count,
    isLoading,
    error,
    reload: loadCount
  }
}

// Hook for multiple posts
interface UseCommentCountsOptions {
  postSlugs: string[]
  enableRealtime?: boolean
}

export function useCommentCounts({
  postSlugs
}: UseCommentCountsOptions) {
  const [counts, setCounts] = useState<Map<string, number>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Load all counts
  const loadCounts = useCallback(async () => {
    if (!postSlugs.length) return

    setIsLoading(true)
    setError(null)

    try {
      const countsMap = await commentsService.getCommentCounts(postSlugs)
      setCounts(countsMap)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [postSlugs])

  // Load counts when slugs change
  useEffect(() => {
    loadCounts()
  }, [loadCounts])

  // Helper function to get count for specific slug
  const getCount = useCallback((slug: string) => {
    return counts.get(slug) || 0
  }, [counts])

  return {
    counts,
    getCount,
    isLoading,
    error,
    reload: loadCounts
  }
}