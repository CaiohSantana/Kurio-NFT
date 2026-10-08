import { expect, type Page } from '@playwright/test'

export async function accountAction(page: Page, action: 'Trocar usuário' | 'Encerrar sessão') {
  if (/\/orders\//.test(new URL(page.url()).pathname)) await page.getByRole('dialog').getByRole('button', { name: 'Fechar diálogo' }).click()
  await page.getByRole('button', { name: /^Minha conta:/ }).filter({ visible: true }).click()
  await page.getByRole('dialog', { name: 'Minha conta', exact: true }).getByRole('button', { name: action }).click()
}
export async function expectAccount(page: Page, username: string) { await expect(page.locator(`button[aria-label="Minha conta: ${username}"]`).first()).toBeAttached(); await expect.poll(() => page.evaluate(async () => (await (await fetch('/api/session')).json()).user?.username)).toBe(username) }
