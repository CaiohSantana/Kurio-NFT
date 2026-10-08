import { delay, http } from 'msw'
import { run } from './commerce-handlers'
import * as checkout from './checkout-state'
import type { Network } from '@/features/catalog/contracts'
import type { OrderInput } from '@/features/checkout/contracts'
export const checkoutHandlers = [
  http.get('/api/wallet-connection', ({ request }) => run(request, 'connection', (scope) => checkout.connection(scope))),
  http.post('/api/wallet-connection', async ({ request }) => { const body = await request.json() as { walletId: string; network: Network }; return run(request, 'connection', (scope) => checkout.connect(scope, body.walletId, body.network)) }),
  http.delete('/api/wallet-connection', async ({ request }) => { const body = await request.json() as { walletId: string; network: Network }; return run(request, 'connection', (scope) => checkout.connect(scope, body.walletId, body.network, true)) }),
  http.post('/api/checkout-quotes', async ({ request }) => { const body = await request.json() as { walletId: string; network: Network }; return run(request, 'quote', (scope) => checkout.checkoutQuote(scope, body.walletId, body.network)) }),
  http.get('/api/order-attempt', ({ request }) => run(request, 'attempt', (scope) => checkout.attempt(scope))),
  http.put('/api/order-attempt', async ({ request }) => { const body = await request.json() as OrderInput; return run(request, 'attempt', (scope) => checkout.prepareAttempt(scope, body)) }),
  http.delete('/api/order-attempt', ({ request }) => run(request, 'attempt', (scope) => checkout.clearAttempt(scope))),
  http.post('/api/orders', async ({ request }) => {
    const body = await request.json() as OrderInput, timeout = checkout.consumeTimeout()
    const response = await run(request, 'order', (scope) => checkout.createOrder(scope, request.headers.get('Idempotency-Key'), body))
    // State/order/attempt already persisted: a lost response must not lose the order.
    if (timeout && response.status === 200) await delay(6000)
    return response
  }),
  http.get('/api/orders/:id', ({ request, params }) => run(request, 'order', (scope) => checkout.readOrder(scope, String(params.id)))),
  http.post('/api/__checkout/scenario', async ({ request }) => { const body = await request.json() as { action: string; id?: string }; return run(request, 'scenario', () => checkout.checkoutScenario(body.action, body.id), true) }),
]
