import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: 'preload-bootstrap-chunks',
    transformIndexHtml: { order: 'post', handler: (_html, context) => {
      // Fetch in parallel without evaluating socket.io-client before MSW starts.
      const bundle = context.bundle ?? {}, files = new Set<string>()
      const preload = (file: string) => {
        if (files.has(file)) return
        const chunk = bundle[file]
        if (chunk?.type !== 'chunk') return
        files.add(file)
        chunk.imports.forEach(preload)
      }
      Object.values(bundle).forEach(chunk => { if (chunk.type === 'chunk' && chunk.isDynamicEntry && ['browser', 'bootstrap'].includes(chunk.name)) preload(chunk.fileName) })
      return [...files].map(file => ({ tag: 'link', attrs: { rel: 'modulepreload', href: `/${file}` }, injectTo: 'head' as const }))
    } },
  }],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
