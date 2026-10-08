import { delay, http, HttpResponse, type JsonBodyType } from 'msw'
import * as state from './commerce-state'
import type { Credentials } from '@/features/auth/contracts'
import type { CartItem } from '@/features/cart/contracts'
import * as accounts from './account-state'
import type { ProfileInput, PasswordInput } from '@/features/profile/contracts'
import type { WalletInput } from '@/features/wallets/contracts'

// Capture identity at request time. Reauthorize after latency, before any write:
// an old request cannot acquire the user that logged in while it was waiting.
export async function run(request: Request, target: string, operation: (scope: string | null) => Promise<JsonBodyType>, anonymous = false) {
  const scope = request.headers.get('X-Session-Scope'), failure = target !== 'scenario' && state.consumeCommerceFailure(target), latency = state.commerceDelay
  try {
    if (!anonymous) await state.authorize(scope)
    await delay(target === 'scenario' ? 0 : latency)
    if (!anonymous) await state.authorize(scope)
    if (failure) return HttpResponse.json({ code: 'TEMPORARY', message: 'Falha transitória. Tente novamente.' }, { status: 503 })
    return HttpResponse.json(await operation(scope), { headers: { 'X-Mock-Handler': target, 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof state.CommerceError) return HttpResponse.json({ code: error.code, message: error.message, fieldErrors: error.fieldErrors }, { status: error.status })
    throw error
  }
}
export const commerceHandlers = [
  http.get('/api/profile', ({ request }) => run(request, 'profile', (scope) => accounts.profile(scope))),
  http.patch('/api/profile', async ({ request }) => { const body = await request.json() as ProfileInput; return run(request, 'profile', (scope) => accounts.editProfile(scope, body)) }),
  http.put('/api/profile/avatar', async ({ request }) => { const body = await request.json() as { data: string }; return run(request, 'avatar', (scope) => accounts.avatar(scope, body.data)) }),
  http.delete('/api/profile/avatar', ({ request }) => run(request, 'avatar', (scope) => accounts.avatar(scope, null))),
  http.patch('/api/profile/password', async ({ request }) => { const body = await request.json() as PasswordInput; return run(request, 'password', (scope) => accounts.password(scope, body)) }),
  http.get('/api/wallets', ({ request }) => run(request, 'wallets', (scope) => accounts.wallets(scope))),
  http.post('/api/wallets', async ({ request }) => { const body = await request.json() as WalletInput; return run(request, 'wallets', (scope) => accounts.editWallet(scope, body)) }),
  http.patch('/api/wallets/:id', async ({ request, params }) => { const body = await request.json() as WalletInput; return run(request, 'wallets', (scope) => accounts.editWallet(scope, body, String(params.id))) }),
  http.patch('/api/wallet-preferences', async ({ request }) => { const body = await request.json() as { reusePrimary: boolean }; return run(request, 'wallets', (scope) => accounts.reusePrimary(scope, body.reusePrimary === true)) }),
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
