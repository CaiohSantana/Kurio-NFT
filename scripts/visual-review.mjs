/* global process, fetch, document, innerWidth, console */
import { chromium, expect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

// Captures the same API fixture before/after at CSS pixel scale 1; no UI setters.
const phase = process.argv[2] ?? 'after', base = process.env.REVIEW_URL ?? 'http://127.0.0.1:4175'
const directory = `artifacts/visual-review/${phase}`
await mkdir(directory, { recursive: true })
const browser = await chromium.launch(), measurements = []
for (const width of [390, 414, 768, 1440]) {
  const height = width === 1440 ? 1657 : width === 414 ? 896 : 1024
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce' }), page = await context.newPage()
  await page.goto(`${base}/preparation`); await page.getByRole('link', { name: 'Abrir prova de integração' }).waitFor()
  const api = async (path, method = 'GET', body, scope) => page.evaluate(async ({ path, method, body, scope }) => { const r = await fetch(`/api${path}`, { method, headers: { 'Content-Type': 'application/json', ...(scope ? { 'X-Session-Scope': scope } : {}) }, body: body ? JSON.stringify(body) : undefined }); if (!r.ok) throw new Error(`${path}: ${r.status}`); return r.json() }, { path, method, body, scope })
  for (const area of ['commerce', 'catalog', 'checkout']) await api(`/__${area}/scenario`, 'POST', { action: 'reset' })
  const session = await api('/session', 'POST', { email: 'ana@kurio.test', password: 'Kurio123!' })
  const scope = session.scope, profile = await api('/profile', 'GET', undefined, scope)
  for (const [kind, network, provider, digit] of [['primary', 'Ethereum', 'MetaMask', '1'], ['secondary', 'Polygon', 'Coinbase', '2']]) await api('/wallets', 'POST', { ...profile, kind, network, provider, address: `0x${digit.repeat(40)}`, nickname: kind === 'primary' ? 'Principal' : 'Reserva', referral: '', secondaryReference: '' }, scope)
  const catalog = await api('/nfts'), selected = catalog.items
  // Explicit fixture identities, respecting quantities allowed by the API.
  const all = [...selected]
  for (const [fragment, quantity] of [['emerald', 2], ['violet', 6], ['ivory', 9]]) {
    let nft = all.find((n) => n.id.startsWith(fragment))
    if (!nft) { const result = await api(`/nfts?q=${fragment}`); nft = result.items[0] }
    await api('/cart/items', 'POST', { nftId: nft.id, editionId: 'fifty', quantity }, scope)
  }
  const capture = async (name, path, ready) => {
    await page.goto(`${base}${path}`)
    try { await page.locator(ready).first().waitFor() } catch (error) {
      await page.screenshot({ path: `${directory}/failed-${name}-${width}.png`, fullPage: true })
      console.error(`Capture failed: ${page.url()}\n${await page.locator('body').innerText()}`)
      throw error
    }
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((image) => { image.loading = 'eager'; return image.decode() })) })
    await page.screenshot({ path: `${directory}/${name}-${width}.png`, fullPage: true, animations: 'disabled' })
    measurements.push({ phase, name, width, height, ...(await page.evaluate(() => ({ pageHeight: document.documentElement.scrollHeight, overflow: document.documentElement.scrollWidth > innerWidth, rectangles: Object.fromEntries(['.checkout-layout', '.checkout-review', '.checkout-collector', '.receipt-card', '.account-layout', '.market-footer', '.desktop-header'].map((selector) => { const node = document.querySelector(selector), box = node?.getBoundingClientRect(); return [selector, box ? { x: box.x, y: box.y, width: box.width, height: box.height } : null] })) }))) })
  }
  await capture('home', '/', '.card-name'); await capture('detail', '/nfts/emerald-042', '.detail-info h1'); await capture('cart', '/cart', '[data-testid=cart-total]')
  await capture('profile', '/account/profile', '[name=displayName]'); await capture('wallets', '/account/wallets', '[name=address]')
  await capture('checkout', '/checkout', '[data-testid=checkout-total]')
  await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click()
  await page.getByRole('button', { name: 'Carteira conectada · Gerenciar' }).waitFor()
  await page.getByLabel('Revisei os dados e aceito esta cotação').check(); await expect(page.getByRole('button', { name: 'Confirmar compra', exact: true })).toBeEnabled(); await page.screenshot({ path: `${directory}/checkout-ready-${width}.png`, fullPage: true, animations: 'disabled' }); await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click()
  await page.getByRole('heading', { name: /Compra confirmada|Seus NFTs agora/ }).waitFor()
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((image) => image.decode())) })
  await page.screenshot({ path: `${directory}/receipt-${width}.png`, fullPage: true, animations: 'disabled' })
  measurements.push({ phase, name: 'receipt', width, height, ...(await page.evaluate(() => { const b = document.querySelector('.receipt-card').getBoundingClientRect(); return { overflow: document.documentElement.scrollWidth > innerWidth, rectangle: { x: b.x, y: b.y, width: b.width, height: b.height } } })) })
  await context.close()
}
await browser.close(); await writeFile(`${directory}/measurements.json`, JSON.stringify(measurements, null, 2)); console.log(`${phase}: ${measurements.length} captures at deviceScaleFactor=1`)
