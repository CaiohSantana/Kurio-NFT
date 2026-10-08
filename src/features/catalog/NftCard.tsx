import { Link } from '@tanstack/react-router'
import type { Nft } from './contracts'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { useCatalogDestination } from './CatalogLink'
export function NftCard({ nft }: { nft: Nft }) {
  const search = useCatalogDestination()
  return <article className="nft-card" data-testid={`nft-${nft.id}`} data-version={nft.version}>
    <div className="card-art"><Link to="/nfts/$nftId" state={{ catalogSearch: search }} search={{ edition: 'fifty', quantity: 1 }} params={{ nftId: nft.id }} aria-label={`Ver ${nft.name}`}><img src={nft.image} srcSet={`${nft.image.replace("-900.webp", "-450.webp")} 450w, ${nft.image} 900w`} sizes="(max-width:639px) 50vw, 250px" alt={nft.name} width="250" height="250" loading="lazy" /></Link>{nft.rare && <span className="rare-badge">RARO</span>}<FavoriteButton id={nft.id} name={nft.name} className="card-favorite" /></div>
    <Link className="card-name" to="/nfts/$nftId" state={{ catalogSearch: search }} search={{ edition: 'fifty', quantity: 1 }} params={{ nftId: nft.id }}>{nft.name}</Link><p className="card-price">{nft.priceEth} ETH {nft.previousPrice && <del>{nft.previousPrice} ETH</del>}</p>
  </article>
}
