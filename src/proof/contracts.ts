// This proof is intentionally separate from the future marketplace contracts.
export interface ProofNft {
  id: string
  name: string
  priceEth: string
  available: number
  version: number
}

export interface NftResponse {
  nft: ProofNft
  readCount: number
}

export type { NftUpdated, ServerEvents } from '@/shared/api/events'

export type ScenarioAction = 'change' | 'duplicate' | 'old' | 'disconnect' | 'fail-next' | 'reset'
export interface ScenarioResult { message: string }
