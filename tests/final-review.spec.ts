import { expect, test } from '@playwright/test'
import { connect, purchase, request, resetCheckout, scenario, setup } from './checkout-support'

test.beforeEach(async ({ page }) => resetCheckout(page))

test('Mercado actually scrolls through intermediate positions and keeps the same document', async ({ page }, info) => {
  test.skip(info.project.name === 'chromium-mobile', 'Mercado is the desktop navigation; mobile anchor is covered separately')
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.goto('/?q=Emerald')
  await expect(page.getByTestId('nft-emerald-042')).toBeVisible()
  await page.evaluate(() => { window.name = 'retained-scroll-document' })
  const motion = page.evaluate(async () => { const values: number[] = []; for (let frame = 0; frame < 70; frame++) { await new Promise(requestAnimationFrame); values.push(scrollY) } return values })
  await page.getByRole('link', { name: 'Mercado', exact: true }).click()
  const values = await motion, final = values.at(-1)!
  expect(values.filter((position) => position > 0 && position < final).length).toBeGreaterThan(3)
  expect(await page.evaluate(() => window.name)).toBe('retained-scroll-document')
  await expect(page).toHaveURL(/q=Emerald.*#catalog$/)
  await expect.poll(() => page.locator('#catalog').evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBe(72)
  await page.getByTestId('nft-emerald-042').getByRole('link', { name: 'Ver Emerald Ape #042' }).click()
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click(); await expect(page.getByTestId('cart-badge').first()).toHaveText('1')
  await page.getByRole('link', { name: 'Carrinho, 1 item', exact: true }).filter({ visible: true }).first().click()
  await page.getByRole('link', { name: 'Continuar explorando', exact: true }).click()
  await expect(page).toHaveURL(/q=Emerald.*#catalog$/)
})

test('single price interval keyboard limits and related indicators have real navigation', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('.catalog-results .card-name')).toHaveCount(9)
  const open = page.getByRole('button', { name: 'Abrir filtros' }); if (await open.isVisible()) await open.click()
  const filters = await page.getByRole('dialog', { name: 'Filtros de NFTs' }).isVisible() ? page.getByRole('dialog', { name: 'Filtros de NFTs' }) : page.locator('.catalog-sidebar')
  const min = filters.getByLabel('Preço mínimo'), max = filters.getByLabel('Preço máximo')
  const first = await min.boundingBox(), second = await max.boundingBox()
  expect(first!.y).toBe(second!.y); expect(first!.width).toBe(second!.width)
  await min.focus(); await page.keyboard.press('ArrowRight'); await expect(min).toHaveValue('0.03')
  await max.focus(); await page.keyboard.press('Home'); await expect(max).toHaveValue('0.03')
  await filters.getByRole('button', { name: 'Aplicar', exact: true }).click()
  if (await page.getByRole('button', { name: 'Ver resultados' }).isVisible()) await page.getByRole('button', { name: 'Ver resultados' }).click()
  expect(new URL(page.url()).searchParams.get('minPrice')).toBe('"0.03"'); expect(new URL(page.url()).searchParams.get('maxPrice')).toBe('"0.03"')
  await page.goto('/nfts/emerald-042'); await expect(page.locator('.related .card-name')).toHaveCount(5)
  const initial = await page.locator('.related .card-name').allTextContents()
  const dots = page.getByRole('navigation', { name: 'Grupos de Mais desta coleção' })
  await dots.getByRole('button').first().click(); await expect(dots.getByRole('button').first()).toHaveAttribute('aria-current', 'page')
  expect(await page.locator('.related .card-name').allTextContents()).not.toEqual(initial)
  await page.keyboard.press('ArrowRight'); await expect(dots.getByRole('button').nth(1)).toBeFocused()
})

test('mobile 414 catalogue to receipt, quantity keyboard, contextual connection and pending recovery', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium-mobile', 'Additional Figma mobile viewport')
  await page.setViewportSize({ width: 414, height: 896 }); await setup(page)
  await page.goto('/cart'); const row = page.getByTestId('cart-emerald-042:ten')
  await expect(row).toContainText('Edição: 1/10')
  await row.getByRole('spinbutton').fill('3'); await row.getByRole('button', { name: 'Atualizar quantidade' }).click()
  await expect(page.getByTestId('cart-total')).toHaveText('3.586 ETH')
  await page.getByRole('link', { name: 'Continuar explorando', exact: true }).filter({ visible: true }).last().click()
  await expect(page).toHaveURL(/#catalog$/)
  await page.goto('/cart'); await page.getByRole('button', { name: 'Conectar e finalizar' }).click()
  await expect(page.getByRole('button', { name: 'Conectar carteira', exact: true })).toHaveCount(0)
  await scenario(page, 'hold'); await connect(page); const id = await purchase(page)
  await page.goto('/checkout'); await expect(page).toHaveURL(new RegExp(`/orders/${id}$`))
  await page.reload(); await expect(page.getByRole('heading', { name: 'Pedido pendente' })).toBeVisible()
  await scenario(page, 'confirm', id); await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible()
  await expect(page.getByTestId('receipt-total')).toHaveText('3.586 ETH')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('ENS full value and profile identity stay correctly bound in checkout', async ({ page }) => {
  await setup(page); await page.getByRole('textbox', { name: 'Nome do perfil', exact: true }).fill('ana_updated')
  await expect(page.getByRole('textbox', { name: 'Nome de usuário', exact: true })).toHaveValue('ana_updated')
  await page.getByLabel(/^Nome ENS/).fill('ana.kurio')
  await connect(page); const id = await purchase(page)
  const session = (await request(page, '/session')).data
  const order = (await request(page, `/orders/${id}`, 'GET', undefined, { 'X-Session-Scope': session.scope })).data
  expect(order.collector.username).toBe('ana_updated'); expect(order.collector.nickname).toBe('ana-wallet'); expect(order.collector.ens).toBe('ana.kurio.eth')
})
