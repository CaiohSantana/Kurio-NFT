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

export interface NftUpdated {
  eventId: string
  resourceId: string
  version: number
}

export type ScenarioAction = 'change' | 'duplicate' | 'old' | 'disconnect' | 'fail-next' | 'reset'
export interface ScenarioResult { message: string }

export interface ServerEvents { 'nft.updated': (event: NftUpdated) => void }
