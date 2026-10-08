import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Modal } from '@/shared/ui/modal'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { catalogOptions } from './api'
import type { CatalogSearch } from './contracts'
import { validateCatalogSearch } from './contracts'
import { Filters } from './Filters'
import { NftCard } from './NftCard'
import { Hero, HomeSections } from './HomeSections'

export function CatalogPage() {
  const search = validateCatalogSearch(useSearch({ strict: false })), navigate = useNavigate({ from: '/' })
  const query = useQuery(catalogOptions(search))
  const [filterOpen, setFilterOpen] = useState(false)
  const change = (patch: Partial<CatalogSearch>) => { void navigate({ search: { ...search, ...patch, page: patch.page ?? 1 } }) }
  return <main>
    <div className="catalog-search-row"><form key={search.q} onSubmit={(e) => { e.preventDefault(); change({ q: String(new FormData(e.currentTarget).get('q') ?? '') }) }}><Search size={22} /><label className="sr-only" htmlFor="catalog-search">Buscar NFTs</label><input id="catalog-search" name="q" defaultValue={search.q} placeholder="Explorar coleções" /><button className="sr-only" type="submit">Buscar</button></form><button className="filter-toggle" aria-label="Abrir filtros" onClick={() => setFilterOpen(true)}><SlidersHorizontal size={22} /></button></div>
    <Hero />
    <section className="catalog-layout" id="catalog" aria-label="Catálogo de NFTs">
      <aside className="catalog-sidebar"><Filters key={`${search.minPrice}:${search.maxPrice}`} search={search} facets={query.data?.facets} change={change} /><div className="featured-banner"><h2>NFT EM DESTAQUE</h2><h3>OFERTA LIMITADA</h3><a href="/nfts/sage-009"><img src="/assets/figma/83794.png" alt="Sage Nomad em destaque" width="310" height="368" /></a></div></aside>
      <div className="catalog-results"><div className="catalog-toolbar"><div className="catalog-tabs" aria-label="Categorias do catálogo">{[['all', 'Todos os NFTs'], ['new', 'Novos lançamentos'], ['trending', 'Em alta']].map(([value, label]) => <button key={value} aria-pressed={search.tab === value} className={search.tab === value ? 'selected' : ''} onClick={() => change({ tab: value as CatalogSearch['tab'] })}>{label}</button>)}</div><label className="sort-control">Ordenar por:<select aria-label="Ordenar NFTs" value={search.sort} onChange={(e) => change({ sort: e.target.value as CatalogSearch['sort'] })}><option value="recent">Listados recentemente</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option></select></label></div>
        {query.isPending ? <div role="status"><span className="sr-only">Carregando catálogo</span><div className="nft-grid">{Array.from({ length: 9 }, (_, i) => <div className="nft-card" key={i}><Skeleton className="card-art proof-skeleton" /><Skeleton className="proof-skeleton mt-3 h-5" /><Skeleton className="proof-skeleton mt-2 h-5 w-1/2" /></div>)}</div></div> : <>
          {query.isError && <div className="query-error" role="alert"><p>Não foi possível carregar o catálogo.</p><Button onClick={() => void query.refetch()}>Tentar novamente</Button></div>}
          {query.data && <>{query.isFetching && <p role="status" className="background-loading">Atualizando catálogo…</p>}<p className="sr-only" role="status">{query.data.total} NFTs encontrados</p>{query.data.items.length ? <div className="nft-grid">{query.data.items.map((nft) => <NftCard nft={nft} key={nft.id} />)}</div> : <div className="empty-state"><h2>Nenhum NFT encontrado</h2><p>Experimente outros filtros ou uma nova busca.</p><Button onClick={() => change({ q: '', collections: [], networks: [], minPrice: '0.02', maxPrice: '12.30', tab: 'all' })}>Limpar busca e filtros</Button></div>}
          <nav className="pagination" aria-label="Paginação"><button disabled={search.page <= 1} aria-label="Página anterior" onClick={() => change({ page: search.page - 1 })}>‹</button>{Array.from({ length: query.data.pages }, (_, i) => <button key={i} aria-label={`Página ${i + 1}`} aria-current={search.page === i + 1 ? 'page' : undefined} onClick={() => change({ page: i + 1 })}>{i + 1}</button>)}<button disabled={search.page >= query.data.pages} aria-label="Próxima página" onClick={() => change({ page: search.page + 1 })}>›</button></nav></>}
        </>}
      </div>
    </section>
    <Modal title="Filtros de NFTs" open={filterOpen} onClose={() => setFilterOpen(false)}><Filters key={`${search.minPrice}:${search.maxPrice}`} search={search} facets={query.data?.facets} change={change} /><Button onClick={() => setFilterOpen(false)}>Ver resultados</Button></Modal>
    <HomeSections />
  </main>
}
