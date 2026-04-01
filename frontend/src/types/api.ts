export type OwnershipType = 'full_bottle' | 'decant' | 'sample'
export type Season = 'spring' | 'summer' | 'fall' | 'winter'
export type Occasion = 'casual' | 'office' | 'date' | 'wedding' | 'formal' | 'party'
export type TimeOfDay = 'early_morning' | 'day' | 'evening' | 'night'
export type Weather = 'hot' | 'mild' | 'cold' | 'rainy'
export type LocationType = 'indoor' | 'outdoor'
export type GenderCategory = 'masculine' | 'feminine' | 'unisex'

export interface MetaResponse {
  limit: number | null
  offset: number | null
  count: number
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface UserResponse {
  id: number
  email: string
  username: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserCreate {
  email: string
  username: string
  password: string
}

export interface FragranceListItem {
  id: number
  name: string
  brand: string
  release_year: number | null
  gender_category: GenderCategory | null
}

export interface FragranceDetail extends FragranceListItem {
  description: string | null
}

export interface CollectionItemCreate {
  fragrance_id: number
  ownership_type: OwnershipType
  ml_remaining?: number | null
  personal_rating?: number | null
}

export interface CollectionItemUpdate {
  ownership_type?: OwnershipType
  ml_remaining?: number | null
  personal_rating?: number | null
  times_worn?: number
}

export interface CollectionFragrance {
  id: number
  name: string
  brand: string
}

export interface CollectionItem {
  id: number
  fragrance_id: number
  ownership_type: OwnershipType
  ml_remaining: number | null
  personal_rating: number | null
  times_worn: number
  created_at: string
}

export interface CollectionItemDetail {
  id: number
  ownership_type: OwnershipType
  ml_remaining: number | null
  personal_rating: number | null
  times_worn: number
  created_at: string
  fragrance: CollectionFragrance
}

export interface RecommendationRequest {
  season: Season
  occasion: Occasion
  time_of_day: TimeOfDay
  weather: Weather
  location_type: LocationType
}

export interface RecommendationItem {
  id: number
  name: string
  brand: string
  reason: string
}
