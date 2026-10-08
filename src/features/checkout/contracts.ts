import type { Quote } from '@/features/cart/contracts'
import type { Network } from '@/features/catalog/contracts'
import type { Wallet } from '@/features/wallets/contracts'
export interface Collector { displayName: string; username: string; email: string; nickname: string; ens: string; referral: string; secondaryReference: string; observation: string }
export interface WalletConnection { scope: string; walletId: string; network: Network; provider: Wallet['provider']; status: 'connected' | 'refused' | 'disconnected' }
export interface CheckoutQuote extends Quote { id: string; version: number; fingerprint: string; expiresAt: number; wallet: Wallet; network: Network }
export interface CheckoutDraft { collector: Collector; walletId: string; network: Network }
export interface OrderInput { quoteId: string; fingerprint: string; walletId: string; network: Network; collector: Collector }
