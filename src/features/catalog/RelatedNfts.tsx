import { useState } from 'react'
import type { Nft } from './contracts'
import { NftCard } from './NftCard'

export function RelatedNfts({ title, items }: { title: string; items: Nft[] }) {
  const [group, setGroup] = useState(1)
  if (!items.length) return null
  const starts = [Math.max(0, items.length - 5), 0, Math.min(2, Math.max(0, items.length - 5))]
  const visible = items.slice(starts[group], starts[group] + 5)
  return <section className="related"><h2>{title}</h2><div className="related-items">{visible.map((item) => <NftCard nft={item} key={item.id} />)}</div><nav className="carousel-indicators" aria-label={`Grupos de ${title}`} onKeyDown={(event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); const next = (group + (event.key === 'ArrowRight' ? 1 : 2)) % 3; setGroup(next); event.currentTarget.querySelectorAll('button')[next]?.focus() }
  }}>{starts.map((_, index) => <button key={index} type="button" aria-label={`Grupo ${index + 1} de ${title}`} aria-current={group === index ? 'page' : undefined} onClick={() => setGroup(index)}><span /></button>)}</nav><p className="sr-only" role="status">Grupo {group + 1} de 3</p></section>
}
