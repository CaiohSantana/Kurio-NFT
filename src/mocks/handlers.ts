import { delay, http, HttpResponse } from 'msw'
import { socketHandler, emitNft as broadcast, interruptTransport, resetOutage, connectionsCount } from './socket'
import { checkoutHandlers } from './checkout-handlers'
import { commerceHandlers } from './commerce-handlers'
import type { ScenarioAction, ScenarioResult } from '@/proof/contracts'
import { changeNft, consumeFailure, duplicateEvent, failNextRead, oldEvent, resetProof } from './proof-state'
import { catalogDelay, configureCatalog, configureCatalogNetworkFailure, consumeCatalogFailure, consumeCatalogNetworkFailure, getLastCatalogEvent, queryCatalog, readCatalogNft, resetCatalog, updateCatalogNft } from './catalog-state'
import { checkoutScenario } from './checkout-state'
import { commerceScenario } from './commerce-state'

export const handlers = [
  ...commerceHandlers,
  ...checkoutHandlers,
  socketHandler,
  http.post('/api/__scenario/reset', async () => {
    // Stop pending settlements before replacing accounts. Reset proof and
    // catalog together, including one-shot failures, delays and outage.
    await checkoutScenario('reset'); await commerceScenario('reset'); resetProof(); resetOutage()
    for (const key of Object.keys(sessionStorage)) if (key.startsWith('kurio-checkout-draft:')) sessionStorage.removeItem(key)
    return HttpResponse.json({ message: 'Cenário integral restaurado.' }, { headers: { 'X-Mock-Handler': 'reset' } })
  }),
  http.get('/api/nfts', async ({ request }) => {
    const search = Object.fromEntries(new URL(request.url).searchParams)
    const result = queryCatalog(search)
    const failure = consumeCatalogFailure()
    const networkFailure = consumeCatalogNetworkFailure()
    await delay(search.q === 'Kurio' ? Math.max(catalogDelay, 900) : catalogDelay)
    if (networkFailure) return HttpResponse.error()
    if (failure) return HttpResponse.json({ message: 'Falha transitória.' }, { status: 503 })
    return HttpResponse.json(result, { headers: { 'X-Mock-Handler': 'catalog', 'Cache-Control': 'no-store' } })
  }),
  http.get('/api/nfts/:id', async ({ params, request }) => {
    const isProof = request.headers.get('X-Integration-Proof') === 'true'
    const result = readCatalogNft(String(params.id))
    const failure = consumeCatalogFailure()
    const networkFailure = consumeCatalogNetworkFailure()
    await delay(isProof ? 650 : catalogDelay)
    if (networkFailure) return HttpResponse.error()
    if (!result) return HttpResponse.json({ message: 'NFT inexistente.' }, { status: 404 })
    if (consumeFailure()) return HttpResponse.json({ message: 'Falha transitória. Tente novamente.' }, { status: 503 })
    if (failure) return HttpResponse.json({ message: 'Falha transitória.' }, { status: 503 })
    return HttpResponse.json(result, { headers: { 'X-Mock-Handler': isProof ? 'proof-nft' : 'nft', 'Cache-Control': 'no-store' } })
  }),
  http.post('/api/__catalog/scenario', async ({ request }) => {
    const body = await request.json() as { action: string; id?: string; delay?: number; priceEth?: string }
    const id = body.id ?? 'emerald-042'
    if (body.action === 'reset') { resetCatalog(); resetOutage() }
    else if (body.action === 'slow') configureCatalog(body.delay ?? 1500)
    else if (body.action === 'fail') configureCatalog(250, true)
    else if (body.action === 'network-error') configureCatalogNetworkFailure()
    else if (body.action === 'disconnect') { interruptTransport() }
    else if (body.action === 'change' || body.action === 'sold-out') { const event = updateCatalogNft(id, body.action === 'sold-out'); if (event) broadcast(event) }
    else if (body.action === 'price') {
      if (typeof body.priceEth !== 'string' || !/^\d{1,8}(?:\.\d{1,18})?$/.test(body.priceEth)) return HttpResponse.json({ code: 'VALIDATION', message: 'Preço decimal inválido.' }, { status: 422 })
      const event = updateCatalogNft(id, false, body.priceEth); if (event) broadcast(event)
    }
    else if (body.action === 'duplicate') { const event = getLastCatalogEvent(); if (event) broadcast(event) }
    else if (body.action === 'old') broadcast({ eventId: `old:${id}`, resourceId: id, version: 0 })
    else return HttpResponse.json({ message: 'Cenário inválido.' }, { status: 400 })
    return HttpResponse.json({ message: 'Cenário aplicado na API simulada.' })
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
        interruptTransport()
        message = 'Transporte interrompido por 2 segundos. A reconexão é automática.'
        break
      case 'fail-next':
        failNextRead()
        message = 'Próxima consulta REST responderá 503.'
        break
      case 'reset':
        resetProof()
        resetOutage()
        message = 'Cenário restaurado.'
        break
      default:
        return HttpResponse.json({ message: 'Ação de cenário inválida.' }, { status: 400 })
    }
    return HttpResponse.json<ScenarioResult>({ message })
  }),
  http.get('/api/__proof/diagnostics', () => HttpResponse.json({ activeConnections: connectionsCount() })),
  http.post('/api/__proof/reset', () => {
    resetProof()
    resetOutage()
    return HttpResponse.json({ message: 'Cenário restaurado.' })
  }),
]
