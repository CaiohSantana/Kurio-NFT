import { Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import type { Nft } from './contracts'
import { useUnavailable } from './MarketShell'
export function NftCard({ nft }: { nft: Nft }) {
  const unavailable = useUnavailable()
  return <article className="nft-card" data-testid={`nft-${nft.id}`} data-version={nft.version}>
    <div className="card-art"><Link to="/nfts/$nftId" params={{ nftId: nft.id }} aria-label={`Ver ${nft.name}`}><img src={nft.image} alt={nft.name} width="250" height="250" loading="lazy" /></Link>{nft.rare && <span className="rare-badge">RARO</span>}<button className="card-favorite" aria-label={`Favoritar ${nft.name}`} onClick={() => unavailable('Favoritos')}><Heart size={18} /></button></div>
    <Link className="card-name" to="/nfts/$nftId" params={{ nftId: nft.id }}>{nft.name}</Link><p className="card-price">{nft.priceEth} ETH {nft.previousPrice && <del>{nft.previousPrice} ETH</del>}</p>
  </article>
}
