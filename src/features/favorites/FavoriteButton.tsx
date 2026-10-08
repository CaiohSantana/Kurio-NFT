import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { http } from '@/shared/api/http'
import { activeScope, apiMessage, privateKey, reportExpired, scopedConfig, useSession } from '@/features/auth/session'
export const favoritesKey = (scope: string) => [...privateKey(scope), 'favorites'] as const
export function FavoriteButton({ id, name, className = '' }: { id: string; name: string; className?: string }) {
  const session = useSession(), client = useQueryClient(), navigate = useNavigate(), router = useRouter()
  const key = favoritesKey(session.scope)
  const pendingFavorites = useIsMutating({ mutationKey: key })
  const query = useQuery({ queryKey: key, enabled: !!session.user, retry: false, staleTime: 30000, queryFn: async ({ signal }) => {
    try { return (await http.get<string[]>('/favorites', scopedConfig(session.scope, signal))).data } catch (error) { reportExpired(error, session.scope); throw error }
  } })
  const selected = query.data?.includes(id) ?? false
  const mutation = useMutation({ mutationKey: [...key, id], scope: { id: `favorite:${session.scope}` }, retry: false,
    mutationFn: async (enable: boolean) => (await http.request<string[]>({ ...scopedConfig(session.scope), method: enable ? 'PUT' : 'DELETE', url: `/favorites/${id}` })).data,
    onMutate: async (enable) => {
      await client.cancelQueries({ queryKey: key }); const snapshot = client.getQueryData<string[]>(key)
      if (activeScope(client, session.scope)) client.setQueryData<string[]>(key, (old = []) => enable ? [...new Set([...old, id])] : old.filter((value) => value !== id))
      return { snapshot }
    },
    onError: (error, enable, context) => { if (activeScope(client, session.scope)) client.setQueryData(key, context?.snapshot ?? []); reportExpired(error, session.scope, id, enable) },
    onSettled: () => { if (activeScope(client, session.scope)) void client.invalidateQueries({ queryKey: key }) },
  })
  return <span className={`favorite-control ${className}`}><button type="button" aria-label={`${selected ? 'Desfavoritar' : 'Favoritar'} ${name}`} aria-pressed={selected} disabled={pendingFavorites > 0 || (!!session.user && !query.data)} onClick={() => {
    if (!session.user) void navigate({ to: '/login', search: { returnTo: router.state.location.href, favorite: id } })
    else mutation.mutate(!selected)
  }}><Heart size={18} fill={selected ? 'currentColor' : 'none'} /></button>{mutation.isError && <span role="alert">{apiMessage(mutation.error)}</span>}{query.isError && <button onClick={() => void query.refetch()}>Recarregar favoritos</button>}</span>
}
