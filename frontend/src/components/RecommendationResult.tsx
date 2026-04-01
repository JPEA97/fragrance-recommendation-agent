import type { RecommendationItem } from '../types/api'

interface Props {
  results: RecommendationItem[]
}

function PrimaryCard({ item }: { item: RecommendationItem }) {
  return (
    <div className="bg-indigo-950/50 border border-indigo-800 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-1">Top Pick</p>
          <h2 className="text-xl font-bold text-white">{item.name}</h2>
          <p className="text-sm text-zinc-400 mt-0.5">{item.brand}</p>
        </div>
        <span className="shrink-0 text-3xl">1</span>
      </div>
      <p className="mt-4 text-sm text-zinc-300 leading-relaxed">{item.reason}</p>
    </div>
  )
}

function AlternativeCard({ item, rank }: { item: RecommendationItem; rank: number }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-white">{item.name}</h3>
          <p className="text-xs text-zinc-400 mt-0.5">{item.brand}</p>
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
