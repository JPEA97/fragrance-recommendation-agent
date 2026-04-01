import { apiGet, apiPost, apiPostForm } from './client'
import type { TokenResponse, UserCreate, UserResponse } from '../types/api'

export async function login(email: string, password: string): Promise<TokenResponse> {
  return apiPostForm<TokenResponse>('/auth/login', { username: email, password })
}

export async function register(data: UserCreate): Promise<UserResponse> {
  return apiPost<UserResponse>('/users/', data)
}

export async function getMe(): Promise<UserResponse> {
  return apiGet<UserResponse>('/users/me')
}
