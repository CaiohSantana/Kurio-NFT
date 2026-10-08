import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { ArrowLeft, Search, ShoppingCart } from 'lucide-react'
import { detailRoute } from '@/app/router'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { Modal } from '@/shared/ui/modal'
import { catalogOptions, detailOptions } from './api'
import { validateCatalogSearch, defaultCatalogSearch, type Nft } from './contracts'
import { useUnavailable } from './MarketShell'
import { NftCard } from './NftCard'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { useCartMutation } from '@/features/cart/api'
import { apiMessage } from '@/features/auth/session'

export function DetailPage() {
  const { nftId } = detailRoute.useParams()
  const selection = detailRoute.useSearch()
  const query = useQuery(detailOptions(nftId))
  const related = useQuery({ ...catalogOptions(validateCatalogSearch({})), enabled: !!query.data })
  if (query.isPending) return <main className="detail-loading" role="status"><p>Carregando NFT…</p><Skeleton className="proof-skeleton" /></main>
  if (!query.data) return <main className="empty-state" role="alert"><h1>{isAxiosError(query.error) && query.error.response?.status === 404 ? 'NFT não encontrado' : 'Não foi possível carregar o NFT'}</h1><Button onClick={() => void query.refetch()}>Tentar novamente</Button><Link to="/" search={defaultCatalogSearch}>Voltar ao catálogo</Link></main>
  const nft = query.data.nft
  return <main>
    {query.isFetching && <p className="background-loading" role="status">Atualizando NFT…</p>}
    {query.isError && <div className="query-error" role="alert">Falha ao atualizar o NFT. <Button onClick={() => void query.refetch()}>Tentar novamente</Button></div>}
    <DetailContent key={`${nft.id}:${selection.edition}`} nft={nft} />
    <section className="related"><h2>Mais desta coleção</h2><div>{related.data?.items.filter((item) => ['cosmic-118', 'violet-314', 'ivory-088', 'golden-207', 'signal-160'].includes(item.id) && item.id !== nft.id).map((item) => <NftCard nft={item} key={item.id} />)}</div></section>
  </main>
}
function DetailContent({ nft }: { nft: Nft }) {
  const [image, setImage] = useState(0), [zoom, setZoom] = useState(false), [tab, setTab] = useState('details')
  const { edition: editionId, quantity: initialQuantity } = detailRoute.useSearch(), navigate = useNavigate({ from: '/nfts/$nftId' }), cart = useCartMutation()
  const [invalidQuantity, setInvalidQuantity] = useState<number | null>(null)
  const quantity = invalidQuantity ?? initialQuantity
  const setQuantity = (value: number) => { setInvalidQuantity(Number.isInteger(value) && value > 0 && value <= 100 ? null : value); if (Number.isInteger(value) && value > 0 && value <= 100) void navigate({ search: { edition: editionId, quantity: value }, replace: true, resetScroll: false }) }
  const chooseEdition = (value: string) => { void navigate({ search: { edition: value, quantity: 1 }, replace: true, resetScroll: false }) }
  const add = (goToCart: boolean) => cart.mutate({ action: 'add', nftId: nft.id, editionId, quantity }, { onSuccess: () => { if (goToCart) void navigate({ to: '/cart' }) } })
  const unavailable = useUnavailable()
  const edition = nft.editions.find((e) => e.id === editionId) ?? nft.editions[0]
  const max = Math.min(edition.available, edition.maxQuantity)
  const valid = Number.isInteger(quantity) && quantity >= 1 && quantity <= max
  return <>
    <div className="detail-mobile-top"><Link to="/" search={defaultCatalogSearch} aria-label="Voltar ao catálogo"><ArrowLeft size={20} /></Link><FavoriteButton id={nft.id} name={nft.name} /></div>
    <p className="breadcrumb"><Link to="/" search={defaultCatalogSearch}>Início</Link> / Mercado</p>
    <section className="detail-top">
      <div className="gallery"><div className="gallery-thumbnails" aria-label="Galeria de imagens">{nft.gallery.map((asset, i) => <button key={i} aria-label={`Imagem ${i + 1}`} aria-pressed={image === i} onClick={() => setImage(i)}><img src={asset} alt="" width="100" height="100" /></button>)}</div><div className="gallery-main"><img src={nft.gallery[image]} alt={nft.name} width="450" height="450" fetchPriority="high" /><button aria-label="Ampliar imagem" onClick={() => setZoom(true)}><Search size={24} /></button></div></div>
      <div className="detail-info"><h1>{nft.name}</h1><div className="detail-price-review"><strong data-testid="detail-price">{nft.priceEth} ETH</strong><span aria-label="Avaliação 4,8 de 5, 19 avaliações"><span className="stars">★★★★★</span><span className="desktop-title">19 avaliações de colecionadores</span><span className="mobile-title">4.8(19)</span></span></div><h2 className="about-label">Sobre este NFT:</h2><p className="short-description"><span className="desktop-title">{nft.description.split('. ')[0]}.</span><span className="mobile-title">Um colecionável digital {edition.label} finalizado à mão da coleção Kurio Editions, verificado na {nft.network}.</span></p>
        <fieldset className="edition-picker"><legend>Edição:</legend>{nft.editions.map((e) => <button key={e.id} disabled={e.available === 0} aria-label={`Edição ${e.label}${e.available === 0 ? ', indisponível' : ''}`} aria-pressed={editionId === e.id} onClick={() => { chooseEdition(e.id) }}>{e.label}</button>)}</fieldset>
        <div className="buy-controls"><div className="quantity-control"><label htmlFor="quantity">Qtd.</label><button aria-label="Diminuir quantidade" disabled={quantity <= 1 || max === 0} onClick={() => setQuantity(quantity - 1)}>−</button><input id="quantity" aria-describedby="quantity-error" type="number" min="1" max={max || 1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} /><button aria-label="Aumentar quantidade" disabled={quantity >= max} onClick={() => setQuantity(quantity + 1)}>+</button></div><strong className="mobile-unit-price" data-testid="detail-price">{nft.priceEth} ETH</strong><div className="purchase-actions"><Button disabled={!valid || cart.isPending} onClick={() => add(true)}><span className="desktop-title">COMPRAR</span><span className="mobile-title">Comprar NFT</span></Button><Button variant="outline" disabled={!valid || cart.isPending} aria-label="Adicionar ao carrinho" onClick={() => add(false)}><ShoppingCart size={20} /></Button><FavoriteButton id={nft.id} name={nft.name} /></div><p id="quantity-error" className="quantity-feedback" role={valid ? undefined : 'alert'}>{max === 0 ? 'Edição esgotada.' : !valid ? `Escolha uma quantidade inteira de 1 a ${max}.` : `Até ${max} unidades disponíveis.`}</p></div>
        <div className="cart-add-feedback">{cart.isPending && <p role="status">Adicionando ao carrinho…</p>}{cart.isSuccess && <p role="status">Item adicionado ao carrinho. <Link to="/cart">Ver carrinho</Link></p>}{cart.isError && <p role="alert">{apiMessage(cart.error)}</p>}</div><dl className="nft-attributes"><div><dt>ID do token:</dt><dd>{nft.token}</dd></div><div><dt>Coleção:</dt><dd>Kurio Apes · {nft.network}</dd></div><div><dt>Atributos:</dt><dd>Óculos, Esmeralda, {nft.rare ? 'Raro' : 'Verificado'}</dd></div></dl><div className="mobile-gallery" aria-label="Galeria mobile">{nft.gallery.map((asset, i) => <button key={i} aria-label={`Imagem ${i + 1}`} aria-pressed={image === i} onClick={() => setImage(i)}><img src={asset} alt="" width="36" height="36" /></button>)}</div><div className="share-row">Compartilhar este NFT: <button onClick={() => unavailable('Compartilhamento')}>Compartilhar</button></div>
      </div>
    </section>
    <section className="full-details"><div role="tablist" aria-label="Informações do NFT"><button role="tab" id="details-tab" aria-selected={tab === 'details'} aria-controls="details-panel" onClick={() => setTab('details')}>Detalhes do NFT</button><button role="tab" id="reviews-tab" aria-selected={tab === 'reviews'} aria-controls="reviews-panel" onClick={() => setTab('reviews')}>Avaliações de colecionadores (19)</button></div>{tab === 'details' ? <div role="tabpanel" id="details-panel" aria-labelledby="details-tab"><p>{nft.name} é uma obra digital da coleção Kurio Editions. Cada atributo fica armazenado nos metadados do token. {nft.description}</p><p>A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência. Nova Sato recebe {nft.royalty} de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.</p><dl><dt>Rede:</dt><dd>{nft.network} · Metadados armazenados no IPFS.</dd><dt>Contrato:</dt><dd>{nft.contract}</dd><dt>Direitos autorais:</dt><dd>{nft.royalty} nas vendas secundárias. Dados demonstrativos; nenhuma transação real.</dd></dl><p className="version-label">Versão do recurso: <span data-testid="detail-version">{nft.version}</span></p></div> : <div role="tabpanel" id="reviews-panel" aria-labelledby="reviews-tab"><p>4,8 de 5 · 19 avaliações de colecionadores. O envio de avaliações não faz parte desta etapa.</p></div>}</section>
    <Modal title="Imagem do NFT" open={zoom} onClose={() => setZoom(false)}><img className="zoom-image" src={nft.gallery[image]} alt={nft.name} /></Modal>
  </>
}
