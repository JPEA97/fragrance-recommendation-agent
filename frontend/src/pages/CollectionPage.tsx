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
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [brand, setBrand] = useState('')
  const [ownershipType, setOwnershipType] = useState<OwnershipType | ''>('')
  const [minRating, setMinRating] = useState<number | ''>('')

  function buildParams() {
    return {
      limit: LIMIT,
      offset,
      ...(brand ? { brand } : {}),
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
    load(buildParams())
  }

  function clearFilters() {
    setBrand('')
    setOwnershipType('')
    setMinRating('')
    setOffset(0)
    load({ limit: LIMIT, offset: 0 })
  }

  const count = meta?.count ?? 0
  const hasNext = count === LIMIT
  const hasPrev = offset > 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">My Collection</h1>
        <Link
          to="/collection/add"
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          + Add
        </Link>
      </div>

      {/* Filter bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl mb-4 overflow-hidden">
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          <span>Filters</span>
          <span className="text-zinc-500">{filtersOpen ? '▲' : '▼'}</span>
        </button>
        {filtersOpen && (
          <div className="px-4 pb-4 border-t border-zinc-800 space-y-4">
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Search brand…"
                  className="w-full px-2.5 py-1.5 rounded-md border border-zinc-700 bg-zinc-800 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Type</label>
                <div className="flex gap-1 flex-wrap">
                  {ownershipOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setOwnershipType(opt.value as OwnershipType | '')}
                      className={`px-2 py-1 rounded text-xs font-medium border ${
                        ownershipType === opt.value
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Min Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-md border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Any</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n}+
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-300 border border-zinc-700 hover:bg-zinc-800 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

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
          <div className="space-y-3">
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
