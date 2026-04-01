import type { RecommendationItem } from '../types/api'

interface Props {
  results: RecommendationItem[]
}

function PrimaryCard({ item }: { item: RecommendationItem }) {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">Top Pick</p>
          <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
          <p className="text-sm text-gray-600 mt-0.5">{item.brand}</p>
        </div>
        <span className="shrink-0 text-3xl">1</span>
      </div>
      <p className="mt-4 text-sm text-gray-700 leading-relaxed">{item.reason}</p>
    </div>
  )
}

function AlternativeCard({ item, rank }: { item: RecommendationItem; rank: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{item.brand}</p>
        </div>
        <span className="shrink-0 text-lg text-gray-300 font-bold">{rank}</span>
      </div>
      <p className="mt-3 text-xs text-gray-600 leading-relaxed">{item.reason}</p>
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
