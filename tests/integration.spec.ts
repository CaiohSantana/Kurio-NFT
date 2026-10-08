import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Every browser context is isolated. Reset also exercises an actual MSW handler.
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Abrir prova de integração' })).toBeVisible()
  expect(await page.evaluate(async () => (await fetch('/api/__proof/reset', { method: 'POST' })).status)).toBe(200)
})

test('REST, loading and Socket.IO updates; duplicate/old events cannot regress data', async ({ page }) => {
  const initialRest = page.waitForResponse((response) => response.url().endsWith('/api/nfts/emerald-042') && response.status() === 200)
  await page.goto('/integration')
  await expect(page.getByText('Carregando NFT por REST…')).toBeVisible()
  const initial = await initialRest
  expect(initial.headers()['x-mock-handler']).toBe('proof-nft')
  expect((await initial.json()).nft.priceEth).toBe('1.19')
  await expect(page.getByTestId('price')).toHaveText('1.19 ETH')
  await expect(page.getByTestId('connection')).toHaveText('Conectado')

  const updatedRest = page.waitForResponse((response) => response.url().endsWith('/api/nfts/emerald-042') && response.status() === 200)
  await page.getByRole('button', { name: 'Alterar NFT', exact: true }).click()
  const updated = await updatedRest
  expect((await updated.json()).nft).toMatchObject({ version: 2, priceEth: '1.29', available: 9 })
  await expect(page.getByTestId('price')).toHaveText('1.29 ETH')
  await expect(page.getByTestId('version')).toHaveText('2')
  await expect(page.getByTestId('received')).toHaveText('1')
  const reads = await page.getByTestId('read-count').innerText()

  await page.getByRole('button', { name: 'Evento duplicado' }).click()
  await expect(page.getByTestId('received')).toHaveText('2')
  await expect(page.getByTestId('ignored')).toHaveText('1')
  await page.getByRole('button', { name: 'Evento antigo' }).click()
  await expect(page.getByTestId('received')).toHaveText('3')
  await expect(page.getByTestId('ignored')).toHaveText('2')
  await expect(page.getByTestId('version')).toHaveText('2')
  await expect(page.getByTestId('price')).toHaveText('1.29 ETH')
  await expect(page.getByTestId('read-count')).toHaveText(reads)
})

test('transport outage misses an update and reconnect reconciles by REST', async ({ page }) => {
  await page.goto('/integration')
  await expect(page.getByTestId('price')).toHaveText('1.19 ETH')
  await expect(page.getByTestId('connection')).toHaveText('Conectado')
  const connections = Number(await page.getByTestId('connections').innerText())
  await page.getByRole('button', { name: 'Interromper conexão' }).click()
  await expect(page.getByTestId('connection')).toHaveText('Desconectado')
  await page.getByRole('button', { name: 'Alterar NFT', exact: true }).click()
  await expect(page.getByText('Base alterada; nft.updated emitido às conexões ativas.')).toBeVisible()
  await expect(page.getByTestId('received')).toHaveText('0')
  await expect(page.getByTestId('price')).toHaveText('1.19 ETH')
  await expect(page.getByTestId('connection')).toHaveText('Conectado')
  await expect(page.getByTestId('connections')).toHaveText(String(connections + 1))
  await expect(page.getByTestId('price')).toHaveText('1.29 ETH')
  await expect(page.getByTestId('version')).toHaveText('2')
  await expect(page.getByTestId('received')).toHaveText('0')
  expect(await page.evaluate(async () => (await (await fetch('/api/nfts/emerald-042')).json()).nft.version)).toBe(2)
})

test('503 is visible, retry restores REST, refresh persists data and fonts are local', async ({ page }) => {
  await page.goto('/integration')
  await expect(page.getByTestId('price')).toHaveText('1.19 ETH')
  await page.getByRole('button', { name: 'Falhar próxima consulta' }).click()
  await expect(page.getByText('Próxima consulta REST responderá 503.')).toBeVisible()
  await page.getByRole('button', { name: 'Consultar REST' }).click()
  await expect(page.getByRole('alert')).toContainText('Falha na consulta REST')
  await expect(page.getByTestId('price')).toHaveText('1.19 ETH')
  await page.getByRole('button', { name: 'Consultar REST' }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByTestId('connection')).toHaveText('Conectado')
  await page.getByRole('button', { name: 'Alterar NFT', exact: true }).click()
  await expect(page.getByTestId('price')).toHaveText('1.29 ETH')
  await page.reload()
  await expect(page.getByTestId('price')).toHaveText('1.29 ETH')
  const font = await page.evaluate(async () => {
    await document.fonts.ready
    return { loaded: document.fonts.check('500 16px "Roboto Mono"'), local: performance.getEntriesByType('resource').some((entry) => entry.name.endsWith('/assets/fonts/roboto-mono-latin.woff2')) }
  })
  expect(font).toEqual({ loaded: true, local: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('route teardown releases connections; direct refresh, 404 and reduced motion work', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/integration')
  await expect(page.locator('.proof-skeleton').first()).toHaveCSS('animation-name', 'none')
  await expect(page.getByTestId('connection')).toHaveText('Conectado')
  await expect(page.getByTestId('price')).toHaveText('1.19 ETH')
  // Navigation through Router, not a page unload, proves effect cleanup.
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Abrir prova de integração' })).toBeVisible()
  await page.getByRole('link', { name: 'Abrir prova de integração' }).click()
  await expect(page.getByTestId('connection')).toHaveText('Conectado')
  await page.getByRole('link', { name: 'Voltar à preparação' }).click()
  expect(await page.evaluate(async () => (await (await fetch('/api/__proof/diagnostics')).json()).activeConnections)).toBe(0)
  await page.goto('/not-a-route')
  await expect(page.getByRole('heading', { name: 'Rota inexistente' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Rota inexistente' })).toBeVisible()
})

test('Engine.IO heartbeat keeps the mock connection alive beyond its timeout', async ({ page }) => {
  test.setTimeout(45000)
  await page.goto('/integration')
  await expect(page.getByTestId('connection')).toHaveText('Conectado')
  const connections = await page.getByTestId('connections').innerText()
  // Binding handshake advertises 25s pingInterval + 5s pingTimeout.
  await page.waitForTimeout(31000)
  await expect(page.getByTestId('connection')).toHaveText('Conectado')
  await expect(page.getByTestId('connections')).toHaveText(connections)
  await page.getByRole('button', { name: 'Alterar NFT', exact: true }).click()
  await expect(page.getByTestId('price')).toHaveText('1.29 ETH')
})
