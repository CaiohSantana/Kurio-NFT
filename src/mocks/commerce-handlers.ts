import { delay, http, HttpResponse, type JsonBodyType } from 'msw'
import * as state from './commerce-state'
import type { Credentials } from '@/features/auth/contracts'
import type { CartItem } from '@/features/cart/contracts'

// Capture identity at request time. Reauthorize after latency, before any write:
// an old request cannot acquire the user that logged in while it was waiting.
async function run(request: Request, target: string, operation: (scope: string | null) => Promise<JsonBodyType>, anonymous = false) {
  const scope = request.headers.get('X-Session-Scope'), failure = target !== 'scenario' && state.consumeCommerceFailure(target), latency = state.commerceDelay
  try {
    if (!anonymous) await state.authorize(scope)
    await delay(target === 'scenario' ? 0 : latency)
    if (!anonymous) await state.authorize(scope)
    if (failure) return HttpResponse.json({ code: 'TEMPORARY', message: 'Falha transitória simulada. Tente novamente.' }, { status: 503 })
    return HttpResponse.json(await operation(scope), { headers: { 'X-Mock-Handler': target, 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof state.CommerceError) return HttpResponse.json({ code: error.code, message: error.message, fieldErrors: error.fieldErrors }, { status: error.status })
    throw error
  }
}
export const commerceHandlers = [
  http.get('/api/session', ({ request }) => run(request, 'session', () => state.session(), true)),
  http.post('/api/session', async ({ request }) => { const body = await request.json() as Credentials; return run(request, 'login', () => state.authenticate(body, false), true) }),
  http.post('/api/accounts', async ({ request }) => { const body = await request.json() as Credentials; return run(request, 'signup', () => state.authenticate(body, true), true) }),
  http.delete('/api/session', ({ request }) => run(request, 'logout', (scope) => state.logout(scope))),
  http.get('/api/favorites', ({ request }) => run(request, 'favorites', (scope) => state.favorites(scope))),
  http.put('/api/favorites/:id', ({ request, params }) => run(request, 'favorites', (scope) => state.favorite(scope, String(params.id), true))),
  http.delete('/api/favorites/:id', ({ request, params }) => run(request, 'favorites', (scope) => state.favorite(scope, String(params.id), false))),
  http.get('/api/cart', ({ request }) => run(request, 'cart', (scope) => state.cart(scope))),
  http.post('/api/cart/items', async ({ request }) => { const body = await request.json() as CartItem; return run(request, 'cart', (scope) => state.editCart(scope, 'add', body)) }),
  http.patch('/api/cart/items/:id', async ({ request, params }) => { const body = await request.json() as { quantity: number }; return run(request, 'cart', (scope) => state.editCart(scope, 'quantity', { ...body, id: String(params.id) })) }),
  http.delete('/api/cart/items/:id', ({ request, params }) => run(request, 'cart', (scope) => state.editCart(scope, 'remove', { id: String(params.id) }))),
  http.put('/api/cart/coupon', async ({ request }) => { const body = await request.json() as { code: string }; return run(request, 'coupon', (scope) => state.coupon(scope, body.code ?? '')) }),
  http.post('/api/quotes', ({ request }) => run(request, 'quote', (scope) => state.quote(scope))),
  http.post('/api/__commerce/scenario', async ({ request }) => { const body = await request.json() as { action: string; target?: string; delay?: number }; return run(request, 'scenario', async () => { await state.commerceScenario(body.action, body.target, body.delay); return { message: 'Cenário aplicado.' } }, true) }),
]
