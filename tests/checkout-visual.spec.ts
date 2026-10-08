import { expect, test } from '@playwright/test'
import { connect, purchase, resetCheckout, setup } from './checkout-support'

test.beforeEach(async ({ page }) => { await resetCheckout(page) })
for (const name of ['checkout', 'receipt']) {
  test(`visual baseline ${name}`, async ({ page }) => {
    await setup(page); await connect(page)
    if (name === 'receipt') {
      await purchase(page)
      await expect(page.getByRole('heading', { name: 'Compra confirmada pela simulação' })).toBeVisible()
      await expect(page.getByTestId('cart-badge').first()).toHaveText('0')
    }
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((image) => { image.loading = 'eager'; return image.decode() })) })
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true, animations: 'disabled',
      mask: name === 'receipt' ? [page.getByTestId('order-id'), page.getByTestId('order-transaction'), page.getByTestId('order-date')] : [],
    })
  })
}
