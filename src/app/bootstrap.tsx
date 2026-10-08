import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'

export function mount(root: HTMLElement) {
  const queryClient = new QueryClient()
  createRoot(root).render(<QueryClientProvider client={queryClient}><RouterProvider router={router} /></QueryClientProvider>)
}
