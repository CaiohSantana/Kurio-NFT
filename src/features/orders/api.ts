import { queryOptions } from '@tanstack/react-query'
import { http } from '@/shared/api/http'
import { privateKey, reportExpired, scopedConfig } from '@/features/auth/session'
import type { Order } from './contracts'
export const orderKey = (scope: string, id: string) => [...privateKey(scope), 'order', id] as const
export const orderOptions = (scope: string, id: string) => queryOptions({ queryKey: orderKey(scope, id), retry: false, staleTime: 0, queryFn: async ({ signal }) => { try { return (await http.get<Order>(`/orders/${encodeURIComponent(id)}`, scopedConfig(scope, signal))).data } catch (error) { reportExpired(error, scope); throw error } }, refetchInterval: (query) => query.state.data?.status === 'pending' ? 2000 : false, structuralSharing: (old, incoming) => { const previous = old as Order | undefined, next = incoming as Order; return previous && (previous.version > next.version || previous.status !== 'pending' && next.status === 'pending') ? previous : next } })
