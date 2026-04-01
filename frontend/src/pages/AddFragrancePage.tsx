import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFragrances } from '../api/fragrances'
import { addToCollection } from '../api/collection'
import { ApiError } from '../api/client'
import type { FragranceListItem, OwnershipType } from '../types/api'

const LIMIT = 20

const ownershipOptions: { value: OwnershipType; label: string }[] = [
  { value: 'full_bottle', label: 'Full Bottle' },
  { value: 'decant', label: 'Decant' },
  { value: 'sample', label: 'Sample' },
]

interface AddModalProps {
  fragrance: FragranceListItem
  onClose: () => void
  onAdded: () => void
}

function AddModal({ fragrance, onClose, onAdded }: AddModalProps) {
  const [ownershipType, setOwnershipType] = useState<OwnershipType>('full_bottle')
  const [mlRemaining, setMlRemaining] = useState('')
  const [personalRating, setPersonalRating] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await addToCollection({
        fragrance_id: fragrance.id,
        ownership_type: ownershipType,
        ml_remaining: mlRemaining !== '' ? Number(mlRemaining) : null,
        personal_rating: personalRating !== '' ? Number(personalRating) : null,
      })
      onAdded()
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError('This fragrance is already in your collection.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to add fragrance')
      }
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl w-full max-w-sm p-6">
        <div className="mb-4">
          <h2 className="font-semibold text-white">{fragrance.name}</h2>
          <p className="text-sm text-zinc-400">{fragrance.brand}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-zinc-300 mb-2">Ownership type</p>
            <div className="flex gap-2 flex-wrap">
              {ownershipOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOwnershipType(opt.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
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
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Rating <span className="text-zinc-500 font-normal">(optional, 1–10)</span>
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPersonalRating(personalRating === String(n) ? '' : String(n))}
                  className={`w-8 h-8 rounded text-xs font-medium border transition-colors ${
                    personalRating === String(n)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="ml" className="block text-sm font-medium text-zinc-300 mb-1">
              ML remaining <span className="text-zinc-500 font-normal">(optional)</span>
            </label>
            <input
              id="ml"
              type="number"
              min={0}
              step={0.1}
              value={mlRemaining}
              onChange={(e) => setMlRemaining(e.target.value)}
              placeholder="e.g. 50"
              className="w-28 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-700 transition-colors"
            >
              {loading ? 'Adding…' : 'Add to collection'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-300 border border-zinc-700 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AddFragrancePage() {
  const navigate = useNavigate()
  const [fragrances, setFragrances] = useState<FragranceListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('')
  const [selected, setSelected] = useState<FragranceListItem | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function loadFragrances(params: { offset: number; search: string; brand: string }) {
    setLoading(true)
    setError(null)
    try {
      const { items, meta } = await getFragrances({
        limit: LIMIT,
        offset: params.offset,
        search: params.search || undefined,
        brand: params.brand || undefined,
      })
      setFragrances(items)
      setHasNext(meta.count === LIMIT)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fragrances')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFragrances({ offset: 0, search, brand })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function triggerSearch(newSearch: string, newBrand: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setOffset(0)
      loadFragrances({ offset: 0, search: newSearch, brand: newBrand })
    }, 300)
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setSearch(v)
    triggerSearch(v, brand)
  }

  function handleBrandChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setBrand(v)
    triggerSearch(search, v)
  }

  function handlePrev() {
    const next = Math.max(0, offset - LIMIT)
    setOffset(next)
    loadFragrances({ offset: next, search, brand })
  }

  function handleNext() {
    const next = offset + LIMIT
    setOffset(next)
    loadFragrances({ offset: next, search, brand })
  }

  function handleAdded() {
    navigate('/collection')
  }

  return (
    <div>
      {selected && (
        <AddModal
          fragrance={selected}
          onClose={() => setSelected(null)}
          onAdded={handleAdded}
        />
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">Add Fragrance</h1>
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name…"
            className="flex-1 px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            value={brand}
            onChange={handleBrandChange}
            placeholder="Filter by brand…"
            className="w-40 px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
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

      {!loading && !error && fragrances.length === 0 && (
        <p className="text-center text-zinc-400 py-12">No fragrances found.</p>
      )}

      {!loading && fragrances.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fragrances.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelected(f)}
                className="text-left bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-indigo-700 hover:shadow-sm transition-all"
              >
                <p className="font-semibold text-white truncate">{f.name}</p>
                <p className="text-sm text-zinc-400 mt-0.5">{f.brand}</p>
                <div className="mt-2 flex gap-2 text-xs text-zinc-500">
                  {f.release_year && <span>{f.release_year}</span>}
                  {f.gender_category && (
                    <span className="capitalize">{f.gender_category}</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6 text-sm text-zinc-400">
            <span>
              Showing {offset + 1}–{offset + fragrances.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={offset === 0}
                className="px-3 py-1 rounded-md border border-zinc-700 text-zinc-300 disabled:opacity-40 hover:bg-zinc-800 transition-colors"
              >
                Prev
              </button>
              <button
                onClick={handleNext}
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
