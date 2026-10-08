import { createRootRoute, createRoute, createRouter, Link, Outlet } from '@tanstack/react-router'
import { IntegrationProof } from '@/proof/IntegrationProof'

const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: () => <main className="p-8"><h1>Rota inexistente</h1><Link to="/integration" className="underline">Voltar à prova</Link></main>,
})
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/',
  component: () => <main className="p-8"><h1 className="mb-4 text-2xl font-bold">Kurio · Preparação técnica</h1><Link to="/integration" className="text-primary underline">Abrir prova de integração</Link></main>,
})
const proofRoute = createRoute({ getParentRoute: () => rootRoute, path: '/integration', component: IntegrationProof })
export const router = createRouter({ routeTree: rootRoute.addChildren([homeRoute, proofRoute]) })
declare module '@tanstack/react-router' { interface Register { router: typeof router } }
