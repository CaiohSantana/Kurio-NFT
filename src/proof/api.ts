import { http } from '@/shared/api/http'
import type { NftResponse, ScenarioAction, ScenarioResult } from './contracts'

export const nftKey = ['integration-proof', 'nft', 'emerald-042'] as const

export async function getProofNft(signal?: AbortSignal) {
  const { data } = await http.get<NftResponse>('/nfts/emerald-042', { signal })
  return data
}

// Scenario controls use network handlers; they never import the mock database.
export async function runScenario(action: ScenarioAction) {
  const { data } = await http.post<ScenarioResult>('/__proof/scenario', { action })
  return data
}
