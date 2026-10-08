import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/preparation')
  await expect(page.getByRole('link', { name: 'Abrir prova de integração' })).toBeVisible()
  await page.evaluate(() => fetch('/api/__catalog/scenario', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reset' }) }))
})
for (const [name, path] of [['home', '/'], ['detail', '/nfts/emerald-042']]) {
  test(`visual baseline ${name}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator(name === 'home' ? '.catalog-results .card-name' : '.detail-info h1').first()).toBeVisible()
    if (name === 'detail') await expect(page.locator('.related .card-name')).toHaveCount(5)
    await expect(page.locator('.background-loading')).toHaveCount(0)
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((image) => { image.loading = 'eager'; return image.decode() })) })
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true, animations: 'disabled' })
  })
}
