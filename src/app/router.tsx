import { createRootRoute, createRoute, createRouter, Link, Outlet } from '@tanstack/react-router'
import { IntegrationProof } from '@/proof/IntegrationProof'
import { CatalogPage } from '@/features/catalog/CatalogPage'
import { DetailPage } from '@/features/catalog/DetailPage'
import { MarketShell } from '@/features/catalog/MarketShell'
import { validateCatalogSearch } from '@/features/catalog/contracts'

const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: () => <main className="p-8"><h1>Rota inexistente</h1><Link to="/integration" className="underline">Voltar à prova</Link></main>,
})
const preparationRoute = createRoute({ getParentRoute: () => rootRoute, path: '/preparation',
  component: () => <main className="p-8"><h1 className="mb-4 text-2xl font-bold">Kurio · Preparação técnica</h1><Link to="/integration" className="text-primary underline">Abrir prova de integração</Link></main>,
})
const marketRoute = createRoute({ getParentRoute: () => rootRoute, id: 'market', component: MarketShell })
export const catalogRoute = createRoute({ getParentRoute: () => marketRoute, path: '/', validateSearch: validateCatalogSearch, component: CatalogPage })
export const detailRoute = createRoute({ getParentRoute: () => marketRoute, path: '/nfts/$nftId', component: DetailPage })
const proofRoute = createRoute({ getParentRoute: () => rootRoute, path: '/integration', component: IntegrationProof })
export const router = createRouter({ routeTree: rootRoute.addChildren([marketRoute.addChildren([catalogRoute, detailRoute]), preparationRoute, proofRoute]), scrollRestoration: true })
declare module '@tanstack/react-router' { interface Register { router: typeof router } }
