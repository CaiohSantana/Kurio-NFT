import { Link, useLocation } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { validateCatalogSearch, type CatalogSearch } from './contracts'

declare module '@tanstack/history' { interface HistoryState { catalogSearch?: CatalogSearch } }
export function useCatalogDestination() {
  const location = useLocation()
  return validateCatalogSearch({ ...(location.pathname === '/' ? location.search : location.state.catalogSearch ?? {}) })
}
export function scrollToCatalog() {
  document.getElementById('catalog')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
}
export function CatalogLink({ children, className, ariaLabel }: { children: ReactNode; className?: string; ariaLabel?: string }) {
  const search = useCatalogDestination(), location = useLocation()
  return <Link to="/" search={search} hash="catalog" activeOptions={{ includeHash: true }} resetScroll={false} hashScrollIntoView={false} className={className} aria-label={ariaLabel} onClick={(event) => {
    if (event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && location.pathname === '/' && location.hash === 'catalog') { event.preventDefault(); scrollToCatalog() }
  }}>{children}</Link>
}
