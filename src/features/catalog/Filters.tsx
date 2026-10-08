import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { collections, networks, type CatalogSearch, type CatalogResponse, type Collection, type Network } from './contracts'

export function Filters({ search, facets, change }: { search: CatalogSearch; facets?: CatalogResponse['facets']; change: (patch: Partial<CatalogSearch>) => void }) {
  const [min, setMin] = useState(search.minPrice), [max, setMax] = useState(search.maxPrice)
  const toggleCollection = (value: Collection) => change({ collections: search.collections.includes(value) ? search.collections.filter((c) => c !== value) : [...search.collections, value] })
  const toggleNetwork = (value: Network) => change({ networks: search.networks.includes(value) ? search.networks.filter((n) => n !== value) : [...search.networks, value] })
  return <div className="filters-panel">
    <fieldset><legend>Coleções</legend>{Object.entries(collections).map(([value, label]) => <label className={search.collections.includes(value as Collection) ? 'selected' : ''} key={value}><input type="checkbox" checked={search.collections.includes(value as Collection)} onChange={() => toggleCollection(value as Collection)} /><span>{label}</span><span>({facets?.collections[value as Collection] ?? '—'})</span></label>)}</fieldset>
    <fieldset><legend>Faixa de preço</legend><form onSubmit={(e) => { e.preventDefault(); change({ minPrice: min, maxPrice: max }) }}><div className="price-sliders"><input aria-label="Preço mínimo" type="range" min="0.02" max="12.30" step="0.01" value={min} onChange={(e) => setMin(e.target.value)} /><input aria-label="Preço máximo" type="range" min="0.02" max="12.30" step="0.01" value={max} onChange={(e) => setMax(e.target.value)} /></div><p>Preço: {min} – {max} ETH</p><Button size="sm">Aplicar</Button></form></fieldset>
    <fieldset><legend>Rede</legend>{networks.map((value) => <label key={value} className={search.networks.includes(value) ? 'selected' : ''}><input type="checkbox" checked={search.networks.includes(value)} onChange={() => toggleNetwork(value)} /><span>{value}</span><span>({facets?.networks[value] ?? '—'})</span></label>)}</fieldset>
    <button className="clear-filters" onClick={() => change({ collections: [], networks: [], minPrice: '0.02', maxPrice: '12.30', q: '', tab: 'all' })}>Limpar filtros</button>
  </div>
}
