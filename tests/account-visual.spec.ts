import { expect, test } from '@playwright/test'
import { resetCheckout, setup } from './checkout-support'

test.beforeEach(async ({ page }) => resetCheckout(page))
for (const name of ['profile', 'wallets']) {
  test(`visual baseline ${name}`, async ({ page }) => {
    await setup(page); await page.goto(`/account/${name}`)
    await expect(page.getByRole('form', { name: name === 'profile' ? 'Dados do perfil' : 'Carteira principal' })).toBeVisible()
    await expect(page.getByTestId('cart-badge').first()).toHaveText('2')
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((image) => image.decode())) })
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true, animations: 'disabled' })
  })
}
