import { useState } from 'react'
import { getRecommendations } from '../api/recommendation'
import { ApiError } from '../api/client'
import type { RecommendationItem, RecommendationRequest } from '../types/api'

export function useRecommendation() {
  const [results, setResults] = useState<RecommendationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emptyCollection, setEmptyCollection] = useState(false)

  async function recommend(context: RecommendationRequest) {
    setLoading(true)
    setError(null)
    setEmptyCollection(false)
    setResults([])
    try {
      const items = await getRecommendations(context)
      setResults(items)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setEmptyCollection(true)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to get recommendations')
      }
    } finally {
      setLoading(false)
    }
  }

  return { results, loading, error, emptyCollection, recommend }
}
