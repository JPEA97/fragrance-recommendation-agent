import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCollectionItem, updateCollectionItem, deleteCollectionItem } from '../api/collection'
import { ApiError } from '../api/client'
import type { CollectionItemDetail, CollectionItemUpdate, OwnershipType } from '../types/api'

const ownershipOptions: { value: OwnershipType; label: string }[] = [
  { value: 'full_bottle', label: 'Full Bottle' },
  { value: 'decant', label: 'Decant' },
  { value: 'sample', label: 'Sample' },
]

export default function CollectionItemPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [item, setItem] = useState<CollectionItemDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Editable fields
  const [ownershipType, setOwnershipType] = useState<OwnershipType>('full_bottle')
  const [mlRemaining, setMlRemaining] = useState<string>('')
  const [personalRating, setPersonalRating] = useState<string>('')
  const [timesWorn, setTimesWorn] = useState<string>('')

  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    getCollectionItem(Number(id))
      .then((data) => {
        setItem(data)
        setOwnershipType(data.ownership_type)
        setMlRemaining(data.ml_remaining !== null ? String(data.ml_remaining) : '')
        setPersonalRating(data.personal_rating !== null ? String(data.personal_rating) : '')
        setTimesWorn(String(data.times_worn))
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load item')
      })
      .finally(() => setLoading(false))
  }, [id])

  function markDirty() {
    setDirty(true)
    setSaveError(null)
  }

  async function handleSave() {
    if (!item) return
    setSaving(true)
    setSaveError(null)
    try {
      const payload: CollectionItemUpdate = {
        ownership_type: ownershipType,
        ml_remaining: mlRemaining !== '' ? Number(mlRemaining) : null,
        personal_rating: personalRating !== '' ? Number(personalRating) : null,
        times_worn: Number(timesWorn),
      }
      await updateCollectionItem(item.id, payload)
      setDirty(false)
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!item) return
    setDeleting(true)
    try {
      await deleteCollectionItem(item.id)
      navigate('/collection')
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to delete')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
        {error ?? 'Item not found.'}
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => navigate('/collection')}
        className="text-sm text-gray-500 hover:text-gray-900 mb-4 inline-block"
      >
        ← My Collection
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{item.fragrance.name}</h1>
        <p className="text-gray-500 mt-0.5">{item.fragrance.brand}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        {/* Ownership type */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Ownership type</p>
          <div className="flex gap-2">
            {ownershipOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setOwnershipType(opt.value)
                  markDirty()
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                  ownershipType === opt.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Personal rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personal rating <span className="text-gray-400 font-normal">(1–10)</span>
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setPersonalRating(personalRating === String(n) ? '' : String(n))
                  markDirty()
                }}
                className={`w-9 h-9 rounded-md text-sm font-medium border transition-colors ${
                  personalRating === String(n)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          {personalRating && (
            <button
              onClick={() => {
                setPersonalRating('')
                markDirty()
              }}
              className="mt-1 text-xs text-gray-400 hover:text-gray-600"
            >
              Clear rating
            </button>
          )}
        </div>

        {/* Times worn */}
        <div>
          <label htmlFor="timesWorn" className="block text-sm font-medium text-gray-700 mb-1">
            Times worn
          </label>
          <input
            id="timesWorn"
            type="number"
            min={0}
            value={timesWorn}
            onChange={(e) => {
              setTimesWorn(e.target.value)
              markDirty()
            }}
            className="w-32 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* ML remaining */}
        <div>
          <label htmlFor="mlRemaining" className="block text-sm font-medium text-gray-700 mb-1">
            ML remaining <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="mlRemaining"
            type="number"
            min={0}
            step={0.1}
            value={mlRemaining}
            onChange={(e) => {
              setMlRemaining(e.target.value)
              markDirty()
            }}
            className="w-32 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. 50"
          />
        </div>

        {saveError && <p className="text-sm text-red-600">{saveError}</p>}

        {dirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-700 transition-colors"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        )}
      </div>

      {/* Delete */}
      <div className="mt-6">
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Remove from collection
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700 mb-3">
              Remove <strong>{item.fragrance.name}</strong> from your collection?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-red-600 text-white disabled:opacity-40 hover:bg-red-700 transition-colors"
              >
                {deleting ? 'Removing…' : 'Yes, remove'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
