import { apiPost } from './client'

export interface AgentResponse {
  response: string
  session_id: number
}

export async function askAgent(query: string): Promise<AgentResponse> {
  return apiPost<AgentResponse>('/agent/recommend', { query })
}
