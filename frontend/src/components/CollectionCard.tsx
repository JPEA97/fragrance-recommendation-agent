import { useNavigate } from 'react-router-dom'
import type { CollectionItemDetail, OwnershipType } from '../types/api'

const ownershipLabels: Record<OwnershipType, string> = {
  full_bottle: 'Full Bottle',
  decant: 'Decant',
  sample: 'Sample',
}

const ownershipColors: Record<OwnershipType, string> = {
  full_bottle: 'bg-emerald-100 text-emerald-800',
  decant: 'bg-blue-100 text-blue-800',
  sample: 'bg-gray-100 text-gray-700',
}

interface Props {
  item: CollectionItemDetail
}

export default function CollectionCard({ item }: Props) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/collection/${item.id}`)}
      className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{item.fragrance.name}</p>
          <p className="text-sm text-gray-500 mt-0.5">{item.fragrance.brand}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${ownershipColors[item.ownership_type]}`}
        >
          {ownershipLabels[item.ownership_type]}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        {item.personal_rating !== null && (
          <span>
            Rating: <span className="font-medium text-gray-700">{item.personal_rating}/10</span>
          </span>
        )}
        <span>
          Worn: <span className="font-medium text-gray-700">{item.times_worn}×</span>
        </span>
        {item.ml_remaining !== null && (
          <span>
            <span className="font-medium text-gray-700">{item.ml_remaining}ml</span> left
          </span>
        )}
      </div>
    </button>
  )
}
