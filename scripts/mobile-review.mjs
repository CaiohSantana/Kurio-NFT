/* global process, document, innerWidth, fetch, console, getComputedStyle */
import { chromium, expect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const phase = process.argv[2] ?? 'after'
const base = process.env.REVIEW_URL ?? 'http://127.0.0.1:4176'
const directory = `docs/evidence/mobile-review/${phase}`
await mkdir(directory, { recursive: true })
const browser = await chromium.launch(), results = []
try {
  for (const [width,height] of [[390,844],[414,896],[440,956]]) {
    const page = await browser.newPage({ viewport: { width,height }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
    await page.goto(`${base}/preparation`)
    await page.getByRole('link', { name: 'Abrir prova de integração' }).waitFor()
    const api = (path, method = 'GET', body, scope) => page.evaluate(async ({path,method,body,scope}) => {
      const response = await fetch(`/api${path}`, { method, headers: { 'Content-Type':'application/json', ...(scope ? {'X-Session-Scope':scope} : {}) }, body: body ? JSON.stringify(body) : undefined })
      if (!response.ok) throw Error(`${path}: ${response.status}`)
      return response.json()
    }, {path,method,body,scope})
    await api('/__scenario/reset','POST')
    const capture = async (name, route, ready) => {
      await page.goto(`${base}${route}`); await page.locator(ready).first().waitFor(); if(name==='checkout') await page.getByTestId('checkout-total').waitFor()
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => { image.loading = 'eager'; return image.decode() })) })
      await page.screenshot({ path:`${directory}/${name}-${width}.png`, animations:'disabled' })
      await page.screenshot({ path:`${directory}/${name}-${width}-full.png`, fullPage:true, animations:'disabled' })
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
      const typography = await page.locator('.card-name,.provider-list label>span:last-child,.auth-social p').evaluateAll(nodes => nodes.slice(0,10).map(node=>({text:node.textContent,weight:getComputedStyle(node).fontWeight,size:getComputedStyle(node).fontSize,line:getComputedStyle(node).lineHeight})))
      results.push({name,width,height,overflow,typography}); expect(overflow).toBe(false)
    }
    await capture('home','/','.catalog-results .card-name')
    await capture('detail','/nfts/emerald-042','.detail-info h1')
    await capture('login','/login','.auth-field input')
    await capture('signup','/signup','.auth-field input')
    const session = await api('/session','POST',{email:'ana@kurio.test',password:'Kurio123!'})
    const profile = await api('/profile','GET',undefined,session.scope)
    for (const [kind,network,provider,digit] of [['primary','Ethereum','MetaMask','1'],['secondary','Polygon','Coinbase','2']]) await api('/wallets','POST',{...profile,kind,network,provider,address:`0x${digit.repeat(40)}`,nickname:kind==='primary'?'Principal':'Reserva',referral:'',secondaryReference:''},session.scope)
    for (const [nftId,editionId,quantity] of [['emerald-042','fifty',1],['violet-314','fifty',1],['ivory-088','ten',2],['golden-207','fifty',2]]) await api('/cart/items','POST',{nftId,editionId,quantity},session.scope)
    await capture('cart','/cart','.cart-row')
    await capture('checkout','/checkout','.provider-list')
    await page.close()
  }
  await writeFile(`${directory}/geometry.json`, JSON.stringify(results,null,2))
  console.log(`${phase}: ${results.length} viewport captures and full-page captures`)
} finally { await browser.close() }
