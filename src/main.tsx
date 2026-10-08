import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import './styles.css'

async function start() {
  const root = document.getElementById('root')!
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'true') {
    root.textContent = 'Esta prova exige VITE_ENABLE_MOCKS=true. Nenhuma API real está configurada.'
    return
  }
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest(request, print) {
    if (new URL(request.url).pathname.startsWith('/api/')) print.error()
  } })
  // engine.io-client captures WebSocket during module evaluation. Import the
  // router (and socket.io-client) only after MSW installs its interceptor.
  const { router } = await import('./app/router')
  const queryClient = new QueryClient()
  createRoot(root).render(<QueryClientProvider client={queryClient}><RouterProvider router={router} /></QueryClientProvider>)
}

void start().catch(() => {
  document.getElementById('root')!.textContent = 'Falha ao iniciar MSW. Verifique o worker e use HTTPS ou localhost.'
})
