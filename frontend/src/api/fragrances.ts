import { apiGet, apiGetList } from './client'
import type { FragranceDetail, FragranceListItem, MetaResponse } from '../types/api'

export interface FragranceParams {
  limit?: number
  offset?: number
  brand?: string
  search?: string
}

export async function getFragrances(
  params?: FragranceParams,
): Promise<{ items: FragranceListItem[]; meta: MetaResponse }> {
  return apiGetList<FragranceListItem>('/fragrances/', params)
}

export async function getFragrance(id: number): Promise<FragranceDetail> {
  return apiGet<FragranceDetail>(`/fragrances/${id}`)
}
