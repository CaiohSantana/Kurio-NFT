import { expect, test } from '@playwright/test'
import { resetCheckout } from './checkout-support'
import type { CatalogResponse } from '../src/features/catalog/contracts'

for (const width of [390,414,768,1440]) test(`featured API data, all CTAs, keyboard, swipe and stable layout at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width,height:1024 }); await page.emulateMedia({ reducedMotion:'reduce' })
  await resetCheckout(page)
  const response = page.waitForResponse(r => r.url().includes('/api/nfts?') && r.request().method()==='GET')
  await page.goto('/?q=inexistente')
  const data = await (await response).json() as CatalogResponse
  expect(data.items).toHaveLength(0); expect(data.featured).toHaveLength(3)
  const hero = page.getByRole('region', { name:'Destaques de NFTs' })
  const indicators = page.getByRole('navigation', { name:'Escolher destaque' })
  await expect(indicators.getByRole('button')).toHaveCount(3)
  const geometry = await hero.boundingBox()
  const catalogTop = await page.locator('#catalog').evaluate(n=>n.getBoundingClientRect().top)
  for (const [index,nft] of data.featured.entries()) {
    const button=indicators.getByRole('button', { name:`Destaque ${index+1}: ${nft.name}` })
    await button.click(); await expect(button).toHaveAttribute('aria-pressed','true')
    expect((await button.boundingBox())!.width).toBeGreaterThanOrEqual(24)
    await expect(hero.locator('.hero-art>a img')).toHaveAttribute('alt',nft.name)
    expect(await hero.locator('.hero-art>a').evaluate(n=>getComputedStyle(n).animationName)).toBe('none')
    const box=await hero.boundingBox(); expect(box!.height).toBe(geometry!.height); expect(box!.width).toBe(geometry!.width)
    expect(await page.locator('#catalog').evaluate(n=>n.getBoundingClientRect().top)).toBe(catalogTop)
    const cta=hero.getByRole('link', { name:`Explorar ${nft.name}` })
    await cta.click(); await expect(page).toHaveURL(new RegExp(`/nfts/${nft.id}`))
    await expect(page.getByRole('heading', { name:nft.name,exact:true })).toBeVisible()
    await page.goBack(); await expect(indicators).toBeVisible()
  }
  await page.emulateMedia({ reducedMotion:'no-preference' }); await indicators.getByRole('button').nth(1).click()
  expect(await hero.locator('.hero-art>a').evaluate(n=>getComputedStyle(n).animationDuration)).toBe('0.18s')
  await page.emulateMedia({ reducedMotion:'reduce' }); await indicators.getByRole('button').first().click()
  await indicators.getByRole('button').first().focus(); await page.keyboard.press('ArrowRight')
  await expect(indicators.getByRole('button').nth(1)).toBeFocused()
  await expect(indicators.getByRole('button').nth(1)).toHaveAttribute('aria-pressed','true')
  await page.keyboard.press('Home'); await expect(indicators.getByRole('button').first()).toHaveAttribute('aria-pressed','true')
  if(width<640){
    const cdp=await page.context().newCDPSession(page); await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true})
    const art=await hero.locator('.hero-art').boundingBox(); const x=art!.x+art!.width-10,y=art!.y+30
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]})
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-80,y:y+2}]})
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
    await expect(indicators.getByRole('button').nth(1)).toHaveAttribute('aria-pressed','true')
    expect(new URL(page.url()).pathname).toBe('/'); expect(new URL(page.url()).searchParams.get('q')).toBe('inexistente')
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-80,y}]})
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+2}]})
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
    await expect(indicators.getByRole('button').first()).toHaveAttribute('aria-pressed','true')
    await hero.locator('.hero-art>a').focus(); await page.keyboard.press('Enter')
    await expect(page).toHaveURL(new RegExp(`/nfts/${data.featured[0].id}`))
    await cdp.detach()
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false)
})
