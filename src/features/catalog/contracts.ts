export const collections = { digital: 'Arte digital', photography: 'Fotografia', music: 'Música', art3d: 'Arte 3D', collectibles: 'Colecionáveis', generative: 'Generativa', games: 'Jogos', subscriptions: 'Assinaturas', utility: 'Utilidade' } as const
export const networks = ['Ethereum', 'Polygon', 'Solana'] as const
export type Collection = keyof typeof collections
export type Network = typeof networks[number]
export type Sort = 'recent' | 'price-asc' | 'price-desc'
export interface CatalogSearch { q: string; collections: Collection[]; networks: Network[]; minPrice: string; maxPrice: string; sort: Sort; page: number; tab: 'all' | 'new' | 'trending' }
export interface Edition { id: string; label: string; available: number; maxQuantity: number }
export interface Nft {
  id: string; name: string; token: string; image: string; gallery: string[]; priceEth: string; previousPrice?: string;
  available: number; version: number; collection: Collection; network: Network; editions: Edition[];
  rare: boolean; trending: boolean; createdAt: string; description: string; contract: string; royalty: string;
}
export interface NftResponse { nft: Nft; readCount: number }
export interface CatalogResponse { items: Nft[]; total: number; pages: number; page: number; revision: number; facets: { collections: Record<Collection, number>; networks: Record<Network, number> } }
const list = <T extends string>(value: unknown, allowed: readonly T[]): T[] => {
  const entries = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : []
  return [...new Set(entries.filter((item): item is T => typeof item === 'string' && allowed.includes(item as T)))].sort()
}
const decimal = (value: unknown, fallback: string) => /^\d{1,2}(\.\d{1,2})?$/.test(String(value)) ? String(value) : fallback
export function validateCatalogSearch(raw: Record<string, unknown>): CatalogSearch {
  let minPrice = decimal(raw.minPrice, '0.02'), maxPrice = decimal(raw.maxPrice, '12.30')
  if (Number(minPrice) > Number(maxPrice)) [minPrice, maxPrice] = [maxPrice, minPrice]
  return { q: typeof raw.q === 'string' ? raw.q.slice(0, 100).trim() : '', collections: list(raw.collections, Object.keys(collections) as Collection[]), networks: list(raw.networks, networks), minPrice, maxPrice,
    sort: raw.sort === 'price-asc' || raw.sort === 'price-desc' ? raw.sort : 'recent', page: Number.isInteger(Number(raw.page)) ? Math.max(1, Math.min(1000, Number(raw.page))) : 1, tab: raw.tab === 'new' || raw.tab === 'trending' ? raw.tab : 'all' }
}
export const defaultCatalogSearch = validateCatalogSearch({})
