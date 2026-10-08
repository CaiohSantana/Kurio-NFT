import { queryOptions } from '@tanstack/react-query'
import { http } from '@/shared/api/http'
import type { CatalogResponse, CatalogSearch, NftResponse } from './contracts'
export const catalogKey = ['catalog'] as const
export const detailKey = (id: string) => ['nft', id] as const
export const catalogOptions = (search: CatalogSearch) => queryOptions({
  queryKey: [...catalogKey, search], staleTime: 30000, retry: false,
  queryFn: async ({ signal }) => (await http.get<CatalogResponse>('/nfts', { signal, params: { ...search, collections: search.collections.join(','), networks: search.networks.join(',') } })).data,
})
export const detailOptions = (id: string) => queryOptions({
  queryKey: detailKey(id), staleTime: 30000, retry: false,
  queryFn: async ({ signal }) => (await http.get<NftResponse>(`/nfts/${encodeURIComponent(id)}`, { signal })).data,
  structuralSharing: (previous, next) => { const old = previous as NftResponse | undefined, incoming = next as NftResponse; return old && old.nft.version > incoming.nft.version ? old : incoming },
})
