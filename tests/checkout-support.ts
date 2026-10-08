import { expectAccount } from './session-support'
import { expect, type Page } from '@playwright/test'
export async function request(page: Page, path: string, method = 'GET', body?: unknown, headers: Record<string, string> = {}) {
  return page.evaluate(async ({ path, method, body, headers }) => { const response = await fetch(`/api${path}`, { method, headers: { 'Content-Type': 'application/json', ...headers }, body: body === undefined ? undefined : JSON.stringify(body) }); return { status: response.status, data: await response.json() } }, { path, method, body, headers })
}
export async function scenario(page: Page, action: string, id?: string) { expect((await request(page, '/__checkout/scenario', 'POST', { action, id })).status).toBe(200) }
export async function nftScenario(page: Page, action: string) { expect((await request(page, '/__catalog/scenario', 'POST', { action, id: 'emerald-042' })).status).toBe(200) }
export async function readOrder(page: Page, id: string) { await expect(page.locator('.receipt-card')).toBeVisible(); const session = (await request(page, '/session')).data; return (await request(page, `/orders/${id}`, 'GET', undefined, { 'X-Session-Scope': session.scope })).data }
export async function revealCollector(page: Page) { const details = page.locator('.checkout-collector'); if (await details.getAttribute('open') === null) await details.locator('summary').click() }
export async function login(page: Page, username = 'ana') { await page.getByLabel('E-mail', { exact: true }).fill(`${username}@kurio.test`); await page.getByLabel('Senha', { exact: true }).fill('Kurio123!'); await page.locator('.auth-form').getByRole('button', { name: 'Entrar', exact: true }).click(); await expectAccount(page, username) }
export async function setup(page: Page, quantity = 2) {
  await page.goto(`/nfts/emerald-042?edition=ten&quantity=${quantity}`); await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click(); await expect(page.getByTestId('cart-badge').first()).toHaveText(String(quantity))
  await page.goto('/checkout'); await expect(page).toHaveURL(/\/login/); await login(page)
  await page.getByRole('link', { name: 'Cadastrar carteira e retornar' }).click()
  const primary = page.getByRole('form', { name: 'Carteira principal' })
  await primary.getByLabel('Endereço da carteira').fill('0x' + '1'.repeat(40)); await primary.getByRole('button', { name: 'Salvar carteira' }).click(); await expect(primary.getByRole('status')).toHaveText('Carteira salva.')
  await page.getByRole('button', { name: 'Retomar fluxo' }).click(); await expect(page.getByTestId('checkout-total')).toHaveText(`${quantity === 2 ? '2.396' : '1.206'} ETH`)
  await revealCollector(page)
}
export async function connect(page: Page) { await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click(); await expect(page.getByRole('button', { name: 'Carteira conectada · Gerenciar' })).toBeVisible() }
export async function purchase(page: Page) { await page.getByLabel('Revisei os dados e aceito esta cotação').check(); await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click(); await expect(page).toHaveURL(/\/orders\//); await expect(page.locator('.receipt-card')).toBeVisible(); return new URL(page.url()).pathname.split('/').pop()! }
export async function resetCheckout(page: Page) { await page.goto('/preparation'); await expect(page.getByRole('link', { name: 'Abrir prova de integra\u00e7\u00e3o' })).toBeVisible(); for (const area of ['commerce', 'catalog', 'checkout']) expect((await request(page, `/__${area}/scenario`, 'POST', { action: 'reset' })).status).toBe(200) }
