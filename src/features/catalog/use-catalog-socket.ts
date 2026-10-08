import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io, type Socket } from 'socket.io-client'
import { catalogKey, detailKey } from './api'
import type { NftResponse, CatalogResponse } from './contracts'
import type { NftUpdated, ServerEvents } from '@/shared/api/events'
import type { OrderUpdated, Order } from '@/features/orders/contracts'
import type { Session } from '@/features/auth/contracts'

export function useCatalogSocket(scope: string) {
  const queryClient = useQueryClient()
  const [notice, setNotice] = useState('')
  useEffect(() => {
    const versions = new Map<string, number>()
    const socket: Socket<ServerEvents> = io(window.location.origin, { path: '/proof-socket.io/', query: { scope }, transports: ['websocket'], autoConnect: false, forceNew: true, reconnectionDelay: 300, reconnectionDelayMax: 300, randomizationFactor: 0 })
    let connectedOnce = false
    let active = true
    const refreshPrivate = (resource: string) => { if (active) void queryClient.cancelQueries({ queryKey: ['private', scope, resource] }).then(() => { if (active) return queryClient.invalidateQueries({ queryKey: ['private', scope, resource] }) }) }
    const reconcileCart = () => { refreshPrivate('quote'); refreshPrivate('checkout-quote') }
    const reconcile = () => {
      if (connectedOnce) {
        setNotice('')
        // Cancel even a first pending read: its pre-outage snapshot may be old.
        void queryClient.cancelQueries({ queryKey: catalogKey }).then(() => queryClient.invalidateQueries({ queryKey: catalogKey }))
        void queryClient.cancelQueries({ queryKey: ['nft'] }).then(() => queryClient.invalidateQueries({ queryKey: ['nft'] }))
        reconcileCart()
        refreshPrivate('order'); refreshPrivate('attempt'); refreshPrivate('cart'); refreshPrivate('connection')
      }
      connectedOnce = true
    }
    const update = (event: NftUpdated) => {
      if (!active) return
      if (!event || typeof event.resourceId !== 'string' || !Number.isSafeInteger(event.version)) return
      const cachedListVersion = Math.max(0, ...queryClient.getQueriesData<CatalogResponse>({ queryKey: catalogKey }).map(([, data]) => data?.items.find((nft) => nft.id === event.resourceId)?.version ?? 0))
      const current = Math.max(cachedListVersion, queryClient.getQueryData<NftResponse>(detailKey(event.resourceId))?.nft.version ?? 0)
      if (event.version <= Math.max(versions.get(event.resourceId) ?? 0, current)) return
      versions.set(event.resourceId, event.version)
      setNotice('Preço ou disponibilidade atualizado. Confira os dados antes de continuar.')
      reconcileCart()
      void queryClient.cancelQueries({ queryKey: catalogKey }).then(() => queryClient.invalidateQueries({ queryKey: catalogKey }))
      void queryClient.cancelQueries({ queryKey: detailKey(event.resourceId) }).then(() => queryClient.invalidateQueries({ queryKey: detailKey(event.resourceId) }))
    }
    const disconnected = () => setNotice('Conexão interrompida. A reconexão será automática.')
    const orderUpdated = (event: OrderUpdated) => {
      if (!active || event.scope !== scope || event.userId !== queryClient.getQueryData<Session>(['session'])?.user?.id || !Number.isSafeInteger(event.version)) return
      const key = ['private', scope, 'order', event.resourceId], current = queryClient.getQueryData<Order>(key)?.version ?? 0, seen = versions.get(`order:${event.resourceId}`) ?? 0
      if (event.version <= Math.max(current, seen)) return
      versions.set(`order:${event.resourceId}`, event.version)
      if (import.meta.env.MODE === 'demo') console.debug('[Kurio realtime] order.updated', event.resourceId, event.version)
      refreshPrivate('order'); refreshPrivate('attempt'); refreshPrivate('cart'); reconcileCart()
    }
    socket.on('connect', reconcile); socket.on('disconnect', disconnected); socket.on('nft.updated', update); socket.on('order.updated', orderUpdated)
    socket.connect()
    return () => { active = false; socket.off('connect', reconcile); socket.off('disconnect', disconnected); socket.off('nft.updated', update); socket.off('order.updated', orderUpdated); socket.disconnect() }
  }, [queryClient, scope])
  return notice
}
