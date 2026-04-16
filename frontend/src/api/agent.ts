import { apiPost } from './client'

export interface FragrancePick {
  brand: string
  name: string
}

export interface AgentResponse {
  response: string
  session_id: number
  picks: FragrancePick[]
}

export async function askAgent(query: string): Promise<AgentResponse> {
  return apiPost<AgentResponse>('/agent/recommend', { query })
}
