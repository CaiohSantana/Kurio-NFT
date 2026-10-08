/* global process, document, fetch, console, URL */
import { chromium, expect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const base = process.env.REVIEW_URL || 'http://127.0.0.1:4176'
const output = process.env.SMOKE_OUTPUT || 'artifacts/delivery-smoke.json'
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const api = (path, method = 'GET', body, scope) => page.evaluate(async ({ path, method, body, scope }) => {
    const response = await fetch(`/api${path}`, { method, headers: { 'Content-Type': 'application/json', ...(scope ? { 'X-Session-Scope': scope } : {}) }, body: body ? JSON.stringify(body) : undefined })
    if (!response.ok) throw Error(`${path}: ${response.status}`)
    return response.json()
  }, { path, method, body, scope })
  await page.goto(`${base}/preparation`)
  await page.getByRole('link', { name: 'Abrir prova de integração' }).waitFor()
  await api('/__scenario/reset', 'POST')
  const session = await api('/session', 'POST', { email: 'ana@kurio.test', password: 'Kurio123!' })
  const profile = await api('/profile', 'GET', undefined, session.scope)
  await api('/wallets', 'POST', { ...profile, kind: 'primary', network: 'Ethereum', provider: 'MetaMask', address: `0x${'1'.repeat(40)}`, nickname: 'Principal', referral: '', secondaryReference: '' }, session.scope)
  await api('/cart/items', 'POST', { nftId: 'emerald-042', editionId: 'ten', quantity: 2 }, session.scope)
  const checks = []
  for (const [path, selector] of [['/', '.card-name'], ['/nfts/emerald-042', '.detail-info h1'], ['/nfts/inexistente', '.empty-state h1'], ['/cart', '[data-testid=cart-total]'], ['/login', '[name=email]'], ['/signup', '[name=username]'], ['/account/profile', '[name=displayName]'], ['/account/wallets', '[name=address]'], ['/checkout', '[data-testid=checkout-total]'], ['/integration', 'h1']]) {
    const response = await page.goto(`${base}${path}`)
    expect(response.status()).toBe(200)
    await page.locator(selector).first().waitFor()
    const refreshed = await page.reload()
    expect(refreshed.status()).toBe(200)
    await page.locator(selector).first().waitFor()
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => { image.loading = 'eager'; return image.decode() })) })
    if (path === '/integration') {
      await expect(page.getByTestId('version')).toHaveText('1')
      await expect(page.getByTestId('connection')).toHaveText('Conectado')
      await page.getByRole('button', { name: 'Alterar NFT', exact: true }).click()
      await expect(page.getByTestId('version')).toHaveText('2')
      await expect(page.getByTestId('received')).toHaveText('1')
    }
    checks.push({ path, direct: 200, refresh: 200 })
  }
  await page.goto(`${base}/checkout`)
  await page.locator('.provider-list input:checked').click()
  await expect(page.getByRole('button', { name: 'Confirmar compra', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click()
  await page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' }).waitFor()
  const orderPath = new URL(page.url()).pathname
  const response = await page.goto(`${base}${orderPath}`)
  expect(response.status()).toBe(200)
  await page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' }).waitFor()
  await page.reload()
  await page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' }).waitFor()
  expect(await page.locator('.receipt-card').evaluate(node => node.getBoundingClientRect().width)).toBe(578)
  checks.push({ path: orderPath, direct: 200, refresh: 200, receiptWidth: 578 })
  const resources = []
  for (const path of ['/mockServiceWorker.js', '/assets/fonts/roboto-mono-latin.woff2', '/assets/optimized/8f387-450.webp', '/assets/figma/8f387.png']) {
    const response = await page.request.get(`${base}${path}`)
    expect(response.status()).toBe(200)
    resources.push({ path, status: response.status(), type: response.headers()['content-type'], bytes: (await response.body()).length })
  }
  await mkdir(output.slice(0, output.lastIndexOf('/')), { recursive: true })
  await writeFile(output, JSON.stringify({ base, checks, resources, realUiPurchaseConfirmed: true }, null, 2))
  console.log(`${checks.length} direct/refresh checks; ${resources.length} local resources; API-confirmed receipt`)
} finally { await browser.close() }
