import { Link } from '@tanstack/react-router'
import type { Nft } from './contracts'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
export function NftCard({ nft }: { nft: Nft }) {
  return <article className="nft-card" data-testid={`nft-${nft.id}`} data-version={nft.version}>
    <div className="card-art"><Link to="/nfts/$nftId" search={{ edition: 'fifty', quantity: 1 }} params={{ nftId: nft.id }} aria-label={`Ver ${nft.name}`}><img src={nft.image} alt={nft.name} width="250" height="250" loading="lazy" /></Link>{nft.rare && <span className="rare-badge">RARO</span>}<FavoriteButton id={nft.id} name={nft.name} className="card-favorite" /></div>
    <Link className="card-name" to="/nfts/$nftId" search={{ edition: 'fifty', quantity: 1 }} params={{ nftId: nft.id }}>{nft.name}</Link><p className="card-price">{nft.priceEth} ETH {nft.previousPrice && <del>{nft.previousPrice} ETH</del>}</p>
  </article>
}
