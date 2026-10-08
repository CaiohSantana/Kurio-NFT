import type { CheckoutQuote, OrderInput, WalletConnection } from '@/features/checkout/contracts'
export interface Order { id: string; userId: string; originScope: string; idempotencyKey: string; payload: OrderInput; status: 'pending' | 'confirmed' | 'refused'; version: number; createdAt: string; transaction: string; reason: string; snapshot: CheckoutQuote; collector: OrderInput['collector']; settleAt: number | null; outcome: 'confirmed' | 'refused'; cartApplied: boolean }
export interface Attempt { key: string; payload: OrderInput; orderId: string | null }
export interface CheckoutState { connection: WalletConnection | null; quotes: CheckoutQuote[]; attempt: Attempt | null; orders: Order[] }
export interface OrderUpdated { eventId: string; resourceId: string; version: number; userId: string; scope: string }
