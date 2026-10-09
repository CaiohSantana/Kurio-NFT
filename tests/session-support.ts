import { expect, type Page } from '@playwright/test'

export async function accountAction(page: Page, action: 'Trocar usuário' | 'Encerrar sessão') {
  if (/\/orders\//.test(new URL(page.url()).pathname)) await page.getByRole('dialog').getByRole('button', { name: 'Fechar diálogo' }).click()
  const account=page.getByRole('button', {name:/^Minha conta:/}).filter({visible:true})
  if(await account.count()) await account.click()
  else {
    if(await page.getByRole('link',{name:'Voltar ao carrinho',exact:true}).isVisible()) await page.getByRole('link',{name:'Voltar ao carrinho',exact:true}).click()
    const profile=page.getByRole('link',{name:'Perfil',exact:true})
    if(await profile.isVisible()) await profile.click(); else await page.getByRole('link',{name:'Meu perfil',exact:true}).filter({visible:true}).first().click()
  }
  const ended = action === 'Encerrar sessão' ? page.waitForResponse(response => response.url().endsWith('/api/session') && response.request().method() === 'DELETE' && response.status() === 200) : undefined
  await page.getByRole('dialog', { name: 'Minha conta', exact: true }).getByRole('button', { name: action }).click()
  if(ended) { await ended; await expect.poll(() => page.evaluate(async () => (await (await fetch('/api/session')).json()).user)).toBeNull() }
}
export async function expectAccount(page: Page, username: string) { await expect(page.locator(`button[aria-label="Minha conta: ${username}"]`).first()).toBeAttached(); await expect.poll(() => page.evaluate(async () => (await (await fetch('/api/session')).json()).user?.username)).toBe(username) }
