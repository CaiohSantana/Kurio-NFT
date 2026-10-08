import { accountAction, expectAccount } from './session-support'
import { expect, test, type Page } from '@playwright/test'
async function reset(page: Page) {
  await page.goto('/preparation'); await expect(page.getByRole('link', { name: 'Abrir prova de integração' })).toBeVisible()
  await page.evaluate(async () => { for (const area of ['commerce', 'catalog']) await fetch(`/api/__${area}/scenario`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reset' }) }) })
}
async function login(page: Page, name: string) { await page.getByLabel('E-mail', { exact: true }).fill(`${name}@kurio.test`); await page.getByLabel('Senha', { exact: true }).fill('Kurio123!'); await page.locator('.auth-form').getByRole('button', { name: 'Entrar', exact: true }).click(); await expectAccount(page, name) }
async function count(page: Page, value: number) { await expect(page.getByTestId('cart-badge').first()).toHaveText(String(value)); const visible = page.getByRole('link', { name: `Carrinho, ${value} ${value === 1 ? 'item' : 'itens'}`, exact: true }).filter({ visible: true }); if (await visible.count()) await expect(visible.first()).toBeVisible() }
test.beforeEach(async ({ page }) => reset(page))
test('catalog navigation keeps document, DOM, URL filters and history; reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/?q=Emerald&sort=price-desc')
  await expect(page.getByTestId('nft-emerald-042')).toBeVisible()
  await page.evaluate(() => { window.name = 'same-document'; document.getElementById('catalog')!.dataset.retained = 'yes' })
  const market = page.getByRole('link', { name: 'Mercado', exact: true })
  if (await market.isVisible()) await market.click(); else await page.locator('.hero-cta').click()
  await expect(page).toHaveURL(/#catalog$/); await expect(page.locator('#catalog')).toHaveAttribute('data-retained', 'yes')
  await expect.poll(() => page.locator('#catalog').evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(72)
  expect(new URL(page.url()).searchParams.get('q')).toBe('Emerald')
  await page.getByTestId('nft-emerald-042').getByRole('link', { name: 'Ver Emerald Ape #042' }).click()
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042', exact: true })).toBeVisible()
  if (await market.isVisible()) await market.click(); else await page.getByRole('link', { name: 'Voltar ao catálogo' }).click()
  await expect(page).toHaveURL(/q=Emerald.*#catalog$/)
  await expect.poll(() => page.locator('#catalog').evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(72)
  await page.goBack(); await expect(page).toHaveURL(/\/nfts\/emerald-042/)
  await page.goForward(); await expect(page).toHaveURL(/q=Emerald.*#catalog$/)
  await page.reload(); await expect(page.getByTestId('nft-emerald-042')).toBeVisible()
  await expect.poll(() => page.locator('#catalog').evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(72)
})
test('hero and promo anchors scroll smoothly without loading another document', async ({ page }) => {
  await page.goto('/'); await expect(page.getByTestId('nft-emerald-042')).toBeVisible()
  await page.locator('.hero-cta').click(); await expect(page).toHaveURL(/#catalog$/)
  await expect.poll(() => page.locator('#catalog').evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(72)
  await page.locator('.promos a').first().click()
  await expect.poll(() => page.locator('#catalog').evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(72)
})
test('global badge sums quantities outside cart, refresh, merge, logout and account switch', async ({ page }) => {
  await page.goto('/nfts/emerald-042?edition=ten&quantity=2'); await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click(); await count(page, 2)
  await page.goto('/'); await count(page, 2); await page.reload(); await count(page, 2)
  await page.goto('/login?returnTo=/'); await login(page, 'ana'); await count(page, 2)
  await page.goto('/cart'); await page.getByRole('button', { name: 'Aumentar Emerald Ape #042 1/10' }).click(); await count(page, 3)
  await page.goto('/'); await count(page, 3)
  await accountAction(page, 'Trocar usuário'); await login(page, 'bruno'); await count(page, 0)
  await accountAction(page, 'Trocar usuário'); await login(page, 'ana'); await count(page, 3)
  await page.goto('/cart'); await page.getByRole('button', { name: 'Remover Emerald Ape #042 1/10' }).click(); await count(page, 0)
  await accountAction(page, 'Encerrar sessão'); await expect(page.getByRole('button', { name: /^Minha conta:/ })).toHaveCount(0); await count(page, 0)
})
