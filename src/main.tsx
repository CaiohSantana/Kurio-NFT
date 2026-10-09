import './styles.css'
import './mobile-reference.css'

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
  const { mount } = await import('./app/bootstrap')
  mount(root)
}

void start().catch(() => {
  document.getElementById('root')!.textContent = 'Falha ao iniciar MSW. Verifique o worker e use HTTPS ou localhost.'
})
