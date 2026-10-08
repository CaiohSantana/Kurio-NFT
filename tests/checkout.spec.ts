import { accountAction } from './session-support'
import { expect, test } from '@playwright/test'
import { request, scenario, nftScenario, login, setup, connect, purchase, resetCheckout, readOrder, revealCollector } from './checkout-support'
test.beforeEach(async ({ page }) => resetCheckout(page))

test('complete purchase, API-only confirmed receipt, immutable amounts and explorer focus', async ({ page }) => {
  await setup(page); await connect(page); const id = await purchase(page)
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible()
  expect(await page.locator('body').innerText()).not.toMatch(/Socket\.IO|versão do recurso|simula[çc][ãa]o|demonstra[çc][ãa]o/i)
  await expect(page.getByTestId('receipt-total')).toHaveText('2.396 ETH'); await expect(page.getByTestId('cart-badge').first()).toHaveText('0')
  await nftScenario(page, 'change'); await page.reload(); await expect(page.getByTestId('receipt-total')).toHaveText('2.396 ETH'); expect((await readOrder(page, id)).snapshot.lines[0].nft.priceEth).toBe('1.19'); expect(new URL(page.url()).pathname).toBe(`/orders/${id}`)
  await page.getByRole('button', { name: 'Ver transação' }).click(); await expect(page.getByRole('dialog', { name: /Explorador de transa/ })).toContainText('ambiente local de testes'); await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'Ver transação' })).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('dialog').getByRole('button', { name: 'Fechar diálogo' }).click(); await expect(page).toHaveURL(/#catalog$/); await expect(page.locator('#catalog')).toBeInViewport()
})
test('collector validation, draft survives refresh/session expiration, wallet refusal and disconnect', async ({ page }) => {
  await setup(page); await scenario(page, 'connection-refused'); await page.locator('.provider-list input:checked').click(); await expect(page.getByText('Conexão recusada. Tente novamente.', { exact: true })).toBeVisible(); await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeDisabled()
  await scenario(page, 'connection-allowed'); await connect(page)
  await page.getByLabel('Nome de usuário').fill('invalid.name'); await page.getByLabel('Observação do colecionador (opcional)').fill('Guardar minha edição')
  await page.getByRole('button', { name: 'Confirmar compra' }).click(); await expect(page.getByLabel('Nome de usuário')).toHaveAttribute('aria-invalid', 'true')
  await page.getByLabel('Nome de usuário').fill('ana'); await page.reload(); await expect(page.getByLabel('Observação do colecionador (opcional)')).toHaveValue('Guardar minha edição')
  await page.getByRole('button', { name: 'Usar outra carteira?' }).filter({ visible: true }).first().click(); await page.getByRole('button', { name: 'Desconectar', exact: true }).click(); await expect(page.getByRole('button', { name: 'Conectar carteira', exact: true })).toHaveCount(0); await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeDisabled()
  await connect(page); await request(page, '/__commerce/scenario', 'POST', { action: 'expire' }); await page.reload(); await expect(page).toHaveURL(/\/login/); await login(page); await expect(page).toHaveURL(/\/checkout/); await expect(page.getByLabel('Observação do colecionador (opcional)')).toHaveValue('Guardar minha edição'); await expect(page.locator('.provider-list input:checked')).toBeEnabled()
})
test('Socket.IO quote change requires new explicit acceptance, sold-out blocks submission', async ({ page }) => {
  await setup(page); await connect(page)
  await nftScenario(page, 'change'); await expect(page.getByTestId('checkout-total')).toHaveText('2.596 ETH')
  await page.getByRole('button', { name: 'Confirmar compra' }).click(); await expect(page.getByRole('dialog', { name: 'Revisar cota\u00e7\u00e3o alterada' })).toBeVisible(); await expect(page.getByRole('button', { name: 'Confirmar nova cota\u00e7\u00e3o' })).toBeEnabled()
  await nftScenario(page, 'sold-out'); await expect(page.getByRole('dialog', { name: 'Revisar cota\u00e7\u00e3o alterada' }).getByRole('alert').filter({ hasText: 'edi\u00e7\u00e3o esgotada' })).toBeVisible(); await expect(page.getByRole('button', { name: 'Confirmar nova cota\u00e7\u00e3o' })).toBeDisabled()
  await page.goto('/cart'); await expect(page.getByTestId('cart-emerald-042:ten')).toBeVisible()
})
test('connection lost in API revalidation cannot create an order', async ({ page }) => {
  await setup(page); await connect(page); await scenario(page, 'disconnect-wallet')
  await page.getByRole('button', { name: 'Confirmar compra' }).click(); await expect(page.getByRole('alert').filter({ hasText: 'Conecte a carteira' })).toBeVisible(); const s = (await request(page, '/session')).data; const a = (await request(page, '/order-attempt', 'GET', undefined, { 'X-Session-Scope': s.scope })).data; expect(a.orderId).toBeNull()
  await page.goto('/cart'); await expect(page.getByTestId('cart-emerald-042:ten').getByRole('spinbutton')).toHaveValue('2')
})
test('refused is terminal and preserves cart; new explicit attempt can succeed', async ({ page }) => {
  await setup(page); await scenario(page, 'order-refused'); await connect(page); const id = await purchase(page); await expect(page.getByRole('heading', { name: 'Pagamento recusado' })).toBeVisible()
  await expect(page.getByTestId('cart-badge').first()).toHaveText('2'); await scenario(page, 'confirm', id); await page.reload(); await expect(page.getByRole('heading', { name: 'Pagamento recusado' })).toBeVisible(); expect((await readOrder(page, id)).version).toBe(2)
  await scenario(page, 'auto'); await page.getByRole('button', { name: 'Revisar pagamento' }).click(); await expect(page.getByTestId('checkout-total')).toHaveText('2.396 ETH'); const next = await purchase(page); expect(next).not.toBe(id); await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible()
})
test('pending refresh/outage reconciles, order.updated passes client, duplicate/old never clean twice; later cart additions survive', async ({ page }) => {
  await setup(page); await scenario(page, 'hold'); await connect(page); const id = await purchase(page); await expect(page.getByRole('heading', { name: 'Pedido pendente' })).toBeVisible(); await page.reload(); expect(new URL(page.url()).pathname).toBe(`/orders/${id}`)
  await page.goto('/nfts/emerald-042?edition=ten&quantity=1'); await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click(); await expect(page.getByTestId('cart-badge').first()).toHaveText('3'); await page.goto(`/orders/${id}`); await expect(page.getByRole('heading', { name: 'Pedido pendente' })).toBeVisible()
  const received = page.waitForEvent('console', { predicate: (message) => message.text() === `[Kurio realtime] order.updated ${id} 2` }), refreshed = page.waitForRequest((r) => r.url().endsWith(`/api/orders/${id}`)); await scenario(page, 'confirm', id); await received; await refreshed; await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible(); await expect(page.getByTestId('cart-badge').first()).toHaveText('1')
  await scenario(page, 'duplicate', id); await scenario(page, 'old', id); await scenario(page, 'refuse', id); await page.reload(); expect((await readOrder(page, id)).version).toBe(2); await expect(page.getByTestId('cart-badge').first()).toHaveText('1')
})
test('order confirmation missed during outage is recovered by REST after reconnect', async ({ page }) => {
  await setup(page); await scenario(page, 'hold'); await connect(page); const id = await purchase(page); await nftScenario(page, 'disconnect'); await scenario(page, 'confirm', id); await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible(); await expect(page.getByTestId('cart-badge').first()).toHaveText('0'); expect((await readOrder(page, id)).status).toBe('confirmed'); expect(new URL(page.url()).pathname).toBe(`/orders/${id}`)
})
test('concurrent/replayed REST creation is idempotent; changed payload conflicts; private receipts are protected', async ({ page }) => {
  await setup(page); await scenario(page, 'hold'); await connect(page)
  const s = (await request(page, '/session')).data, headers = { 'X-Session-Scope': s.scope }, wallets = (await request(page, '/wallets', 'GET', undefined, headers)).data.items, profile = (await request(page, '/profile', 'GET', undefined, headers)).data
  const q = (await request(page, '/checkout-quotes', 'POST', { walletId: wallets[0].id, network: wallets[0].network }, headers)).data
  const payload = { quoteId: q.id, fingerprint: q.fingerprint, walletId: wallets[0].id, network: wallets[0].network, collector: { displayName: profile.displayName, username: profile.username, email: profile.email, nickname: profile.nickname, ens: profile.ens, referral: '', secondaryReference: '', observation: '' } }
  const a = (await request(page, '/order-attempt', 'PUT', payload, headers)).data
  const replies = await Promise.all([request(page, '/orders', 'POST', a.payload, { ...headers, 'Idempotency-Key': a.key }), request(page, '/orders', 'POST', a.payload, { ...headers, 'Idempotency-Key': a.key })]); expect(replies.map((r) => r.status)).toEqual([200, 200]); const id = replies[0].data.id; expect(replies[1].data.id).toBe(id)
  await page.goto(`/orders/${id}`); await expect(page.getByRole('heading', { name: 'Pedido pendente' })).toBeVisible()
  expect((await request(page, '/orders', 'POST', { ...a.payload, collector: { ...a.payload.collector, observation: 'different' } }, { ...headers, 'Idempotency-Key': a.key })).status).toBe(409)
  await page.goto('/login?returnTo=' + encodeURIComponent(`/orders/${id}`)); await login(page, 'bruno'); await expect(page.getByRole('heading', { name: 'Pedido não disponível' })).toBeVisible(); await expect(page.getByRole('alert')).toContainText('outro usuário'); await scenario(page, 'foreign', id); await expect(page.getByRole('heading', { name: 'Pedido não disponível' })).toBeVisible(); await page.goto('/orders/nonexistent'); await expect(page.getByRole('heading', { name: 'Pedido inexistente' })).toBeVisible()
})
test('secondary wallet, provider and compatible network determine API fee; mismatched network recovers', async ({ page }) => {
  await setup(page); await page.getByRole('button', { name: 'Usar outra carteira?' }).filter({ visible: true }).first().click(); await page.getByRole('link', { name: 'Trocar ou editar carteira' }).click(); await page.getByRole('button', { name: 'Adicionar carteira secundária' }).click()
  const form = page.getByRole('form', { name: 'Carteira secundária' })
  await form.getByLabel('Endereço da carteira').fill('0x' + '2'.repeat(40)); await form.getByLabel('Rede').selectOption('Polygon'); await form.getByLabel('Tipo de carteira').selectOption('Coinbase'); await form.getByRole('button', { name: 'Salvar carteira' }).click(); await expect(form.getByRole('status')).toHaveText('Carteira salva.'); await page.getByRole('button', { name: 'Retomar fluxo' }).click()
  await page.getByRole('button', { name: 'Usar outra carteira?' }).filter({ visible: true }).first().click(); await page.getByRole('dialog', { name: 'Carteiras cadastradas' }).getByRole('radio', { name: /Reserva/ }).check(); await expect(page.getByTestId('checkout-total')).toHaveText('2.381 ETH'); await expect(page.getByLabel('Tipo de carteira')).toHaveValue('Coinbase'); await expect(page.getByLabel('Endereço da carteira cadastrada')).toHaveValue('0x' + '2'.repeat(40))
  await revealCollector(page); await page.getByRole('combobox', { name: 'Rede', exact: true }).selectOption('Ethereum'); await expect(page.getByRole('alert')).toContainText('Selecione uma carteira cadastrada e sua rede'); await page.getByRole('combobox', { name: 'Rede', exact: true }).selectOption('Polygon'); await expect(page.getByTestId('checkout-total')).toHaveText('2.381 ETH'); await connect(page); await purchase(page); await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible(); await expect(page.getByTestId('receipt-total')).toHaveText('2.381 ETH')
})
test('timeout after creation recovers persisted key and same pending order on refresh', async ({ page }) => {
  test.setTimeout(60000)
  await setup(page); await scenario(page, 'timeout'); await connect(page); const lost = page.waitForEvent('requestfailed', { predicate: (r) => r.url().endsWith('/api/orders') && r.method() === 'POST', timeout: 10000 }); await page.getByRole('button', { name: 'Confirmar compra' }).click(); await expect(page.getByRole('heading', { name: 'Pedido pendente' })).toBeVisible({ timeout: 10000 })
  await lost
  const s = (await request(page, '/session')).data, headers = { 'X-Session-Scope': s.scope }, a = (await request(page, '/order-attempt', 'GET', undefined, headers)).data; expect(a.orderId).toBeTruthy(); await page.reload(); expect(new URL(page.url()).pathname).toBe(`/orders/${a.orderId}`); await expect(page.getByRole('heading', { name: 'Pedido pendente' })).toBeVisible()
  const replay = await request(page, '/orders', 'POST', a.payload, { ...headers, 'Idempotency-Key': a.key }); expect(replay.data.id).toBe(a.orderId); await scenario(page, 'confirm', a.orderId); await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible(); await expect(page.getByTestId('cart-badge').first()).toHaveText('0')
})
test('late order read and event cannot affect the next session', async ({ page }) => {
  await setup(page); await scenario(page, 'hold'); await connect(page); const id = await purchase(page)
  const oldScope = (await request(page, '/session')).data.scope
  await request(page, '/__commerce/scenario', 'POST', { action: 'slow', delay: 2000 })
  const read = page.waitForRequest((r) => r.url().endsWith(`/api/orders/${id}`) && r.method() === 'GET')
  await page.getByRole('button', { name: 'Consultar estado do pedido' }).click(); await read
  await request(page, '/__commerce/scenario', 'POST', { action: 'slow', delay: 0 })
  await accountAction(page, 'Trocar usuário'); await login(page, 'bruno'); await page.goto(`/orders/${id}`)
  await expect(page.getByRole('heading', { name: 'Pedido não disponível' })).toBeVisible()
  await scenario(page, 'confirm', id); await scenario(page, 'foreign', id)
  expect((await request(page, `/orders/${id}`, 'GET', undefined, { 'X-Session-Scope': oldScope })).status).toBe(401)
  await expect(page.getByRole('heading', { name: 'Pedido não disponível' })).toBeVisible(); await expect(page.getByTestId('cart-badge').first()).toHaveText('0'); await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toHaveCount(0)
})
