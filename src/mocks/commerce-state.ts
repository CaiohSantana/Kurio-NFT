import type { Credentials, Session, User } from '@/features/auth/contracts'
import type { Cart, CartItem, Quote } from '@/features/cart/contracts'
import { readCatalogNft } from './catalog-state'

interface Account extends User { salt: string; hash: string; favorites: string[]; cart: Cart }
interface Store { users: Account[]; guestId: string; guest: Cart; session: { token: string; userId: string; expiresAt: number; notices: string[] } | null; merged: string[]; expired?: boolean }
const key = 'kurio-commerce-v1'
const emptyCart = (): Cart => ({ items: [], coupon: '', version: 1 })
const hex = (bytes: Uint8Array) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
async function hash(password: string, salt: string) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  return hex(new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 100000 }, material, 256)))
}
async function seed(): Promise<Store> {
  const users = await Promise.all(['ana', 'bruno'].map(async (username) => {
    const salt = hex(crypto.getRandomValues(new Uint8Array(16)))
    return { id: username, username, email: `${username}@kurio.test`, salt, hash: await hash('Kurio123!', salt), favorites: [], cart: emptyCart() }
  }))
  return { users, guestId: crypto.randomUUID(), guest: emptyCart(), session: null, merged: [] }
}
let store: Store
const ready = (async () => { try { const saved = JSON.parse(localStorage.getItem(key) ?? 'null') as Store | null; if (saved?.users?.length && saved.guest && saved.guestId) { store = saved; return } } catch { /* Reset corrupted demo persistence. */ } store = await seed(); save() })()
function save() { localStorage.setItem(key, JSON.stringify(store)) }
export class CommerceError extends Error { constructor(public status: number, public code: string, message: string, public fieldErrors?: Record<string, string>) { super(message) } }
export async function session(): Promise<Session> {
  await ready
  const s = store.session
  if (s && s.expiresAt <= Date.now()) { store.session = null; store.expired = true; save() }
  const user = store.session && store.users.find((u) => u.id === store.session!.userId)
  return { user: user ? { id: user.id, username: user.username, email: user.email } : null, scope: store.session?.token ?? `guest:${store.guestId}`, expiresAt: store.session?.expiresAt ?? null, notices: store.session?.notices ?? [], expired: store.expired ?? false }
}
export async function authorize(scope: string | null, privateOnly = false) {
  const current = await session()
  if (!scope || scope !== current.scope || (privateOnly && !current.user)) throw new CommerceError(401, 'SESSION_EXPIRED', 'Sessão expirada. Entre novamente para continuar.')
  return current
}
function validate(body: Credentials, signup: boolean) {
  const errors: Record<string, string> = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email ?? '')) errors.email = 'Informe um e-mail válido.'
  if (typeof body.password !== 'string' || body.password.length < 8 || body.password.length > 128) errors.password = 'Use de 8 a 128 caracteres.'
  if (signup && !/^[\w-]{3,32}$/.test(body.username ?? '')) errors.username = 'Use de 3 a 32 letras, números, _ ou -.'
  if (signup && body.password !== body.confirmation) errors.confirmation = 'As senhas não coincidem.'
  if (Object.keys(errors).length) throw new CommerceError(422, 'VALIDATION', 'Revise os campos.', errors)
}
export async function authenticate(body: Credentials, signup: boolean): Promise<Session> {
  await ready; validate(body, signup)
  const email = body.email.trim().toLowerCase()
  let account = store.users.find((u) => u.email === email)
  if (signup) {
    if (account || store.users.some((u) => u.username.toLowerCase() === body.username!.toLowerCase())) throw new CommerceError(409, 'ACCOUNT_CONFLICT', 'E-mail ou nome de usuário já cadastrado.', { email: 'Verifique o e-mail e o nome de usuário.' })
    const salt = hex(crypto.getRandomValues(new Uint8Array(16)))
    account = { id: crypto.randomUUID(), email, username: body.username!, salt, hash: await hash(body.password, salt), favorites: [], cart: emptyCart() }
    // Recheck after asynchronous hashing to keep concurrent registration atomic.
    if (store.users.some((u) => u.email === email || u.username.toLowerCase() === account!.username.toLowerCase())) throw new CommerceError(409, 'ACCOUNT_CONFLICT', 'Conta já cadastrada.')
    store.users.push(account)
  } else if (!account || await hash(body.password, account.salt) !== account.hash) throw new CommerceError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha inválidos.', { password: 'Verifique as credenciais.' })
  const notices: string[] = []
  const mergeId = `${store.guestId}:${store.guest.version}`
  if (store.guest.items.length && !store.merged.includes(mergeId)) {
    for (const item of store.guest.items) {
      const target = account!.cart.items.find((i) => i.id === item.id)
      if (target) target.quantity += item.quantity; else account!.cart.items.push({ ...item })
    }
    if (!account!.cart.coupon) account!.cart.coupon = store.guest.coupon
    account!.cart.version++; store.merged.push(mergeId)
    notices.push('Carrinho visitante conciliado uma única vez. Quantidades somadas; ajuste os itens que ultrapassarem o estoque.')
  }
  // Guest identity rotates atomically with the transfer, so retries cannot transfer twice.
  store.guest = emptyCart(); store.guestId = crypto.randomUUID()
  store.expired = false
  store.session = { token: crypto.randomUUID(), userId: account!.id, expiresAt: Date.now() + 30 * 60 * 1000, notices }
  save(); return session()
}
export async function logout(scope: string | null) { await authorize(scope); store.session = null; store.expired = false; store.guest = emptyCart(); store.guestId = crypto.randomUUID(); save(); return session() }
function ownedCart(s: Session) { return s.user ? store.users.find((u) => u.id === s.user!.id)!.cart : store.guest }
export async function cart(scope: string | null) { return structuredClone(ownedCart(await authorize(scope))) }
export async function favorites(scope: string | null) { const s = await authorize(scope, true); return [...store.users.find((u) => u.id === s.user!.id)!.favorites] }
export async function favorite(scope: string | null, id: string, enabled: boolean) {
  const s = await authorize(scope, true)
  if (!readCatalogNft(id)) throw new CommerceError(404, 'NOT_FOUND', 'NFT inexistente.')
  const a = store.users.find((u) => u.id === s.user!.id)!
  a.favorites = enabled ? [...new Set([...a.favorites, id])] : a.favorites.filter((value) => value !== id); save(); return [...a.favorites]
}
export async function editCart(scope: string | null, action: 'add' | 'quantity' | 'remove', item: Partial<CartItem>) {
  const c = ownedCart(await authorize(scope))
  const id = action === 'add' ? `${item.nftId}:${item.editionId}` : item.id
  const existing = c.items.find((i) => i.id === id)
  if (action === 'remove') { c.items = c.items.filter((i) => i.id !== id) }
  else {
    const nftId = existing?.nftId ?? item.nftId!, editionId = existing?.editionId ?? item.editionId!
    const nft = readCatalogNft(nftId)?.nft, edition = nft?.editions.find((e) => e.id === editionId)
    const quantity = action === 'add' ? (existing?.quantity ?? 0) + (item.quantity ?? 0) : item.quantity
    if (!nft || !edition) throw new CommerceError(404, 'NOT_FOUND', 'NFT ou edição inexistente.')
    const limit = Math.min(edition.available, edition.maxQuantity)
    if (!Number.isInteger(quantity) || quantity! < 1 || quantity! > limit) throw new CommerceError(409, 'STOCK_LIMIT', `Quantidade permitida: 1 a ${limit}. Edição ${edition.label}.`, { quantity: limit ? `Escolha até ${limit} unidades.` : 'Edição esgotada.' })
    if (existing) existing.quantity = quantity!; else c.items.push({ id: id!, nftId, editionId, quantity: quantity! })
  }
  c.version++; save(); return structuredClone(c)
}
export async function coupon(scope: string | null, code: string) {
  const c = ownedCart(await authorize(scope)); const normalized = code.trim().toUpperCase()
  if (normalized === 'DROP2025') throw new CommerceError(422, 'COUPON_EXPIRED', 'Cupom expirado.', { coupon: 'Este cupom expirou.' })
  if (normalized && normalized !== 'KURIO10') throw new CommerceError(422, 'COUPON_INVALID', 'Cupom inválido.', { coupon: 'Use um código válido.' })
  c.coupon = normalized; c.version++; save(); return structuredClone(c)
}
const units = (value: string) => { const [whole, fraction = ''] = value.split('.'); return BigInt(whole) * 10n ** 18n + BigInt(fraction.padEnd(18, '0')) }
const decimal = (value: bigint) => { const whole = value / 10n ** 18n; const tail = (value % 10n ** 18n).toString().padStart(18, '0').replace(/0+$/, ''); return `${whole}${tail ? `.${tail}` : ''}` }
export async function quote(scope: string | null): Promise<Quote> {
  const c = ownedCart(await authorize(scope))
  const lines = c.items.map((item) => {
    const nft = readCatalogNft(item.nftId)!.nft, e = nft.editions.find((value) => value.id === item.editionId)!
    const limit = Math.min(e.available, e.maxQuantity)
    return { ...item, nft, editionLabel: e.label, limit, available: item.quantity <= limit, lineEth: decimal(units(nft.priceEth) * BigInt(item.quantity)) }
  })
  const subtotal = lines.reduce((sum, line) => sum + units(line.lineEth), 0n), discount = c.coupon === 'KURIO10' ? subtotal / 10n : 0n, fee = lines.length ? units('0.016') : 0n
  return { lines, subtotalEth: decimal(subtotal), discountEth: decimal(discount), networkFeeEth: decimal(fee), totalEth: decimal(subtotal - discount + fee), coupon: c.coupon, cartVersion: c.version, purchasable: !!lines.length && lines.every((l) => l.available), warnings: lines.filter((l) => !l.available).map((l) => `${l.nft.name} · ${l.editionLabel}: ${l.limit === 0 ? 'edição esgotada' : `limite atual ${l.limit}`}. Item preservado; ajuste ou remova.`) }
}
export let commerceDelay = Number(localStorage.getItem('kurio-commerce-delay') ?? 200)
let fail: string | null = localStorage.getItem('kurio-commerce-failure')
export function consumeCommerceFailure(target: string) { if (fail !== target && fail !== 'all') return false; fail = null; localStorage.removeItem('kurio-commerce-failure'); return true }
export async function commerceScenario(action: string, target?: string, milliseconds?: number) {
  await ready
  if (action === 'reset') { store = await seed(); commerceDelay = 200; fail = null; localStorage.removeItem('kurio-commerce-delay'); localStorage.removeItem('kurio-commerce-failure'); save() }
  else if (action === 'expire') { if (store.session) store.session.expiresAt = 0; save() }
  else if (action === 'fail') { fail = target ?? 'all'; localStorage.setItem('kurio-commerce-failure', fail) }
  else if (action === 'slow') { commerceDelay = Math.max(0, Math.min(4000, milliseconds ?? 1500)); localStorage.setItem('kurio-commerce-delay', String(commerceDelay)) }
  else throw new CommerceError(400, 'SCENARIO', 'Cenário inválido.')
}
