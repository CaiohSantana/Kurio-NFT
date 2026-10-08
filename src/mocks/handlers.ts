import { delay, http, HttpResponse, ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import type { NftUpdated, ScenarioAction, ScenarioResult } from '@/proof/contracts'
import { changeNft, consumeFailure, duplicateEvent, failNextRead, oldEvent, readNft, resetProof } from './proof-state'

// A dedicated transport path avoids MSW's normalization of /socket.io/ to /
// and prevents matching Vite's own HMR connection. Namespace is still /.
const socketLink = ws.link(new URL('/proof-socket.io/', window.location.origin).href)
const connections = new Set<ReturnType<typeof toSocketIo>>()
let outageUntil = 0

function broadcast(event: NftUpdated) {
  for (const connection of connections) connection.client.emit('nft.updated', event)
}

export const handlers = [
  socketLink.addEventListener('connection', (raw) => {
    if (Date.now() < outageUntil) {
      // Opening the Engine.IO transport before closing it lets the Manager
      // observe the interruption and automatically schedule another attempt.
      // Do not approve the Socket.IO namespace while the mock is unavailable.
      queueMicrotask(() => {
        raw.client.send('0' + JSON.stringify({ sid: 'unavailable', upgrades: [], pingInterval: 25000, pingTimeout: 5000 }))
        window.setTimeout(() => raw.client.close(1013, 'Mock connection unavailable'), 50)
      })
      return
    }
    const connection = toSocketIo(raw)
    connections.add(connection)
    // Binding 0.2.0 provides the handshake but not the Engine.IO heartbeat.
    const heartbeat = window.setInterval(() => raw.client.send('2'), 10000)
    raw.client.addEventListener('close', () => {
      window.clearInterval(heartbeat)
      connections.delete(connection)
    })
  }),
  http.get('/api/nfts/:id', async ({ params }) => {
    await delay(650)
    if (params.id !== 'emerald-042') return HttpResponse.json({ message: 'NFT inexistente.' }, { status: 404 })
    if (consumeFailure()) return HttpResponse.json({ message: 'Falha transitória simulada. Tente novamente.' }, { status: 503 })
    return HttpResponse.json(readNft(), { headers: { 'X-Mock-Handler': 'proof-nft', 'Cache-Control': 'no-store' } })
  }),
  http.post('/api/__proof/scenario', async ({ request }) => {
    const { action } = await request.json() as { action: ScenarioAction }
    let message: string
    switch (action) {
      case 'change':
        broadcast(changeNft())
        message = 'Base alterada; nft.updated emitido às conexões ativas.'
        break
      case 'duplicate': {
        const event = duplicateEvent()
        if (event) broadcast(event)
        message = event ? 'Evento duplicado emitido.' : 'Altere o NFT antes de repetir o evento.'
        break
      }
      case 'old':
        broadcast(oldEvent())
        message = 'Evento antigo emitido, sem alterar a base.'
        break
      case 'disconnect':
        outageUntil = Date.now() + 2000
        for (const connection of connections) connection.rawClient.close(1012, 'Mock transport interruption')
        message = 'Transporte interrompido por 2 segundos. A reconexão é automática.'
        break
      case 'fail-next':
        failNextRead()
        message = 'Próxima consulta REST responderá 503.'
        break
      case 'reset':
        resetProof()
        outageUntil = 0
        message = 'Cenário restaurado.'
        break
      default:
        return HttpResponse.json({ message: 'Ação de cenário inválida.' }, { status: 400 })
    }
    return HttpResponse.json<ScenarioResult>({ message })
  }),
  http.get('/api/__proof/diagnostics', () => HttpResponse.json({ activeConnections: connections.size })),
  http.post('/api/__proof/reset', () => {
    resetProof()
    outageUntil = 0
    return HttpResponse.json({ message: 'Cenário restaurado.' })
  }),
]
