import type { Network } from '@/features/catalog/contracts'
export const providers = ['MetaMask', 'WalletConnect', 'Coinbase'] as const
export interface Wallet { id: string; kind: 'primary' | 'secondary'; displayName: string; nickname: string; network: Network; address: string; provider: typeof providers[number]; username: string; email: string; ens: string; secondaryReference: string; referral: string }
export type WalletInput = Omit<Wallet, 'id'>
export interface WalletsResponse { items: Wallet[]; reusePrimary: boolean }
