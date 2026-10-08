import { queryOptions } from '@tanstack/react-query'
import { http } from '@/shared/api/http'
import { privateKey, reportExpired, scopedConfig } from '@/features/auth/session'
import type { WalletsResponse } from './contracts'
export const walletsKey = (scope: string) => [...privateKey(scope), 'wallets'] as const
export const walletsOptions = (scope: string) => queryOptions({ queryKey: walletsKey(scope), retry: false, staleTime: 0, queryFn: async ({ signal }) => { try { return (await http.get<WalletsResponse>('/wallets', scopedConfig(scope, signal))).data } catch (error) { reportExpired(error, scope); throw error } } })
