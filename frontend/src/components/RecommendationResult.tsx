import type { RecommendationItem } from '../types/api'
import { getFragranceImage } from '../lib/fragranceImages'

interface Props {
  results: RecommendationItem[]
}

function PrimaryCard({ item }: { item: RecommendationItem }) {
  const image = getFragranceImage(item.brand, item.name)
  return (
    <div className="bg-indigo-950/50 border border-indigo-700 rounded-2xl p-8 md:p-10 shadow-lg shadow-indigo-950/50">
      <div className="flex items-start justify-between gap-4 mb-6">
        <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">Top Pick</p>
        <span className="shrink-0 text-6xl font-black text-indigo-400/20 leading-none">1</span>
      </div>
      <div className="flex items-center gap-6 min-w-0">
        {image && (
          <img
            src={image}
            alt={item.name}
            className="shrink-0 w-28 h-28 md:w-32 md:h-32 rounded-2xl object-contain bg-indigo-950 border border-indigo-800 p-2"
          />
        )}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">{item.name}</h2>
          <p className="text-base text-zinc-400 mt-1">{item.brand}</p>
        </div>
      </div>
      <p className="mt-6 text-base text-zinc-300 leading-relaxed">{item.reason}</p>
    </div>
  )
}

function AlternativeCard({ item, rank }: { item: RecommendationItem; rank: number }) {
  const image = getFragranceImage(item.brand, item.name)
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          {image && (
            <img
              src={image}
              alt={item.name}
              className="shrink-0 w-10 h-10 rounded-lg object-contain bg-zinc-800 border border-zinc-700 p-1"
            />
          )}
          <div>
            <h3 className="font-semibold text-white">{item.name}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">{item.brand}</p>
          </div>
        </div>
        <span className="shrink-0 text-lg text-zinc-600 font-bold">{rank}</span>
      </div>
      <p className="mt-3 text-xs text-zinc-400 leading-relaxed">{item.reason}</p>
    </div>
  )
}

export default function RecommendationResult({ results }: Props) {
  const [primary, ...alternatives] = results

  return (
    <div className="space-y-4">
      {primary && <PrimaryCard item={primary} />}
      {alternatives.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {alternatives.map((item, i) => (
            <AlternativeCard key={item.id} item={item} rank={i + 2} />
          ))}
        </div>
      )}
    </div>
  )
}
