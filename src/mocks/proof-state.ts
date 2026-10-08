import type { NftResponse, NftUpdated, ProofNft } from '@/proof/contracts'

const storageKey = 'kurio-integration-proof-v1'
const initialNft: ProofNft = {
  id: 'emerald-042', name: 'Emerald Ape #042', priceEth: '1.19', available: 10, version: 1,
}

function readStoredNft(): ProofNft {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    if (stored && typeof stored === 'object' && 'id' in stored && stored.id === initialNft.id &&
      'version' in stored && Number.isSafeInteger(stored.version) && Number(stored.version) >= 1 &&
      'priceEth' in stored && typeof stored.priceEth === 'string' && /^\d+\.\d+$/.test(stored.priceEth) &&
      'name' in stored && typeof stored.name === 'string' &&
      'available' in stored && Number.isSafeInteger(stored.available) && Number(stored.available) >= 0) {
      return stored as ProofNft
    }
  } catch { /* Corrupted storage falls back to the known proof fixture. */ }
  return { ...initialNft }
}

let nft = readStoredNft()
let readCount = 0
let failNext = false
let lastEvent: NftUpdated | undefined

export function readNft(): NftResponse {
  readCount += 1
  return { nft: { ...nft }, readCount }
}

export function changeNft(): NftUpdated {
  const nextVersion = nft.version + 1
  // Whole cents use integer arithmetic; no floating point ETH calculations.
  const cents = (119n + BigInt(nextVersion - 1) * 10n).toString()
  nft = { ...nft, priceEth: `${cents.slice(0, -2)}.${cents.slice(-2)}`, available: Math.max(0, nft.available - 1), version: nextVersion }
  localStorage.setItem(storageKey, JSON.stringify(nft))
  lastEvent = { eventId: `nft:${nft.id}:${nft.version}`, resourceId: nft.id, version: nft.version }
  return lastEvent
}

export function duplicateEvent() { return lastEvent }
export function oldEvent(): NftUpdated {
  return { eventId: `old:${nft.id}`, resourceId: nft.id, version: Math.max(0, nft.version - 1) }
}
export function failNextRead() { failNext = true }
export function consumeFailure() { const fail = failNext; failNext = false; return fail }
export function resetProof() {
  nft = { ...initialNft }
  readCount = 0
  failNext = false
  lastEvent = undefined
  localStorage.removeItem(storageKey)
}
