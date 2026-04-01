import { apiDelete, apiGetList, apiGet, apiPatch, apiPost } from './client'
import type {
  CollectionItem,
  CollectionItemCreate,
  CollectionItemDetail,
  CollectionItemUpdate,
  MetaResponse,
  OwnershipType,
} from '../types/api'

export interface CollectionParams {
  limit?: number
  offset?: number
  brand?: string
  ownership_type?: OwnershipType
  min_rating?: number
}

export async function getCollection(
  params?: CollectionParams,
): Promise<{ items: CollectionItemDetail[]; meta: MetaResponse }> {
  return apiGetList<CollectionItemDetail>('/collection/', params)
}

export async function getCollectionItem(id: number): Promise<CollectionItemDetail> {
  return apiGet<CollectionItemDetail>(`/collection/${id}`)
}

export async function addToCollection(data: CollectionItemCreate): Promise<CollectionItem> {
  return apiPost<CollectionItem>('/collection/', data)
}

export async function updateCollectionItem(
  id: number,
  data: CollectionItemUpdate,
): Promise<CollectionItem> {
  return apiPatch<CollectionItem>(`/collection/${id}`, data)
}

export async function deleteCollectionItem(id: number): Promise<void> {
  return apiDelete(`/collection/${id}`)
}
