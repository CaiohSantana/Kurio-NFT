import { useState } from 'react'
import type { Nft } from './contracts'
import { NftCard } from './NftCard'
import { CarouselIndicators } from './CarouselIndicators'

export function RelatedNfts({ title, items }: { title: string; items: Nft[] }) {
  const [group, setGroup] = useState(1)
  if (!items.length) return null
  const starts = [Math.max(0, items.length - 5), 0, Math.min(2, Math.max(0, items.length - 5))]
  const visible = items.slice(starts[group], starts[group] + 5)
  return <section className="related"><h2>{title}</h2><div className="related-items">{visible.map((item) => <NftCard nft={item} key={item.id} />)}</div><CarouselIndicators label={`Grupos de ${title}`} labels={starts.map((_,index) => `Grupo ${index + 1} de ${title}`)} active={group} onChange={setGroup} /></section>
}
