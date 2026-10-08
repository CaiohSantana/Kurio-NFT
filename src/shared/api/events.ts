export interface NftUpdated { eventId: string; resourceId: string; version: number }
export interface ServerEvents { 'nft.updated': (event: NftUpdated) => void }
