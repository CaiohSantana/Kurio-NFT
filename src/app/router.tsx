import { createRootRoute, createRoute, createRouter, lazyRouteComponent, Link, Outlet } from '@tanstack/react-router'
const IntegrationProof = lazyRouteComponent(() => import('@/proof/IntegrationProof'), 'IntegrationProof')
import { CatalogPage } from '@/features/catalog/CatalogPage'
import { DetailPage } from '@/features/catalog/DetailPage'
import { MarketShell } from '@/features/catalog/MarketShell'
import { validateCatalogSearch, defaultCatalogSearch } from '@/features/catalog/contracts'
const AuthPage = lazyRouteComponent(() => import('@/features/auth/AuthPage'), 'AuthPage')
import { authSearch, safeReturn } from '@/features/auth/contracts'
const CartPage = lazyRouteComponent(() => import('@/features/cart/CartPage'), 'CartPage')
import { RequireSession } from '@/features/auth/RequireSession'
const ProfilePage = lazyRouteComponent(() => import('@/features/profile/ProfilePage'), 'ProfilePage')
const WalletsPage = lazyRouteComponent(() => import('@/features/wallets/WalletsPage'), 'WalletsPage')
const CheckoutPage = lazyRouteComponent(() => import('@/features/checkout/CheckoutPage'), 'CheckoutPage')
const OrderPage = lazyRouteComponent(() => import('@/features/orders/OrderPage'), 'OrderPage')

const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: () => <main className="p-8"><h1>Rota inexistente</h1><Link to="/" search={defaultCatalogSearch} className="underline">Voltar ao início</Link></main>,
})
const preparationRoute = createRoute({ getParentRoute: () => rootRoute, path: '/preparation',
  component: () => <main className="p-8"><h1 className="mb-4 text-2xl font-bold">Kurio · Preparação técnica</h1><Link to="/integration" className="text-primary underline">Abrir prova de integração</Link></main>,
})
const marketRoute = createRoute({ getParentRoute: () => rootRoute, id: 'market', component: MarketShell })
export const catalogRoute = createRoute({ getParentRoute: () => marketRoute, path: '/', validateSearch: validateCatalogSearch, component: CatalogPage })
export const detailRoute = createRoute({ getParentRoute: () => marketRoute, path: '/nfts/$nftId', validateSearch: (raw: Record<string, unknown>) => ({ edition: typeof raw.edition === 'string' && ['unique', 'ten', 'fifty', 'open'].includes(raw.edition) ? raw.edition : 'fifty', quantity: Number.isInteger(Number(raw.quantity)) && Number(raw.quantity) > 0 && Number(raw.quantity) <= 100 ? Number(raw.quantity) : 1 }), component: DetailPage })
const loginRoute = createRoute({ getParentRoute: () => marketRoute, path: '/login', validateSearch: authSearch, component: AuthPage })
const signupRoute = createRoute({ getParentRoute: () => marketRoute, path: '/signup', validateSearch: authSearch, component: () => <AuthPage signup /> })
const cartRoute = createRoute({ getParentRoute: () => marketRoute, path: '/cart', component: CartPage })
const profileRoute = createRoute({ getParentRoute: () => marketRoute, path: '/account/profile', component: () => <RequireSession><ProfilePage /></RequireSession> })
const walletsRoute = createRoute({ getParentRoute: () => marketRoute, path: '/account/wallets', validateSearch: (raw: Record<string, unknown>) => ({ returnTo: safeReturn(raw.returnTo) }), component: () => <RequireSession><WalletsPage /></RequireSession> })
const checkoutRoute = createRoute({ getParentRoute: () => marketRoute, path: '/checkout', component: () => <RequireSession><CheckoutPage /></RequireSession> })
export const orderRoute = createRoute({ getParentRoute: () => marketRoute, path: '/orders/$orderId', component: () => <RequireSession><OrderPage /></RequireSession> })
const proofRoute = createRoute({ getParentRoute: () => rootRoute, path: '/integration', component: IntegrationProof })
export const router = createRouter({ routeTree: rootRoute.addChildren([marketRoute.addChildren([catalogRoute, detailRoute, loginRoute, signupRoute, cartRoute, profileRoute, walletsRoute, checkoutRoute, orderRoute]), preparationRoute, proofRoute]), scrollRestoration: true })
declare module '@tanstack/react-router' { interface Register { router: typeof router } }
