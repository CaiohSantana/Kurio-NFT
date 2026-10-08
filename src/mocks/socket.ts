import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import type { NftUpdated } from '@/shared/api/events'
import type { OrderUpdated } from '@/features/orders/contracts'
const link = ws.link(new URL('/proof-socket.io/', window.location.origin).href)
const connections = new Map<ReturnType<typeof toSocketIo>, string | null>()
let outageUntil = 0
export function emitNft(event: NftUpdated) { for (const c of connections.keys()) c.client.emit('nft.updated', event) }
export function emitOrder(event: OrderUpdated, all = false) { for (const [c, scope] of connections) if (all || scope === event.scope) c.client.emit('order.updated', event) }
export function connectionsCount() { return connections.size }
export function resetOutage() { outageUntil = 0 }
export function interruptTransport() { outageUntil = Date.now() + 2000; for (const c of connections.keys()) c.rawClient.close(1012, 'Mock interruption') }
export const socketHandler = link.addEventListener('connection', (raw) => {
  if (Date.now() < outageUntil) {
    queueMicrotask(() => { raw.client.send('0' + JSON.stringify({ sid: 'unavailable', upgrades: [], pingInterval: 25000, pingTimeout: 5000 })); window.setTimeout(() => raw.client.close(1013, 'Mock connection unavailable'), 50) }); return
  }
  const c = toSocketIo(raw)
  connections.set(c, new URL(raw.client.url).searchParams.get('scope'))
  const heartbeat = window.setInterval(() => raw.client.send('2'), 10000)
  raw.client.addEventListener('close', () => { window.clearInterval(heartbeat); connections.delete(c) })
})
