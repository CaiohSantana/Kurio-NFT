import { queryOptions } from '@tanstack/react-query'
import { http } from '@/shared/api/http'
import { privateKey, reportExpired, scopedConfig } from '@/features/auth/session'
import type { Profile } from './contracts'
export const profileKey = (scope: string) => [...privateKey(scope), 'profile'] as const
export const profileOptions = (scope: string) => queryOptions({ queryKey: profileKey(scope), retry: false, staleTime: 30000, queryFn: async ({ signal }) => { try { return (await http.get<Profile>('/profile', scopedConfig(scope, signal))).data } catch (error) { reportExpired(error, scope); throw error } } })
