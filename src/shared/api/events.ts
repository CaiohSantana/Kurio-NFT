export interface NftUpdated { eventId: string; resourceId: string; version: number }
import type { OrderUpdated } from '@/features/orders/contracts'
export interface ServerEvents { 'nft.updated': (event: NftUpdated) => void; 'order.updated': (event: OrderUpdated) => void }
