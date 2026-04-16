import { useNavigate } from 'react-router-dom'
import type { CollectionItemDetail, OwnershipType } from '../types/api'
import { getFragranceImage } from '../lib/fragranceImages'

const ownershipLabels: Record<OwnershipType, string> = {
  full_bottle: 'Full Bottle',
  decant: 'Decant',
  sample: 'Sample',
}

const ownershipColors: Record<OwnershipType, string> = {
  full_bottle: 'bg-emerald-950/90 text-emerald-400 border border-emerald-800/50',
  decant: 'bg-blue-950/90 text-blue-400 border border-blue-800/50',
  sample: 'bg-zinc-900/90 text-zinc-400 border border-zinc-700/50',
}

interface Props {
  item: CollectionItemDetail
  index?: number
}

export default function CollectionCard({ item, index = 0 }: Props) {
  const navigate = useNavigate()
  const image = getFragranceImage(item.fragrance.brand, item.fragrance.name)

  return (
    <button
      onClick={() => navigate(`/collection/${item.id}`)}
      className="group w-full text-left card-enter"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className="relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden
                   group-hover:border-indigo-700/60 group-hover:-translate-y-2
                   group-hover:shadow-2xl group-hover:shadow-indigo-950/80
                   transition-all duration-300 ease-out"
      >
        {/* Image area */}
        <div className="relative h-52 overflow-hidden bg-zinc-900">
          {image ? (
            <img
              src={image}
              alt={item.fragrance.name}
              className="w-full h-full object-contain p-6
                         group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-900">
              <span className="text-8xl font-black text-indigo-400/20 select-none">
                {item.fragrance.name[0]}
              </span>
            </div>
          )}

          {/* Bottom fade into card body */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-zinc-900 to-transparent" />

          {/* Ownership badge — floats over the image */}
          <span
            className={`absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm ${ownershipColors[item.ownership_type]}`}
          >
            {ownershipLabels[item.ownership_type]}
          </span>
        </div>

        {/* Text content */}
        <div className="px-4 pb-4">
          <p className="font-semibold text-white leading-snug truncate">{item.fragrance.name}</p>
          <p className="text-xs text-zinc-500 mt-0.5 truncate">{item.fragrance.brand}</p>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-800 text-xs">
            {item.personal_rating !== null && (
              <span className="flex items-center gap-1">
                <span className="text-amber-400">★</span>
                <span className="text-zinc-300 font-medium">{item.personal_rating}</span>
              </span>
            )}
            <span className="text-zinc-600">{item.times_worn}× worn</span>
            {item.ml_remaining !== null && (
              <span className="text-zinc-600 ml-auto">{item.ml_remaining}ml</span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
