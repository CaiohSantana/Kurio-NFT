/* global process, console, fetch, setTimeout */
import lighthouse from 'lighthouse'
import desktop from 'lighthouse/core/config/desktop-config.js'
import { launch } from 'chrome-launcher'
import { chromium } from '@playwright/test'
import { spawn, execFileSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import os from 'node:os'

const output = process.env.AUDIT_OUTPUT || 'docs/audits/lighthouse'
const profiles = process.env.AUDIT_PROFILE ? [process.env.AUDIT_PROFILE] : ['mobile', 'desktop']
const pages = process.env.AUDIT_PAGE ? [process.env.AUDIT_PAGE] : ['home', 'detail']
const runs = Number(process.env.AUDIT_RUNS || 3)
if (!profiles.every(profile => ['mobile', 'desktop'].includes(profile)) || !pages.every(page => ['home', 'detail'].includes(page)) || !Number.isInteger(runs) || runs < 1) throw Error('Invalid audit profile/page/runs')
const revision = { commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), dirtyAtStart: !!execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim() }
const base = 'http://127.0.0.1:4175'
const preview = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4175', '--strictPort'], { stdio: 'pipe', windowsHide: true })
let serverError = ''
preview.stderr.on('data', data => { serverError += data })
preview.on('error', error => { serverError += error.message })
try {
  for (let i = 0; ; i++) {
    if (preview.exitCode !== null || i > 100) throw Error(`Preview failed: ${serverError}`)
    try { if ((await fetch(base)).ok) break } catch { /* waiting for preview */ }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  await mkdir(output, { recursive: true })
  const results = []
  for (const page of pages) for (const profile of profiles) for (let run = 1; run <= runs; run++) {
    const chrome = await launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless', '--disable-gpu', '--no-first-run'], logLevel: 'silent' })
    try {
      const url = `${base}${page === 'home' ? '/' : '/nfts/emerald-042'}`
      console.log(`Auditing ${page}/${profile} ${run}/${runs}`)
      const result = await lighthouse(url, { port: chrome.port, logLevel: 'error', output: ['html', 'json'], onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] }, profile === 'desktop' ? desktop : undefined)
      if (result.lhr.runtimeError) throw Error(JSON.stringify(result.lhr.runtimeError))
      const name = `${page}-${profile}-${run}`
      await writeFile(`${output}/${name}.html`, result.report[0])
      await writeFile(`${output}/${name}.json`, result.report[1])
      const lhr = result.lhr
      const row = { page, profile, run, url, scores: Object.fromEntries(Object.entries(lhr.categories).map(([key, category]) => [key, Math.round(category.score * 100)])), lcp: lhr.audits['largest-contentful-paint'].numericValue, cls: lhr.audits['cumulative-layout-shift'].numericValue, tbt: lhr.audits['total-blocking-time'].numericValue, settings: lhr.configSettings, lighthouse: lhr.lighthouseVersion, userAgent: lhr.environment.hostUserAgent }
      results.push(row)
      console.log(JSON.stringify({ ...row, settings: undefined }))
    } finally { await chrome.kill() }
  }
  const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
  const medians = pages.flatMap(page => profiles.map(profile => {
    const rows = results.filter(row => row.page === page && row.profile === profile)
    return { page, profile, scores: Object.fromEntries(Object.keys(rows[0].scores).map(category => [category, median(rows.map(row => row.scores[category]))])), lcp: median(rows.map(row => row.lcp)), cls: median(rows.map(row => row.cls)), tbt: median(rows.map(row => row.tbt)) }
  }))
  const summary = { ...revision, generatedAt: new Date().toISOString(), node: process.version, os: `${os.type()} ${os.release()} ${os.arch()}`, cpu: os.cpus()[0].model, memoryGB: Math.round(os.totalmem() / 2 ** 30), cache: 'Fresh temporary Chrome profile for each run; default Lighthouse storage reset; default simulated throttling; standard demo mocks; no prewarming or scenario changes.', medians, results }
  await writeFile(`${output}/summary.json`, JSON.stringify(summary, null, 2))
  await writeFile(`${output}/README.md`, `# Lighthouse\n\nCommit auditado: ${revision.commit}. Dirty no início: ${revision.dirtyAtStart}.\n\n| Página | Perfil | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS | TBT (ms) |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${medians.map(row => `| ${row.page} | ${row.profile} | ${Object.values(row.scores).join(' | ')} | ${Math.round(row.lcp)} | ${row.cls.toFixed(4)} | ${Math.round(row.tbt)} |`).join('\n')}\n\nCada combinação tem ${runs} execuções. HTML/JSON com o mesmo nome identificam cada medição. Ambiente/configurações completos em summary.json e nos relatórios.\n`)
} finally { preview.kill() }
