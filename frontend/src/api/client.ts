import type { MetaResponse } from '../types/api'

const BASE_URL = 'http://127.0.0.1:8000'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly type: string,
    message: string,
    public readonly details: unknown = null,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getToken(): string | null {
  return sessionStorage.getItem('token')
}

async function request(
  path: string,
  options: RequestInit = {},
  skipAuthRedirect = false,
): Promise<unknown> {
  const token = getToken()
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 204) {
    return null
  }

  if (res.status === 401) {
    if (!skipAuthRedirect) {
      sessionStorage.removeItem('token')
      window.location.href = '/login'
    }
    const json = (await res.json()) as { error?: { type: string; message: string; details: unknown } }
    const err = json.error
    throw new ApiError(401, err?.type ?? 'auth_error', err?.message ?? 'Unauthorized', err?.details)
  }

  const json = await res.json()

  if (!res.ok) {
    const err = (json as { error?: { type: string; message: string; details: unknown } }).error
    if (err) throw new ApiError(res.status, err.type, err.message, err.details)
    throw new ApiError(res.status, 'unknown_error', 'An unexpected error occurred')
  }

  return json
}

function buildQS(params: Record<string, string | number | boolean | null | undefined>): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== undefined && v !== '') {
      p.set(k, String(v))
    }
  }
  return p.toString()
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>,
): Promise<T> {
  const qs = params ? buildQS(params) : ''
  const url = qs ? `${path}?${qs}` : path
  const json = (await request(url)) as { data: T }
  return json.data
}

export async function apiGetList<T>(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>,
): Promise<{ items: T[]; meta: MetaResponse }> {
  const qs = params ? buildQS(params) : ''
  const url = qs ? `${path}?${qs}` : path
  const json = (await request(url)) as { data: T[]; meta: MetaResponse }
  return { items: json.data, meta: json.meta }
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const json = (await request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })) as { data: T }
  return json.data
}

export async function apiPostList<T>(path: string, body?: unknown): Promise<T[]> {
  const json = (await request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })) as { data: T[] }
  return json.data
}

// Used for login — returns the token object directly (not wrapped in { data })
// and does not trigger the global 401 redirect (would loop on the login page)
export async function apiPostForm<T>(path: string, data: Record<string, string>): Promise<T> {
  const json = await request(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString(),
    },
    true, // skipAuthRedirect
  )
  return json as T
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const json = (await request(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })) as { data: T }
  return json.data
}

export async function apiDelete(path: string): Promise<void> {
  await request(path, { method: 'DELETE' })
}
