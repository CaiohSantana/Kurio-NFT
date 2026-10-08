/* global process, fetch, document, innerWidth, innerHeight, console, getComputedStyle, chrome, devicePixelRatio, requestAnimationFrame, matchMedia */
import { chromium, expect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

// Captures the same API fixture before/after at CSS pixel scale 1; no UI setters.
const phase = process.argv[2] ?? 'after', base = process.env.REVIEW_URL ?? 'http://127.0.0.1:4175'
const directory = `artifacts/visual-review/${phase}`
await mkdir(directory, { recursive: true })
const nativeZoom = process.env.REVIEW_NATIVE_ZOOM === 'true'
const zoomFactor = Number(process.env.REVIEW_ZOOM_FACTOR ?? 2)
if (![2, 4].includes(zoomFactor)) throw Error('Use REVIEW_ZOOM_FACTOR=2 or 4')
const extension = path.resolve('.tmp/zoom-extension')
if (nativeZoom) {
  await mkdir(extension, { recursive: true })
  await writeFile(`${extension}/manifest.json`, JSON.stringify({ manifest_version: 3, name: 'Kurio native zoom verification', version: '1.0', permissions: ['tabs'], background: { service_worker: 'background.js' } }))
  await writeFile(`${extension}/background.js`, 'chrome.runtime.onInstalled.addListener(() => {});')
}
const browser = nativeZoom ? null : await chromium.launch(), measurements = []
for (const width of nativeZoom ? zoomFactor === 4 ? [1440] : [768, 1440] : [390, 414, 768, 1440]) {
  const height = width === 1440 ? 1657 : width === 414 ? 896 : 1024
  const options = { viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce', forcedColors: process.env.REVIEW_FORCED_COLORS === 'true' ? 'active' : 'none' }
  const context = nativeZoom ? await chromium.launchPersistentContext(`.tmp/zoom-review-${width}-${Date.now()}`, { ...options, channel: 'chromium', headless: true, args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`] }) : await browser.newContext(options)
  const page = await context.newPage()
  const extensionWorker = nativeZoom ? context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker') : null
  const zoom = async factor => extensionWorker.evaluate(async ({ factor, base }) => { const tabs = await chrome.tabs.query({}); const tab = tabs.find(tab => tab.url.startsWith(base)); await chrome.tabs.setZoom(tab.id, factor); return chrome.tabs.getZoom(tab.id) }, { factor, base })
  await page.goto(`${base}/preparation`); await page.getByRole('link', { name: 'Abrir prova de integração' }).waitFor()
  const api = async (path, method = 'GET', body, scope) => page.evaluate(async ({ path, method, body, scope }) => { const r = await fetch(`/api${path}`, { method, headers: { 'Content-Type': 'application/json', ...(scope ? { 'X-Session-Scope': scope } : {}) }, body: body ? JSON.stringify(body) : undefined }); if (!r.ok) throw new Error(`${path}: ${r.status}`); return r.json() }, { path, method, body, scope })
  const inspectReflow = async (ready) => {
    await page.keyboard.press('Tab')
    const focus = await page.evaluate(() => { const node = document.activeElement, style = getComputedStyle(node); return { element: node.tagName, outline: style.outlineWidth, shadow: style.boxShadow } })
    const reducedWidth = Math.max(320, Math.round(width / 2))
    if (nativeZoom) await zoom(zoomFactor)
    else await page.setViewportSize({ width: reducedWidth, height: Math.max(640, Math.round(height / 2)) })
    if (!nativeZoom) await page.reload()
    await page.evaluate(() => new Promise(requestAnimationFrame))
    await page.locator(ready).first().waitFor()
    const reflow = await page.evaluate(nativeZoom => { const dialog = document.querySelector('dialog[open]'), box = dialog?.getBoundingClientRect(); return { overflow: document.documentElement.scrollWidth > innerWidth, width: innerWidth, height: innerHeight, devicePixelRatio, forcedColors: matchMedia('(forced-colors: active)').matches, withoutReload: nativeZoom, dialogFits: box ? box.top >= 0 && box.bottom <= innerHeight : null } }, nativeZoom)
    if (nativeZoom && (reflow.overflow || reflow.dialogFits === false)) throw Error(`Native zoom lost content: ${JSON.stringify(reflow)}`)
    if (nativeZoom) await zoom(1)
    else await page.setViewportSize({ width, height })
    await page.reload(); await page.locator(ready).first().waitFor()
    return { focus, reflow }
  }
  await api('/__scenario/reset', 'POST')
  // Auth captures use the same empty guest state at both phases.
  for (const [name, path] of [['login', '/login'], ['signup', '/signup']]) {
    await page.goto(`${base}${path}`); await page.locator('.auth-field input').first().waitFor()
    if (width >= 640) await expect(page.locator('.catalog-results .card-name')).toHaveCount(9)
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((image) => { image.loading = 'eager'; return image.decode() })) })
    await page.screenshot({ path: `${directory}/${name}-${width}.png`, fullPage: true, animations: 'disabled' })
    measurements.push({ phase, name, width, height, ...(await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth }))), ...(await inspectReflow('.auth-field input')) })
  }
  const session = await api('/session', 'POST', { email: 'ana@kurio.test', password: 'Kurio123!' })
  const scope = session.scope, profile = await api('/profile', 'GET', undefined, scope)
  await page.goto(`${base}/account/wallets`); await page.locator('[name=address]').first().waitFor(); await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: `${directory}/wallets-empty-${width}.png`, fullPage: true, animations: 'disabled' })
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
    Object.assign(measurements.at(-1), await inspectReflow(ready))
  }
  await capture('home', '/', '.card-name'); await capture('detail', '/nfts/emerald-042', '.detail-info h1'); await capture('cart', '/cart', '[data-testid=cart-total]')
  await capture('profile', '/account/profile', '[name=displayName]'); await capture('wallets', '/account/wallets', '[name=address]')
  await capture('checkout', '/checkout', '[data-testid=checkout-total]')
  const legacy = page.getByRole('button', { name: 'Conectar carteira', exact: true })
  if (await legacy.isVisible()) { await legacy.click(); await page.getByRole('button', { name: 'Carteira conectada · Gerenciar' }).waitFor(); await page.getByLabel('Revisei os dados e aceito esta cotação').check() }
  else { const response = page.waitForResponse((r) => r.url().endsWith('/api/wallet-connection') && r.request().method() === 'POST'); await page.locator('.provider-list input:checked').click(); await response }
  await expect(page.getByRole('button', { name: 'Confirmar compra', exact: true })).toBeEnabled(); await page.screenshot({ path: `${directory}/checkout-ready-${width}.png`, fullPage: true, animations: 'disabled' }); await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click()
  await page.getByRole('heading', { name: /Compra confirmada|Seus NFTs agora/ }).waitFor()
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((image) => image.decode())) })
  await page.screenshot({ path: `${directory}/receipt-${width}.png`, fullPage: true, animations: 'disabled' })
  measurements.push({ phase, name: 'receipt', width, height, ...(await page.evaluate(() => { const b = document.querySelector('.receipt-card').getBoundingClientRect(); return { overflow: document.documentElement.scrollWidth > innerWidth, rectangle: { x: b.x, y: b.y, width: b.width, height: b.height } } })) })
  Object.assign(measurements.at(-1), await inspectReflow('.receipt-card'))
  await context.close()
}
await browser?.close(); await writeFile(`${directory}/measurements.json`, JSON.stringify(measurements, null, 2)); console.log(`${phase}: ${measurements.length} captures; native zoom=${nativeZoom}`)
