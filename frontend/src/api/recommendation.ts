import { apiPostList } from './client'
import type { RecommendationItem, RecommendationRequest } from '../types/api'

export async function getRecommendations(
  context: RecommendationRequest,
): Promise<RecommendationItem[]> {
  return apiPostList<RecommendationItem>('/recommendation/', context)
}
