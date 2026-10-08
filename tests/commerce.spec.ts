import { expect, test, type Page } from '@playwright/test'

async function api(page: Page, path: string, method = 'GET', body?: unknown, scope?: string) {
  return page.evaluate(async ({ path, method, body, scope }) => {
    const response = await fetch(`/api${path}`, { method, headers: { 'Content-Type': 'application/json', ...(scope ? { 'X-Session-Scope': scope } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) })
    return { status: response.status, data: await response.json(), handler: response.headers.get('X-Mock-Handler') }
  }, { path, method, body, scope })
}
async function scenario(page: Page, action: string, target?: string, delay?: number) { expect((await api(page, '/__commerce/scenario', 'POST', { action, target, delay })).status).toBe(200) }
async function login(page: Page, username = 'ana') {
  await page.getByLabel('E-mail', { exact: true }).fill(`${username}@kurio.test`)
  await page.getByLabel('Senha', { exact: true }).fill('Kurio123!')
  await page.locator('.auth-form').getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByText(`Sessão: ${username}`, { exact: true })).toBeAttached()
}
async function add(page: Page, edition = 'fifty', quantity = 1, id = 'emerald-042') {
  await page.goto(`/nfts/${id}?edition=${edition}&quantity=${quantity}`)
  await expect(page.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeEnabled()
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await expect(page.getByText('Item adicionado ao carrinho.', { exact: false })).toBeVisible()
}
const row = (page: Page, edition = 'fifty') => page.getByTestId(`cart-emerald-042:${edition}`)
test.beforeEach(async ({ page }) => {
  await page.goto('/preparation')
  await expect(page.getByRole('link', { name: 'Abrir prova de integração' })).toBeVisible()
  await scenario(page, 'reset')
  expect((await api(page, '/__catalog/scenario', 'POST', { action: 'reset' })).status).toBe(200)
})

test('signup validation, conflict, session refresh and hashed persistence', async ({ page }) => {
  await page.goto('/signup?returnTo=/nfts/emerald-042')
  await page.getByLabel('Nome de usuário', { exact: true }).fill('nova')
  await page.getByLabel('E-mail', { exact: true }).fill('nova@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('Nova123!')
  await page.getByLabel('Confirmar senha').fill('Diferente123!')
  await page.getByRole('button', { name: 'Criar perfil', exact: true }).click()
  await expect(page.getByText('As senhas não coincidem.')).toBeVisible()
  await page.getByLabel('Confirmar senha').fill('Nova123!')
  const registered = page.waitForResponse((r) => r.url().endsWith('/api/accounts') && r.status() === 200)
  await page.getByRole('button', { name: 'Criar perfil', exact: true }).click()
  expect((await registered).headers()['x-mock-handler']).toBe('signup')
  await expect(page).toHaveURL(/\/nfts\/emerald-042/)
  await page.reload(); await expect(page.getByText('Sessão: nova')).toBeAttached()
  const stored = await page.evaluate(() => localStorage.getItem('kurio-commerce-v1')!)
  expect(stored).not.toContain('Nova123!'); expect(stored).not.toContain('Kurio123!'); expect(stored).not.toContain('Diferente123!')
  await page.getByRole('button', { name: 'Encerrar sessão' }).click(); await expect(page.getByText(/^Sessão:/)).toHaveCount(0)
  await page.goto('/signup')
  await page.getByLabel('Nome de usuário', { exact: true }).fill('outra')
  await page.getByLabel('E-mail', { exact: true }).fill('nova@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('Nova123!'); await page.getByLabel('Confirmar senha').fill('Nova123!')
  await page.getByRole('button', { name: 'Criar perfil', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('já cadastrado')
  await page.goto('/login?returnTo=/cart')
  await page.getByLabel('E-mail', { exact: true }).fill('nova@kurio.test'); await page.getByLabel('Senha', { exact: true }).fill('Nova123!')
  await page.locator('.auth-form').getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/cart$/)
})

test('invalid credentials, auxiliary actions and safe return URL', async ({ page }) => {
  await page.goto('/login?returnTo=https://example.com')
  await page.getByLabel('E-mail', { exact: true }).fill('ana@kurio.test'); await page.getByLabel('Senha', { exact: true }).fill('Invalida123!')
  await page.locator('.auth-form').getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('E-mail ou senha inválidos')
  await page.getByRole('button', { name: 'Mostrar senha' }).click(); await expect(page.getByLabel('Senha', { exact: true })).toHaveAttribute('type', 'text')
  await page.getByRole('button', { name: 'Continuar com Google' }).click(); await expect(page.getByRole('status').filter({ hasText: 'Nenhuma sessão' })).toBeVisible()
  expect((await api(page, '/session')).data.user).toBeNull()
  await page.getByRole('button', { name: 'Esqueceu a senha?' }).click(); await expect(page.getByText(/Recuperação de senha não disponível/)).toBeVisible()
  await login(page); await expect(page).toHaveURL(/\/(\?.*)?$/)
})

test('favorite login intent preserves selection, refresh and optimistic rollback', async ({ page }) => {
  await page.goto('/nfts/emerald-042?edition=ten&quantity=3')
  await page.getByRole('button', { name: 'Favoritar Emerald Ape #042', exact: true }).first().click()
  await expect(page).toHaveURL(/\/login/)
  await login(page)
  await expect(page).toHaveURL(/edition=ten.*quantity=3/)
  await expect(page.getByLabel('Qtd.', { exact: true })).toHaveValue('3')
  const button = page.getByRole('button', { name: 'Desfavoritar Emerald Ape #042', exact: true }).first()
  await expect(button).toHaveAttribute('aria-pressed', 'true')
  await page.reload(); await expect(button).toBeEnabled()
  await scenario(page, 'slow', undefined, 1200); await scenario(page, 'fail', 'favorites')
  await button.click()
  await expect(page.getByRole('button', { name: 'Favoritar Emerald Ape #042', exact: true }).first()).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('alert').filter({ hasText: 'Falha transitória' })).toBeVisible()
  await expect(button).toHaveAttribute('aria-pressed', 'true')
  const session = (await api(page, '/session')).data
  expect((await api(page, '/favorites', 'GET', undefined, session.scope)).data).toEqual(['emerald-042'])
  await scenario(page, 'slow', undefined, 200); await scenario(page, 'expire')
  await button.click(); await expect(page).toHaveURL(/favoriteMode=remove/)
  await login(page)
  await expect(page.getByRole('button', { name: 'Favoritar Emerald Ape #042', exact: true }).first()).toBeEnabled()
  const resumed = (await api(page, '/session')).data
  expect((await api(page, '/favorites', 'GET', undefined, resumed.scope)).data).toEqual([])
})

test('visitor cart editions, persistence, quantity limits, removal and empty', async ({ page }) => {
  await add(page, 'ten', 2); await add(page, 'fifty', 3)
  await page.goto('/cart'); await expect(row(page, 'ten')).toBeVisible(); await expect(row(page)).toBeVisible()
  await expect(page.getByTestId('subtotal')).toHaveText('5.95 ETH'); await expect(page.getByTestId('cart-total')).toHaveText('5.966 ETH')
  await page.reload(); await expect(row(page, 'ten').getByRole('spinbutton')).toHaveValue('2')
  await row(page, 'ten').getByRole('spinbutton').fill('5'); await expect(row(page, 'ten').getByRole('button', { name: 'Atualizar quantidade' })).toBeDisabled()
  await row(page, 'ten').getByRole('spinbutton').fill('1.5'); await expect(row(page, 'ten').getByRole('alert')).toContainText('Quantidade inteira')
  await row(page, 'ten').getByRole('spinbutton').fill('4'); await row(page, 'ten').getByRole('button', { name: 'Atualizar quantidade' }).click()
  await expect(row(page, 'ten').getByRole('spinbutton')).toHaveValue('4')
  await expect(row(page, 'ten').getByRole('button', { name: /^Aumentar/ })).toBeDisabled()
  const s = (await api(page, '/session')).data
  expect((await api(page, '/cart/items', 'POST', { nftId: 'emerald-042', editionId: 'ten', quantity: 1 }, s.scope)).status).toBe(409)
  await row(page, 'ten').getByRole('button', { name: /^Remover/ }).click(); await expect(row(page, 'ten')).toHaveCount(0)
  await row(page).getByRole('button', { name: /^Remover/ }).click(); await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible()
})

test('visitor merge happens once, logout and switch isolate private carts and favorites', async ({ page }) => {
  await add(page, 'ten', 2); await page.goto('/cart'); await page.getByRole('link', { name: 'Entrar para conciliar carrinho' }).click(); await login(page)
  await expect(row(page, 'ten').getByRole('spinbutton')).toHaveValue('2')
  const replay = await api(page, '/session', 'POST', { email: 'ana@kurio.test', password: 'Kurio123!' })
  expect(replay.status).toBe(200)
  await page.reload(); await expect(row(page, 'ten').getByRole('spinbutton')).toHaveValue('2')
  await page.getByRole('button', { name: 'Encerrar sessão' }).click(); await expect(page.getByText(/^Sessão:/)).toHaveCount(0)
  await page.goto('/cart'); await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible()
  await add(page, 'ten', 3); await page.goto('/cart'); await page.getByRole('link', { name: 'Entrar para conciliar carrinho' }).click(); await login(page)
  await expect(row(page, 'ten').getByRole('spinbutton')).toHaveValue('5')
  await expect(page.getByRole('alert').filter({ hasText: 'Item preservado; ajuste' })).toBeVisible()
  await row(page, 'ten').getByRole('button', { name: /^Diminuir/ }).click(); await expect(row(page, 'ten').getByRole('spinbutton')).toHaveValue('4')
  await page.getByRole('button', { name: 'Trocar usuário' }).click(); await login(page, 'bruno')
  await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible()
  await page.goto('/nfts/emerald-042'); const favorite = page.getByRole('button', { name: 'Favoritar Emerald Ape #042', exact: true }).first(); await expect(favorite).toBeEnabled(); await favorite.click()
  await expect(page.getByRole('button', { name: 'Desfavoritar Emerald Ape #042', exact: true }).first()).toBeEnabled()
  await page.getByRole('button', { name: 'Trocar usuário' }).click(); await login(page)
  await expect(page.getByRole('button', { name: 'Favoritar Emerald Ape #042', exact: true }).first()).toBeEnabled()
  await page.goto('/cart'); await expect(row(page, 'ten').getByRole('spinbutton')).toHaveValue('4')
})

test('expired session resumes cart, rejects old identity and refresh retains private cart', async ({ page }) => {
  await page.goto('/login?returnTo=/cart'); await login(page); await add(page, 'ten', 2); await page.goto('/cart'); await expect(row(page, 'ten')).toBeVisible()
  const old = (await api(page, '/session')).data.scope
  await scenario(page, 'expire')
  await row(page, 'ten').getByRole('button', { name: /^Aumentar/ }).click()
  await expect(page).toHaveURL(/\/login/); await login(page)
  await expect(page).toHaveURL(/\/cart$/); await expect(row(page, 'ten').getByRole('spinbutton')).toHaveValue('2')
  expect((await api(page, '/favorites', 'GET', undefined, old)).status).toBe(401)
  await page.reload(); await expect(row(page, 'ten').getByRole('spinbutton')).toHaveValue('2')
  await scenario(page, 'expire'); await page.reload(); await expect(page).toHaveURL(/\/login/)
  await login(page); await expect(row(page, 'ten').getByRole('spinbutton')).toHaveValue('2')
})

test('coupons, exact quote values, failures and summary loading', async ({ page }) => {
  await add(page, 'fifty', 2); await scenario(page, 'slow', undefined, 1200); await page.goto('/cart')
  await expect(page.getByText('Carregando cotação…')).toBeVisible(); await expect(page.getByTestId('subtotal')).toHaveText('2.38 ETH')
  await page.getByLabel('Código promocional').fill('BAD'); await page.getByRole('button', { name: 'Aplicar', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('Cupom inválido')
  await page.getByLabel('Código promocional').fill('DROP2025'); await page.getByRole('button', { name: 'Aplicar', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('Cupom expirado')
  await page.getByLabel('Código promocional').fill('kurio10'); await page.getByRole('button', { name: 'Aplicar', exact: true }).click()
  await expect(page.getByTestId('discount')).toHaveText('0.238 ETH'); await expect(page.getByTestId('cart-total')).toHaveText('2.158 ETH')
  const s = (await api(page, '/session')).data, quote = await api(page, '/quotes', 'POST', {}, s.scope)
  expect(quote.handler).toBe('quote'); expect(quote.data.totalEth).toBe('2.158'); expect(quote.data.lines[0].quantity).toBe(2)
  await page.getByRole('button', { name: 'Remover cupom' }).click(); await expect(page.getByTestId('cart-total')).toHaveText('2.396 ETH')
  await scenario(page, 'fail', 'quote'); await page.reload(); await expect(page.getByRole('alert')).toContainText('Falha transitória')
  await page.getByRole('button', { name: 'Tentar novamente' }).click(); await expect(page.getByTestId('cart-total')).toHaveText('2.396 ETH')
  await scenario(page, 'fail', 'all'); await scenario(page, 'reset')
  await page.reload(); await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible()
})

test('Socket.IO recotates price, duplicate/old, outage and unavailable items remain', async ({ page }) => {
  await add(page, 'ten', 2); await page.goto('/cart'); await expect(page.getByTestId('cart-total')).toHaveText('2.396 ETH')
  const scenarioNft = async (action: string) => expect((await api(page, '/__catalog/scenario', 'POST', { action })).status).toBe(200)
  await scenarioNft('change'); await expect(page.getByTestId('cart-total')).toHaveText('2.596 ETH')
  await expect(page.getByText('Preço ou disponibilidade atualizado. Confira os dados antes de continuar.', { exact: true }).last()).toBeVisible()
  await scenarioNft('duplicate'); await scenarioNft('old'); await expect(page.getByTestId('cart-total')).toHaveText('2.596 ETH')
  await scenarioNft('disconnect'); await scenarioNft('change'); await expect(page.getByTestId('cart-total')).toHaveText('2.796 ETH')
  await scenarioNft('sold-out'); await expect(row(page, 'ten')).toBeVisible(); await expect(page.getByRole('alert').filter({ hasText: 'edição esgotada' }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Conectar e finalizar' })).toBeDisabled()
  await page.reload(); await expect(row(page, 'ten')).toBeVisible()
})

test('late private mutation cannot update another session; sockets clean up', async ({ page }) => {
  await page.goto('/login?returnTo=/nfts/emerald-042'); await login(page)
  const old = (await api(page, '/session')).data.scope
  await scenario(page, 'slow', undefined, 1800)
  const requested = page.waitForRequest((r) => r.url().endsWith('/api/favorites/emerald-042') && r.method() === 'PUT')
  const rejected = page.waitForResponse((r) => r.url().endsWith('/api/favorites/emerald-042') && r.request().method() === 'PUT' && r.status() === 401)
  await page.getByRole('button', { name: 'Favoritar Emerald Ape #042', exact: true }).first().click(); await requested
  await expect(page.getByRole('button', { name: 'Desfavoritar Emerald Ape #042', exact: true }).first()).toBeDisabled()
  // API scenario changes latency only; the already pending write keeps its delay.
  await scenario(page, 'slow', undefined, 0)
  await page.getByRole('button', { name: 'Trocar usuário' }).click(); await login(page, 'bruno')
  await expect(page.getByRole('button', { name: 'Favoritar Emerald Ape #042', exact: true }).first()).toBeEnabled()
  expect((await (await rejected).json()).code).toBe('SESSION_EXPIRED')
  const current = (await api(page, '/session')).data
  expect((await api(page, '/favorites', 'GET', undefined, current.scope)).data).toEqual([])
  expect((await api(page, '/cart/items', 'POST', { nftId: 'emerald-042', editionId: 'ten', quantity: 1 }, old)).status).toBe(401)
  await expect.poll(async () => (await api(page, '/__proof/diagnostics')).data.activeConnections).toBe(1)
  await page.getByRole('button', { name: 'Encerrar sessão' }).click(); await expect(page.getByText(/^Sessão:/)).toHaveCount(0)
  await page.goto('/preparation'); await expect(page.getByRole('link', { name: 'Abrir prova de integração' })).toBeVisible(); await expect.poll(async () => (await api(page, '/__proof/diagnostics')).data.activeConnections).toBe(0)
})

test('keyboard dialog focus, accessible labels, responsive cart and pending checkout', async ({ page }, testInfo) => {
  await page.goto('/login'); await expect(page.getByLabel('E-mail', { exact: true })).toBeVisible()
  if (testInfo.project.name !== 'chromium-mobile') {
    await expect(page.getByRole('dialog', { name: 'Entrar', exact: true })).toBeVisible(); await page.keyboard.press('Escape'); await expect(page).toHaveURL(/\/(\?.*)?$/)
  }
  await add(page); await page.goto('/cart'); await expect(row(page)).toBeVisible()
  await page.getByLabel('Código promocional').focus(); await expect(page.getByLabel('Código promocional')).toBeFocused(); await page.keyboard.press('Tab'); await expect(page.getByRole('button', { name: 'Aplicar', exact: true })).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Conectar e finalizar' }).click(); await expect(page.getByRole('dialog')).toContainText('Nenhuma operação foi realizada')
  await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'Conectar e finalizar' })).toBeFocused()
})
