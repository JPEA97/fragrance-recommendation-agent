import { useNavigate } from 'react-router-dom'
import type { CollectionItemDetail, OwnershipType } from '../types/api'

const ownershipLabels: Record<OwnershipType, string> = {
  full_bottle: 'Full Bottle',
  decant: 'Decant',
  sample: 'Sample',
}

const ownershipColors: Record<OwnershipType, string> = {
  full_bottle: 'bg-emerald-950 text-emerald-400',
  decant: 'bg-blue-950 text-blue-400',
  sample: 'bg-zinc-800 text-zinc-400',
}

interface Props {
  item: CollectionItemDetail
}

export default function CollectionCard({ item }: Props) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/collection/${item.id}`)}
      className="w-full text-left bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-indigo-700 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{item.fragrance.name}</p>
          <p className="text-sm text-zinc-400 mt-0.5">{item.fragrance.brand}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${ownershipColors[item.ownership_type]}`}
        >
          {ownershipLabels[item.ownership_type]}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
        {item.personal_rating !== null && (
          <span>
            Rating: <span className="font-medium text-zinc-300">{item.personal_rating}/10</span>
          </span>
        )}
        <span>
          Worn: <span className="font-medium text-zinc-300">{item.times_worn}×</span>
        </span>
        {item.ml_remaining !== null && (
          <span>
            <span className="font-medium text-zinc-300">{item.ml_remaining}ml</span> left
          </span>
        )}
      </div>
    </button>
  )
}
