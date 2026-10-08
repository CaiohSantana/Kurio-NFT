import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { queryOptions, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { http } from '@/shared/api/http'
import type { ApiError, Session } from './contracts'
export const sessionKey = ['session'] as const
export const sessionOptions = () => queryOptions({ queryKey: sessionKey, queryFn: async ({ signal }) => (await http.get<Session>('/session', { signal })).data, staleTime: Infinity, retry: false, retryOnMount: false, refetchOnWindowFocus: false })
export const privateKey = (scope: string) => ['private', scope] as const
export const activeScope = (client: QueryClient, scope: string) => client.getQueryData<Session>(sessionKey)?.scope === scope
export const scopedConfig = (scope: string, signal?: AbortSignal) => ({ headers: { 'X-Session-Scope': scope }, signal })
export function apiMessage(error: unknown) { return isAxiosError<ApiError>(error) ? error.response?.data.message ?? 'Falha de conexão. Tente novamente.' : 'Não foi possível concluir. Tente novamente.' }
export function apiFields(error: unknown) { return isAxiosError<ApiError>(error) ? error.response?.data.fieldErrors ?? {} : {} }
export function reportExpired(error: unknown, scope: string, favorite = '', enabled = true) {
  if (isAxiosError<ApiError>(error) && error.response?.data.code === 'SESSION_EXPIRED') window.dispatchEvent(new CustomEvent('session-expired', { detail: { scope, favorite, favoriteMode: enabled ? undefined : 'remove' } }))
}
export async function replaceSession(client: QueryClient, incoming: Session) {
  await client.cancelQueries({ queryKey: ['private'] })
  client.removeQueries({ queryKey: ['private'] })
  client.getMutationCache().clear()
  client.setQueryData(sessionKey, incoming)
}
const SessionContext = createContext<Session | null>(null)
export function useSession() { const session = useContext(SessionContext); if (!session) throw new Error('SessionProvider required'); return session }
export function SessionProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient(), navigate = useNavigate(), router = useRouter()
  const query = useQuery(sessionOptions())
  useEffect(() => {
    let pending = false, alive = true
    const expired = async (event: Event) => {
      const detail = (event as CustomEvent<string | { scope: string; favorite: string; favoriteMode?: 'remove' }>).detail
      const scope = typeof detail === 'string' ? detail : detail.scope
      if (pending || !activeScope(client, scope)) return
      pending = true
      try {
        const incoming = (await http.get<Session>('/session')).data
        if (!alive || !activeScope(client, scope)) return
        await replaceSession(client, incoming)
        const href = router.state.location.href
        if (!/^\/(login|signup)/.test(href)) await navigate({ to: '/login', search: { returnTo: href, favorite: typeof detail === 'string' ? '' : detail.favorite, favoriteMode: typeof detail === 'string' ? undefined : detail.favoriteMode } })
      } finally { pending = false }
    }
    const listener = (event: Event) => { void expired(event) }
    window.addEventListener('session-expired', listener)
    if (query.data?.expired && !/^\/(login|signup)/.test(router.state.location.pathname)) void navigate({ to: '/login', search: { returnTo: router.state.location.href, favorite: '' } })
    const remaining = query.data?.expiresAt ? Math.max(0, query.data.expiresAt - Date.now()) : null
    const timer = remaining !== null ? window.setTimeout(() => window.dispatchEvent(new CustomEvent('session-expired', { detail: query.data?.scope })), remaining) : undefined
    return () => { alive = false; window.removeEventListener('session-expired', listener); window.clearTimeout(timer) }
  }, [client, navigate, router, query.data?.scope, query.data?.expiresAt, query.data?.expired])
  if (!query.data) return <main className="empty-state" role={query.isError ? 'alert' : 'status'}><p>{query.isError ? 'Não foi possível recuperar a sessão.' : 'Recuperando sessão…'}</p>{query.isError && <button onClick={() => void query.refetch()}>Tentar novamente</button>}</main>
  return <SessionContext.Provider value={query.data}><div key={query.data.scope}>{children}</div></SessionContext.Provider>
}
