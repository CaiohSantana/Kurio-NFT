import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/shared/api/http'
import { activeScope, privateKey, reportExpired, scopedConfig, useSession } from '@/features/auth/session'
import type { Cart, Quote } from './contracts'
export const cartKey = (scope: string) => [...privateKey(scope), 'cart'] as const
export const quoteKey = (scope: string) => [...privateKey(scope), 'quote'] as const
export const cartOptions = (scope: string) => queryOptions({ queryKey: cartKey(scope), staleTime: 0, retry: false, queryFn: async ({ signal }) => {
  try { return (await http.get<Cart>('/cart', scopedConfig(scope, signal))).data } catch (error) { reportExpired(error, scope); throw error }
} })
export const quoteOptions = (scope: string) => queryOptions({ queryKey: quoteKey(scope), staleTime: 0, retry: false, queryFn: async ({ signal }) => {
  try { return (await http.post<Quote>('/quotes', {}, scopedConfig(scope, signal))).data } catch (error) { reportExpired(error, scope); throw error }
} })
export type CartOperation = { action: 'add'; nftId: string; editionId: string; quantity: number } | { action: 'quantity'; id: string; quantity: number } | { action: 'remove'; id: string } | { action: 'coupon'; code: string }
export function useCartMutation() {
  const session = useSession(), client = useQueryClient()
  return useMutation({ mutationKey: [...cartKey(session.scope), 'edit'], scope: { id: `cart:${session.scope}` }, retry: false,
    mutationFn: async (operation: CartOperation) => {
      const config = scopedConfig(session.scope)
      if (operation.action === 'add') return (await http.post<Cart>('/cart/items', operation, config)).data
      if (operation.action === 'quantity') return (await http.patch<Cart>(`/cart/items/${encodeURIComponent(operation.id)}`, { quantity: operation.quantity }, config)).data
      if (operation.action === 'remove') return (await http.delete<Cart>(`/cart/items/${encodeURIComponent(operation.id)}`, config)).data
      return (await http.put<Cart>('/cart/coupon', { code: operation.code }, config)).data
    },
    onError: (error) => reportExpired(error, session.scope),
    onSuccess: async () => {
      if (!activeScope(client, session.scope)) return
      await Promise.all(['cart', 'quote', 'checkout-quote'].map((resource) => client.cancelQueries({ queryKey: [...privateKey(session.scope), resource] })))
      await Promise.all([client.invalidateQueries({ queryKey: cartKey(session.scope) }), client.invalidateQueries({ queryKey: quoteKey(session.scope) }), client.invalidateQueries({ queryKey: [...privateKey(session.scope), 'checkout-quote'] })])
    },
  })
}
