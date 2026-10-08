import type { CheckoutQuote, Collector, OrderInput, WalletConnection } from '@/features/checkout/contracts'
import type { Attempt, Order, OrderUpdated } from '@/features/orders/contracts'
import type { Network } from '@/features/catalog/contracts'
import { account, allAccounts, authorize, CommerceError, decimal, quote, save, session, units, type Account } from './commerce-state'
import { consumePurchasedStock } from './catalog-state'
import { emitNft, emitOrder } from './socket'

interface Configuration { hold: boolean; outcome: 'confirmed' | 'refused'; timeout: boolean; connectionRefused: boolean; feeIncrease: boolean }
const configKey = 'kurio-checkout-config'
let configuration: Configuration = { hold: false, outcome: 'confirmed', timeout: false, connectionRefused: false, feeIncrease: false }
try { configuration = { ...configuration, ...JSON.parse(localStorage.getItem(configKey) ?? '{}') } } catch { /* malformed scenario resets */ }
const timers = new Map<string, number>()
function state(a: Account) { return a.checkout ??= { connection: null, quotes: [], attempt: null, orders: [] } }
const stable = (value: unknown): string => value === null || typeof value !== 'object' ? JSON.stringify(value) ?? 'null' : Array.isArray(value) ? `[${value.map(stable).join(',')}]` : `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`).join(',')}}`
function collectorErrors(body: Collector) {
  const fields: Record<string, string> = {}
  if (typeof body?.displayName !== 'string' || body.displayName.trim().length < 2 || body.displayName.length > 64) fields.displayName = 'Informe de 2 a 64 caracteres.'
  if (typeof body?.username !== 'string' || !/^[\w-]{3,32}$/.test(body.username)) fields.username = 'Informe um usuário válido.'
  if (typeof body?.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) fields.email = 'Informe um e-mail válido.'
  if (body?.ens && !/^[a-z\d-]+(?:\.[a-z\d-]+)*\.eth$/i.test(body.ens)) fields.ens = 'Informe um ENS válido.'
  if ((body?.observation?.length ?? 0) > 1000) fields.observation = 'Use até 1000 caracteres.'
  if (Object.keys(fields).length) throw new CommerceError(422, 'VALIDATION', 'Revise os dados do colecionador.', fields)
}
export async function connection(scope: string | null): Promise<WalletConnection | null> { const a = await account(scope), c = state(a).connection; return c?.scope === scope ? structuredClone(c) : null }
export async function connect(scope: string | null, walletId: string, network: Network, disconnect = false) {
  const a = await account(scope), w = a.wallets?.find((wallet) => wallet.id === walletId)
  if (!w || w.network !== network) throw new CommerceError(422, 'WALLET_INVALID', 'Selecione uma carteira cadastrada e sua rede.', { network: 'Rede incompatível com a carteira.' })
  const c: WalletConnection = { scope: scope!, walletId, network, provider: w.provider, status: disconnect ? 'disconnected' : configuration.connectionRefused ? 'refused' : 'connected' }
  state(a).connection = c; save(); return structuredClone(c)
}
export async function checkoutQuote(scope: string | null, walletId: string, network: Network): Promise<CheckoutQuote> {
  const a = await account(scope), w = a.wallets?.find((wallet) => wallet.id === walletId)
  if (!w || w.network !== network) throw new CommerceError(422, 'WALLET_INVALID', 'Selecione uma carteira cadastrada e sua rede.', { network: 'Rede incompatível com a carteira.' })
  const basic = await quote(scope), fee = basic.lines.length ? decimal(units({ Ethereum: '0.016', Polygon: '0.001', Solana: '0.0005' }[network]) + (configuration.feeIncrease ? units('0.001') : 0n)) : '0'
  const data = { ...basic, networkFeeEth: fee, totalEth: decimal(units(basic.subtotalEth) - units(basic.discountEth) + units(fee)), wallet: structuredClone(w), network }
  const fingerprint = stable(data), s = state(a), previous = s.quotes.find((q) => q.fingerprint === fingerprint && q.expiresAt > Date.now())
  if (previous) return structuredClone(previous)
  const next = { ...data, id: crypto.randomUUID(), version: Math.max(0, ...s.quotes.map((q) => q.version)) + 1, fingerprint, expiresAt: Date.now() + 120000 }
  s.quotes = [...s.quotes.slice(-19), next]; save(); return structuredClone(next)
}
export async function attempt(scope: string | null): Promise<Attempt | null> { const a = await account(scope); const value = state(a).attempt; if (value?.orderId) await readOrder(scope, value.orderId); return structuredClone(value) }
export async function prepareAttempt(scope: string | null, payload: OrderInput): Promise<Attempt> {
  const a = await account(scope); collectorErrors(payload.collector); const s = state(a), previous = s.attempt
  if (previous) {
    const order = s.orders.find((o) => o.id === previous.orderId)
    if (order?.status === 'pending') {
      if (stable(previous.payload) !== stable(payload)) throw new CommerceError(409, 'ATTEMPT_PENDING', 'Existe um pedido pendente. Recupere esta tentativa antes de iniciar outra.')
      return structuredClone(previous)
    }
    if (!order && stable(previous.payload) === stable(payload)) return structuredClone(previous)
  }
  s.attempt = { key: crypto.randomUUID(), payload: structuredClone(payload), orderId: null }; save(); return structuredClone(s.attempt)
}
export async function clearAttempt(scope: string | null) {
  const a = await account(scope), s = state(a), order = s.orders.find((o) => o.id === s.attempt?.orderId)
  if (order?.status === 'pending') throw new CommerceError(409, 'ATTEMPT_PENDING', 'Recupere o pedido pendente antes de iniciar outro.')
  s.attempt = null; save(); return { message: 'Nova tentativa disponível. Pedidos anteriores preservados.' }
}
export function consumeTimeout() { const timeout = configuration.timeout; configuration.timeout = false; localStorage.setItem(configKey, JSON.stringify(configuration)); return timeout }
export async function createOrder(scope: string | null, key: string | null, payload: OrderInput): Promise<Order> {
  const a = await account(scope), s = state(a)
  if (!key || !/^[\w:-]{8,128}$/.test(key)) throw new CommerceError(422, 'IDEMPOTENCY_REQUIRED', 'Chave idempotente obrigatória.')
  const existing = s.orders.find((o) => o.idempotencyKey === key)
  if (existing) {
    if (stable(existing.payload) !== stable(payload)) throw new CommerceError(409, 'IDEMPOTENCY_CONFLICT', 'A mesma chave não aceita conteúdo diferente.')
    return readOrder(scope, existing.id)
  }
  if (s.attempt?.key === key && stable(s.attempt.payload) !== stable(payload)) throw new CommerceError(409, 'IDEMPOTENCY_CONFLICT', 'A mesma chave não aceita conteúdo diferente.')
  collectorErrors(payload.collector)
  const accepted = s.quotes.find((q) => q.id === payload.quoteId), current = await checkoutQuote(scope, payload.walletId, payload.network)
  if (!accepted || accepted.expiresAt <= Date.now() || accepted.fingerprint !== payload.fingerprint || current.fingerprint !== payload.fingerprint) throw new CommerceError(409, 'QUOTE_CHANGED', 'Cotação alterada ou expirada. Revise e confirme novamente.')
  if (!current.purchasable) throw new CommerceError(409, 'STOCK_LIMIT', 'Edição indisponível ou quantidade acima do estoque. Carrinho preservado.')
  const c = await connection(scope)
  if (c?.status !== 'connected' || c.walletId !== payload.walletId || c.network !== payload.network || c.provider !== current.wallet.provider) throw new CommerceError(409, 'WALLET_DISCONNECTED', 'Conecte a carteira selecionada novamente.')
  await authorize(scope, true)
  // Concurrent requests can cross the awaits above. Check again immediately
  // before the atomic append; same key/content is still exactly one order.
  const concurrent = s.orders.find((o) => o.idempotencyKey === key)
  if (concurrent) {
    if (stable(concurrent.payload) !== stable(payload)) throw new CommerceError(409, 'IDEMPOTENCY_CONFLICT', 'A mesma chave não aceita conteúdo diferente.')
    return structuredClone(concurrent)
  }
  const order: Order = { id: crypto.randomUUID(), userId: a.id, originScope: scope!, idempotencyKey: key, payload: structuredClone(payload), status: 'pending', version: 1, createdAt: new Date().toISOString(), transaction: `SIM-${crypto.randomUUID()}`, reason: '', snapshot: structuredClone(current), collector: structuredClone(payload.collector), settleAt: configuration.hold ? null : Date.now() + 1200, outcome: configuration.outcome, cartApplied: false }
  s.orders.push(order); s.attempt = { key, payload: structuredClone(payload), orderId: order.id }; save(); schedule(order); await broadcast(order); return structuredClone(order)
}
async function find(id: string) { for (const a of await allAccounts()) { const order = a.checkout?.orders.find((o) => o.id === id); if (order) return { a, order } } return null }
async function broadcast(order: Order, all = false, version = order.version, foreignScope?: string) {
  const active = await session(), scope = foreignScope ?? (active.user?.id === order.userId ? active.scope : order.originScope)
  const event: OrderUpdated = { eventId: `order:${order.id}:${version}`, resourceId: order.id, version, userId: order.userId, scope }
  emitOrder(event, all)
}
function schedule(order: Order) {
  if (order.status !== 'pending' || order.settleAt === null || timers.has(order.id)) return
  timers.set(order.id, window.setTimeout(() => { timers.delete(order.id); void settle(order.id, order.outcome) }, Math.max(0, order.settleAt - Date.now())))
}
export async function settle(id: string, outcome: 'confirmed' | 'refused') {
  const found = await find(id); if (!found || found.order.status !== 'pending') return found?.order ?? null
  const { a, order } = found
  const stockEvents = outcome === 'confirmed' ? consumePurchasedStock(order.snapshot.lines) : null
  order.status = outcome === 'confirmed' && stockEvents ? 'confirmed' : 'refused'; order.reason = order.status === 'refused' ? stockEvents === null && outcome === 'confirmed' ? 'Estoque insuficiente na confirmação.' : 'Pagamento recusado.' : ''; order.version++
  if (order.status === 'confirmed' && !order.cartApplied) {
    a.cart.items = a.cart.items.flatMap((item) => { const purchased = order.snapshot.lines.find((line) => line.id === item.id)?.quantity ?? 0; const quantity = Math.max(0, item.quantity - purchased); return quantity ? [{ ...item, quantity }] : [] })
    a.cart.version++; if (!a.cart.items.length) a.cart.coupon = ''; order.cartApplied = true
  }
  save(); for (const event of stockEvents ?? []) emitNft(event); await broadcast(order); return structuredClone(order)
}
export async function readOrder(scope: string | null, id: string): Promise<Order> {
  const a = await account(scope), found = await find(id)
  if (!found) throw new CommerceError(404, 'NOT_FOUND', 'Pedido inexistente.')
  if (found.a.id !== a.id) throw new CommerceError(403, 'FORBIDDEN', 'Pedido pertencente a outro usuário.')
  if (found.order.status === 'pending' && found.order.settleAt !== null && found.order.settleAt <= Date.now()) await settle(id, found.order.outcome)
  else schedule(found.order)
  return structuredClone(found.order)
}
export async function checkoutScenario(action: string, id?: string) {
  if (action === 'reset') { for (const timer of timers.values()) window.clearTimeout(timer); timers.clear(); for (const a of await allAccounts()) a.checkout = undefined; configuration = { hold: false, outcome: 'confirmed', timeout: false, connectionRefused: false, feeIncrease: false }; save() }
  else if (action === 'hold') configuration.hold = true
  else if (action === 'auto') { configuration.hold = false; configuration.outcome = 'confirmed' }
  else if (action === 'order-refused') configuration.outcome = 'refused'
  else if (action === 'timeout') { configuration.timeout = true; configuration.hold = true }
  else if (action === 'connection-refused') configuration.connectionRefused = true
  else if (action === 'connection-allowed') configuration.connectionRefused = false
  else if (action === 'fee-change') configuration.feeIncrease = true
  else if (action === 'disconnect-wallet') { for (const a of await allAccounts()) if (a.checkout?.connection) a.checkout.connection.status = 'disconnected'; save() }
  else if (id && (action === 'confirm' || action === 'refuse')) await settle(id, action === 'confirm' ? 'confirmed' : 'refused')
  else if (id && ['duplicate', 'old', 'foreign'].includes(action)) { const f = await find(id); if (f) await broadcast(f.order, true, action === 'old' ? 0 : f.order.version, action === 'foreign' ? 'old-session-scope' : undefined) }
  else throw new CommerceError(400, 'SCENARIO', 'Cenário inválido.')
  localStorage.setItem(configKey, JSON.stringify(configuration)); return { message: 'Cenário aplicado.' }
}
