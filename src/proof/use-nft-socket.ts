import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io, type Socket } from 'socket.io-client'
import { nftKey } from './api'
import type { NftResponse, NftUpdated, ServerEvents } from './contracts'

export function useNftSocket() {
  const queryClient = useQueryClient()
  const highestEventVersion = useRef(0)
  const [status, setStatus] = useState('Conectando')
  const [received, setReceived] = useState(0)
  const [ignored, setIgnored] = useState(0)
  const [connections, setConnections] = useState(0)

  useEffect(() => {
    const socket: Socket<ServerEvents> = io(window.location.origin, {
      path: '/proof-socket.io/', transports: ['websocket'], autoConnect: false, forceNew: true,
      reconnectionDelay: 300, reconnectionDelayMax: 300, randomizationFactor: 0,
    })
    function connected() {
      setStatus('Conectado')
      setConnections((count) => count + 1)
      // Both initial connection and reconnect reconcile the resource by REST.
      void queryClient.invalidateQueries({ queryKey: nftKey })
    }
    function disconnected() { setStatus('Desconectado') }
    function updated(event: NftUpdated) {
      setReceived((count) => count + 1)
      const current = queryClient.getQueryData<NftResponse>(nftKey)?.nft
      if (!event || event.resourceId !== 'emerald-042' || !Number.isSafeInteger(event.version) ||
        event.version <= Math.max(highestEventVersion.current, current?.version ?? 0)) {
        setIgnored((count) => count + 1)
        return
      }
      highestEventVersion.current = event.version
      // Events contain identity/version only. REST supplies the authoritative data.
      void queryClient.invalidateQueries({ queryKey: nftKey })
    }
    socket.on('connect', connected)
    socket.on('disconnect', disconnected)
    socket.on('connect_error', disconnected)
    socket.on('nft.updated', updated)
    socket.connect()
    return () => {
      socket.off('connect', connected)
      socket.off('disconnect', disconnected)
      socket.off('connect_error', disconnected)
      socket.off('nft.updated', updated)
      socket.disconnect()
    }
  }, [queryClient])

  return { status, received, ignored, connections }
}
