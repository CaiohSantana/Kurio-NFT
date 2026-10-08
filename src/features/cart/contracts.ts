import type { Nft } from '@/features/catalog/contracts'
export interface CartItem { id: string; nftId: string; editionId: string; quantity: number }
export interface Cart { items: CartItem[]; coupon: string; version: number }
export interface QuoteLine extends CartItem { nft: Nft; editionLabel: string; limit: number; available: boolean; lineEth: string }
export interface Quote { lines: QuoteLine[]; subtotalEth: string; discountEth: string; networkFeeEth: string; totalEth: string; coupon: string; cartVersion: number; purchasable: boolean; warnings: string[] }
