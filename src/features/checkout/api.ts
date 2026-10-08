import { queryOptions } from '@tanstack/react-query'
import { http } from '@/shared/api/http'
import { privateKey, reportExpired, scopedConfig } from '@/features/auth/session'
import type { Network } from '@/features/catalog/contracts'
import type { CheckoutQuote, WalletConnection } from './contracts'
import type { Attempt } from '@/features/orders/contracts'
export const checkoutQuoteKey = (scope: string) => [...privateKey(scope), 'checkout-quote'] as const
export const connectionKey = (scope: string) => [...privateKey(scope), 'connection'] as const
export const attemptKey = (scope: string) => [...privateKey(scope), 'attempt'] as const
export const connectionOptions = (scope: string) => queryOptions({ queryKey: connectionKey(scope), retry: false, staleTime: 0, queryFn: async ({ signal }) => { try { return (await http.get<WalletConnection | null>('/wallet-connection', scopedConfig(scope, signal))).data } catch (error) { reportExpired(error, scope); throw error } } })
export const attemptOptions = (scope: string) => queryOptions({ queryKey: attemptKey(scope), retry: false, staleTime: 0, queryFn: async ({ signal }) => { try { return (await http.get<Attempt | null>('/order-attempt', scopedConfig(scope, signal))).data } catch (error) { reportExpired(error, scope); throw error } } })
export const checkoutQuoteOptions = (scope: string, walletId: string, network: Network) => queryOptions({ queryKey: [...checkoutQuoteKey(scope), walletId, network], enabled: !!walletId, retry: false, staleTime: 0, queryFn: async ({ signal }) => { try { return (await http.post<CheckoutQuote>('/checkout-quotes', { walletId, network }, scopedConfig(scope, signal))).data } catch (error) { reportExpired(error, scope); throw error } } })
