import { expect, test } from '@playwright/test'
import { resetCheckout, setup } from './checkout-support'

for (const width of [390,414,768,1440]) {
  test(`field alignment, fee caption and social separator at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1024 })
    await resetCheckout(page); await setup(page)
    const details=page.locator('.checkout-nfts'); if(await details.getAttribute('open')===null) await details.locator('summary').click()
    const fee = page.locator('.fee-hint')
    await expect(fee).toBeVisible()
    expect(await fee.evaluate(node => { const range=document.createRange(); range.selectNodeContents(node); const text=range.getBoundingClientRect(),block=node.getBoundingClientRect(); return Math.abs((text.left+text.right-block.left-block.right)/2) })).toBeLessThan(1)
    await page.screenshot({ path:`artifacts/final-polish-tax-${width}.png`,fullPage:true,animations:'disabled' })
    expect(await fee.evaluate(node => getComputedStyle(node).textAlign)).toBe('center')
    await page.goto('/account/wallets')
    const form = page.getByRole('form', { name: 'Carteira principal' })
    const address = form.getByRole('textbox', { name: 'Endereço da carteira', exact: true })
    const secondary = form.getByLabel('ENS ou carteira secundária (opcional)', { exact: true })
    await expect(address).toBeVisible(); await expect(secondary).toBeVisible()
    await secondary.fill('reserva.kurio.eth'); await form.getByRole('button', { name:'Salvar carteira' }).click()
    await expect(form.getByRole('status')).toHaveText('Carteira salva.'); await page.reload(); await expect(secondary).toHaveValue('reserva.kurio.eth')
    for (const invalid of [false,true]) {
      if (invalid) { await secondary.fill('x'.repeat(129)); await form.getByRole('button', { name: 'Salvar carteira' }).click(); await expect(secondary).toHaveAttribute('aria-invalid','true') }
      const a = await address.boundingBox(), b = await secondary.boundingBox()
      expect(a!.height).toBe(b!.height)
      if (width >= 640) expect(Math.abs(a!.y-b!.y)).toBeLessThan(1)
    }
    for (const route of ['/login','/signup']) {
      await page.goto(route)
      const separator = page.locator('.auth-social p')
      await expect(separator).toHaveText('Ou continue com')
      const box = await separator.boundingBox(), input = await page.locator('.auth-field input').first().boundingBox()
      if (width >= 640) {
        const modal = await page.locator('dialog[open]').boundingBox()
        expect(box!.width).toBeGreaterThan(input!.width)
        expect(Math.abs(box!.x - (modal!.x + 1))).toBeLessThan(2)
      } else expect(Math.abs(box!.width-input!.width)).toBeLessThan(2)
      await page.locator('.auth-field input').first().focus()
      expect(await page.locator('.auth-field input').first().evaluate(node => getComputedStyle(node).outlineWidth)).toBe('2px')
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth>innerWidth)).toBe(false)
  })
}
