import { useState } from 'react'
import { Link } from 'react-router-dom'
import ContextForm from '../components/ContextForm'
import RecommendationResult from '../components/RecommendationResult'
import { useRecommendation } from '../hooks/useRecommendation'
import type { RecommendationRequest } from '../types/api'

export default function DashboardPage() {
  const [context, setContext] = useState<Partial<RecommendationRequest>>({})
  const { results, loading, error, emptyCollection, recommend } = useRecommendation()

  async function handleSubmit() {
    if (
      context.season &&
      context.occasion &&
      context.time_of_day &&
      context.weather &&
      context.location_type
    ) {
      await recommend(context as RecommendationRequest)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">What should I wear today?</h1>
        <p className="text-sm text-zinc-400 mt-1">Select your context and get a recommendation from your collection.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <ContextForm
          value={context}
          onChange={setContext}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {emptyCollection && (
        <div className="bg-amber-950/50 border border-amber-800 rounded-xl p-5 text-center">
          <p className="text-sm font-medium text-amber-300 mb-1">Your collection is empty</p>
          <p className="text-sm text-amber-400 mb-3">
            Add fragrances to your collection to get personalized recommendations.
          </p>
          <Link
            to="/collection/add"
            className="inline-block px-4 py-2 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors"
          >
            Add your first fragrance
          </Link>
        </div>
      )}

      {results.length > 0 && <RecommendationResult results={results} />}
    </div>
  )
}
