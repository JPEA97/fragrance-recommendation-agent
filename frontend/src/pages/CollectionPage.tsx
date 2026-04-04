import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCollection } from '../hooks/useCollection'
import CollectionCard from '../components/CollectionCard'
import type { OwnershipType } from '../types/api'

const LIMIT = 20

const ownershipOptions: { value: OwnershipType | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'full_bottle', label: 'Full Bottle' },
  { value: 'decant', label: 'Decant' },
  { value: 'sample', label: 'Sample' },
]

export default function CollectionPage() {
  const { items, meta, loading, error, load } = useCollection()
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState('')
  const [ownershipType, setOwnershipType] = useState<OwnershipType | ''>('')
  const [minRating, setMinRating] = useState<number | ''>('')

  function buildParams() {
    return {
      limit: LIMIT,
      offset,
      ...(search ? { query: search } : {}),
      ...(ownershipType ? { ownership_type: ownershipType } : {}),
      ...(minRating !== '' ? { min_rating: minRating } : {}),
    }
  }

  useEffect(() => {
    load(buildParams())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset])

  function applyFilters() {
    setOffset(0)
    load({ ...buildParams(), offset: 0 })
  }

  function clearFilters() {
    setSearch('')
    setOwnershipType('')
    setMinRating('')
    setOffset(0)
    load({ limit: LIMIT, offset: 0 })
  }

  const hasNext = (meta?.count ?? 0) === LIMIT
  const hasPrev = offset > 0

  // Stats from current page items
  const fullBottles = items.filter((i) => i.ownership_type === 'full_bottle').length
  const decants = items.filter((i) => i.ownership_type === 'decant').length
  const samples = items.filter((i) => i.ownership_type === 'sample').length

  return (
    <div>
      {/* ── Header ── */}
      <div className="sticky top-0 z-10 bg-zinc-950 pb-4 -mx-4 px-4 pt-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Collection</h1>
            {items.length > 0 && (
              <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                <span>
                  <span className="text-zinc-300 font-medium">{items.length}</span> showing
                </span>
                {fullBottles > 0 && (
                  <span>
                    <span className="text-indigo-400 font-medium">{fullBottles}</span> full
                  </span>
                )}
                {decants > 0 && (
                  <span>
                    <span className="text-indigo-300 font-medium">{decants}</span> decants
                  </span>
                )}
                {samples > 0 && (
                  <span>
                    <span className="text-zinc-400 font-medium">{samples}</span> samples
                  </span>
                )}
              </div>
            )}
          </div>
          <Link
            to="/collection/add"
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            + Add
          </Link>
        </div>

        {/* ── Filters ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="Search by name or brand…"
              className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-1">
              {ownershipOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOwnershipType(opt.value as OwnershipType | '')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    ownershipType === opt.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value === '' ? '' : Number(e.target.value))}
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Any rating</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>{n}+</option>
                ))}
              </select>
              <button
                onClick={applyFilters}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 border border-zinc-700 hover:bg-zinc-800 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-16">
          <p className="text-zinc-400 mb-3">Your collection is empty.</p>
          <Link
            to="/collection/add"
            className="inline-block px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Add your first fragrance
          </Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item) => (
              <CollectionCard key={item.id} item={item} />
            ))}
          </div>

          <div className="flex items-center justify-between mt-6 text-sm text-zinc-400">
            <span>
              Showing {offset + 1}–{offset + items.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setOffset((o) => Math.max(0, o - LIMIT))}
                disabled={!hasPrev}
                className="px-3 py-1 rounded-md border border-zinc-700 text-zinc-300 disabled:opacity-40 hover:bg-zinc-800 transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => setOffset((o) => o + LIMIT)}
                disabled={!hasNext}
                className="px-3 py-1 rounded-md border border-zinc-700 text-zinc-300 disabled:opacity-40 hover:bg-zinc-800 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
