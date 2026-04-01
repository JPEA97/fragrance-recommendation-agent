import { useCallback, useState } from 'react'
import { getCollection } from '../api/collection'
import type { CollectionParams } from '../api/collection'
import type { CollectionItemDetail, MetaResponse } from '../types/api'

export function useCollection() {
  const [items, setItems] = useState<CollectionItemDetail[]>([])
  const [meta, setMeta] = useState<MetaResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (params?: CollectionParams) => {
    setLoading(true)
    setError(null)
    try {
      const result = await getCollection(params)
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collection')
    } finally {
      setLoading(false)
    }
  }, [])

  return { items, meta, loading, error, load }
}
