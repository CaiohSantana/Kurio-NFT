import { collections, networks, validateCatalogSearch, type Collection, type Nft, type CatalogResponse } from '@/features/catalog/contracts'
import type { NftUpdated } from '@/shared/api/events'
const storageKey = 'kurio-catalog-v1'
const names = ['Emerald Ape #042', 'Sage Nomad #009', 'Neon Vessel #552', 'Cosmic Bloom #118', 'Violet Nomad #314', 'Ivory Baron #088', 'Golden Beat #207', 'Golden Frequency #071', 'Golden Signal #160']
const ids = ['emerald-042', 'sage-009', 'neon-552', 'cosmic-118', 'violet-314', 'ivory-088', 'golden-207', 'frequency-071', 'signal-160']
const art = ['8f387-900.webp', '83794-900.webp', '9add2-900.webp', '83794-900.webp', '83794-900.webp', '9add2-900.webp', 'b7cfc-900.webp', 'b7cfc-900.webp', 'b7cfc-900.webp']
const prices = ['1.19', '1.69', '1.99', '1.29', '1.39', '1.79', '0.99', '0.59', '0.39']
const categories = Object.keys(collections) as Collection[]
function fixtures(): Nft[] {
  return Array.from({ length: 45 }, (_, i) => {
    const image = `/assets/optimized/${art[i % 9]}`
    return { id: i < 9 ? ids[i] : `kurio-${i + 1}`, name: i < 9 ? names[i] : `Kurio Edition #${String(i + 1).padStart(3, '0')}`, token: `#${i < 9 ? names[i].split('#')[1].padStart(4, '0') : String(i + 1).padStart(4, '0')}`, image, gallery: [image, image, image, image], priceEth: i < 9 ? prices[i] : `${1 + i % 6}.${String(i * 7 % 100).padStart(2, '0')}`, previousPrice: i === 2 ? '2.29' : undefined, available: 10, version: 1, collection: i < 9 ? 'digital' : categories[(i - 9) % 9], network: networks[i % 3],
      editions: [{ id: 'unique', label: '1/1', available: 0, maxQuantity: 1 }, { id: 'ten', label: '1/10', available: 4, maxQuantity: 4 }, { id: 'fifty', label: '1/50', available: 10, maxQuantity: 10 }, { id: 'open', label: 'ABERTA', available: 50, maxQuantity: 20 }], rare: i % 3 === 2, trending: i % 2 === 0, createdAt: new Date(Date.UTC(2026, 8, 30 - i)).toISOString(), description: 'Um colecionável digital finalizado à mão da coleção Kurio Editions, com arte desbloqueável e acesso para colecionadores. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.', contract: '0x7A42…19E8 · Contrato inteligente ERC-721', royalty: '5%' }
  })
}
function load(): Nft[] {
  try { const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null'); if (Array.isArray(value) && value.length === 45 && value.every((n) => n && typeof n.id === 'string' && Number.isInteger(n.version) && Array.isArray(n.editions))) return (value as Nft[]).map(nft => ({ ...nft, image: nft.image.replace("/assets/figma/", "/assets/optimized/").replace(".png", "-900.webp"), gallery: nft.gallery.map(asset => asset.replace("/assets/figma/", "/assets/optimized/").replace(".png", "-900.webp")) })) } catch { /* malformed persistence resets */ }
  return fixtures()
}
let records = load(), reads = 0, revision = 1
export let catalogDelay = Number(localStorage.getItem('kurio-catalog-delay') ?? 250)
let failNext = localStorage.getItem('kurio-catalog-fail') === 'true'
let networkFailNext = localStorage.getItem('kurio-catalog-network-failure') === 'true'
let lastEvent: NftUpdated | undefined
export function resetCatalog() { records = fixtures(); reads = 0; revision = 1; catalogDelay = 250; failNext = false; networkFailNext = false; lastEvent = undefined; localStorage.removeItem(storageKey); localStorage.removeItem('kurio-catalog-delay'); localStorage.removeItem('kurio-catalog-fail'); localStorage.removeItem('kurio-catalog-network-failure') }
export function readCatalogNft(id: string) { reads++; const nft = records.find((n) => n.id === id); return nft ? { nft: structuredClone(nft), readCount: reads } : undefined }
export function catalogNftVersion(id: string) { return records.find((n) => n.id === id)?.version ?? 0 }
const units = (price: string) => { const [whole, fraction = ''] = price.split('.'); return BigInt(whole) * 10n ** 18n + BigInt(fraction.padEnd(18, '0')) }
export function queryCatalog(raw: Record<string, unknown>): CatalogResponse {
  const s = validateCatalogSearch(raw)
  let result = records.filter((n) => n.name.toLowerCase().includes(s.q.toLowerCase()) && (!s.collections.length || s.collections.includes(n.collection)) && (!s.networks.length || s.networks.includes(n.network)) && units(n.priceEth) >= units(s.minPrice) && units(n.priceEth) <= units(s.maxPrice) && (s.tab !== 'trending' || n.trending) && (s.tab !== 'new' || n.createdAt >= '2026-09-15'))
  result = [...result].sort((a, b) => s.sort === 'recent' ? b.createdAt.localeCompare(a.createdAt) : (units(a.priceEth) < units(b.priceEth) ? -1 : units(a.priceEth) > units(b.priceEth) ? 1 : a.id.localeCompare(b.id)) * (s.sort === 'price-desc' ? -1 : 1))
  const facets = { collections: Object.fromEntries(categories.map((key) => [key, records.filter((n) => n.collection === key).length])) as Record<Collection, number>, networks: Object.fromEntries(networks.map((key) => [key, records.filter((n) => n.network === key).length])) as CatalogResponse['facets']['networks'] }
  return { featured: structuredClone(ids.slice(0, 3).map(id => records.find(nft => nft.id === id)!)), items: structuredClone(result.slice((s.page - 1) * 9, s.page * 9)), total: result.length, pages: Math.ceil(result.length / 9), page: s.page, revision, facets }
}
export function updateCatalogNft(id: string, soldOut = false, priceEth?: string): NftUpdated | undefined {
  const nft = records.find((n) => n.id === id); if (!nft) return
  const amount = units(priceEth ?? nft.priceEth) + (priceEth === undefined ? units('0.10') : 0n)
  const fraction = (amount % 10n ** 18n).toString().padStart(18, '0').replace(/0+$/, '')
  nft.priceEth = `${amount / 10n ** 18n}${fraction ? `.${fraction}` : ''}`; nft.version++; nft.available = soldOut ? 0 : Math.max(0, nft.available - 1)
  nft.editions = nft.editions.map((e) => ({ ...e, available: soldOut ? 0 : Math.max(0, e.available - 1) }))
  revision++; localStorage.setItem(storageKey, JSON.stringify(records))
  lastEvent = { eventId: `nft:${id}:${nft.version}`, resourceId: id, version: nft.version }; return lastEvent
}
export function getLastCatalogEvent() { return lastEvent }
export function consumePurchasedStock(items: { nftId: string; editionId: string; quantity: number }[]): NftUpdated[] | null {
  if (items.some((item) => { const e = records.find((n) => n.id === item.nftId)?.editions.find((edition) => edition.id === item.editionId); return !e || e.available < item.quantity })) return null
  const touched = new Set<string>()
  for (const item of items) { const nft = records.find((n) => n.id === item.nftId)!; nft.editions.find((e) => e.id === item.editionId)!.available -= item.quantity; nft.available = nft.editions.find((e) => e.id === 'fifty')!.available; touched.add(nft.id) }
  const events = [...touched].map((id) => { const nft = records.find((n) => n.id === id)!; nft.version++; return { eventId: `nft:${id}:${nft.version}`, resourceId: id, version: nft.version } })
  revision++; localStorage.setItem(storageKey, JSON.stringify(records)); return events
}
export function configureCatalog(delayMs: number, failure = false) { catalogDelay = Math.max(0, Math.min(5000, delayMs)); failNext = failure; localStorage.setItem('kurio-catalog-delay', String(catalogDelay)); localStorage.setItem('kurio-catalog-fail', String(failure)) }
export function consumeCatalogFailure() { const fail = failNext; failNext = false; localStorage.removeItem('kurio-catalog-fail'); return fail }
export function configureCatalogNetworkFailure() { networkFailNext = true; localStorage.setItem('kurio-catalog-network-failure', 'true') }
export function consumeCatalogNetworkFailure() { const fail = networkFailNext; networkFailNext = false; localStorage.removeItem('kurio-catalog-network-failure'); return fail }
