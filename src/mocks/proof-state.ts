import type { NftUpdated } from '@/proof/contracts'
import { readCatalogNft, resetCatalog, updateCatalogNft, catalogNftVersion } from './catalog-state'
let failNext = false
let lastEvent: NftUpdated | undefined
export function readNft() { return readCatalogNft('emerald-042')! }
export function changeNft() { lastEvent = updateCatalogNft('emerald-042'); return lastEvent! }
export function duplicateEvent() { return lastEvent }
export function oldEvent(): NftUpdated { return { eventId: 'old:emerald-042', resourceId: 'emerald-042', version: Math.max(0, catalogNftVersion('emerald-042') - 1) } }
export function failNextRead() { failNext = true }
export function consumeFailure() { const fail = failNext; failNext = false; return fail }
export function resetProof() { resetCatalog(); failNext = false; lastEvent = undefined }
