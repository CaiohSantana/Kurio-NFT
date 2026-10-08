import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/preparation')
  await expect(page.getByRole('link', { name: 'Abrir prova de integração' })).toBeVisible()
  await page.evaluate(() => fetch('/api/__catalog/scenario', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reset' }) }))
  await page.evaluate(() => fetch('/api/__commerce/scenario', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reset' }) }))
})
for (const [name, path] of [['home', '/'], ['detail', '/nfts/emerald-042']]) {
  test(`visual baseline ${name}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByTestId('cart-badge').first()).toHaveText('0')
    await expect(page.locator(name === 'home' ? '.catalog-results .card-name' : '.detail-info h1').first()).toBeVisible()
    if (name === 'detail') await expect(page.locator('.related .card-name')).toHaveCount(5)
    await expect(page.locator('.background-loading')).toHaveCount(0)
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((image) => { image.loading = 'eager'; return image.decode() })) })
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true, animations: 'disabled' })
  })
}
for (const name of ['login', 'signup', 'cart']) {
  test(`visual baseline ${name}`, async ({ page }) => {
    if (name === 'cart') {
      await page.goto('/nfts/emerald-042?edition=fifty&quantity=2')
      await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
      await expect(page.getByText('Item adicionado ao carrinho.', { exact: false })).toBeVisible()
    }
    await page.goto(`/${name}`)
    await expect(page.getByTestId('cart-badge').first()).toHaveText(name === 'cart' ? '2' : '0')
    if (name === 'cart') await expect(page.getByTestId('cart-total')).toHaveText('2.396 ETH')
    else await expect(page.getByLabel('E-mail', { exact: true })).toBeVisible()
    if (name === 'cart' || name !== 'cart' && test.info().project.name !== 'chromium-mobile') await expect(page.locator('.card-name').first()).toBeAttached()
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((image) => { image.loading = 'eager'; return image.decode() })) })
    // Auth is a desktop dialog, mobile page; capture the viewport to review the overlay.
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: name === 'cart', animations: 'disabled' })
  })
}
