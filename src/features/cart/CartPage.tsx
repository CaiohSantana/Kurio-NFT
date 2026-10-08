import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { apiMessage, useSession } from '@/features/auth/session'
import { catalogOptions } from '@/features/catalog/api'
import { defaultCatalogSearch } from '@/features/catalog/contracts'
import { CatalogLink } from '@/features/catalog/CatalogLink'
import { RelatedNfts } from '@/features/catalog/RelatedNfts'
import { Trash2 } from 'lucide-react'
import { quoteOptions, useCartMutation } from './api'
import type { QuoteLine } from './contracts'
export function CartPage() {
  const session = useSession(), quote = useQuery(quoteOptions(session.scope)), mutation = useCartMutation(), navigate = useNavigate()
  const related = useQuery(catalogOptions(defaultCatalogSearch)), [code, setCode] = useState('')
  return <main className="cart-page"><CatalogLink>← Continuar explorando</CatalogLink><h1>Carrinho de NFTs</h1>{!session.user && <Link to="/login" search={{ returnTo: '/cart', favorite: '' }}>Entrar para conciliar carrinho</Link>}{session.notices.map((message) => <p role="status" key={message}>{message}</p>)}
    {quote.isPending ? <div className="cart-layout" role="status"><Skeleton className="cart-items-skeleton" /><div><p>Carregando cotação…</p><Skeleton className="cart-summary-skeleton" /></div></div> : !quote.data ? <div className="empty-state" role="alert"><p>{apiMessage(quote.error)}</p><Button onClick={() => void quote.refetch()}>Tentar novamente</Button></div> : !quote.data.lines.length ? <div className="empty-state"><h2>Seu carrinho está vazio</h2><CatalogLink>Explorar NFTs</CatalogLink></div> : <div className="cart-layout">
      <section aria-label="Itens do carrinho"><div className="cart-columns"><span>NFTs</span><span>Preço</span><span>Edições</span><span>Total</span></div>{quote.data.lines.map((line) => <CartRow key={line.id} line={line} pending={mutation.isPending} update={(quantity) => mutation.mutate({ action: 'quantity', id: line.id, quantity })} remove={() => mutation.mutate({ action: 'remove', id: line.id })} />)}</section>
      <section className="cart-summary" aria-label="Resumo da carteira"><h2>Resumo da carteira</h2><form onSubmit={(event) => { event.preventDefault(); mutation.mutate({ action: 'coupon', code }) }}><label htmlFor="coupon">Código promocional</label><div><input id="coupon" value={code} onChange={(e) => setCode(e.target.value)} aria-describedby="coupon-error" placeholder="Digite o código promocional…" /><Button disabled={mutation.isPending}>Aplicar</Button></div></form>{mutation.isError && <p id="coupon-error" role="alert">{apiMessage(mutation.error)}</p>}{quote.data.coupon && <p>Cupom {quote.data.coupon} <button disabled={mutation.isPending} onClick={() => mutation.mutate({ action: 'coupon', code: '' })}>Remover cupom</button></p>}
        {quote.isFetching ? <div role="status"><p>Atualizando cotação…</p><Skeleton className="cart-summary-skeleton" /></div> : <dl><div><dt>Subtotal</dt><dd data-testid="subtotal">{quote.data.subtotalEth} ETH</dd></div><div><dt>Desconto do lançamento</dt><dd data-testid="discount">{quote.data.discountEth} ETH</dd></div><div><dt>Taxa de rede</dt><dd>{quote.data.networkFeeEth} ETH</dd></div><div className="cart-total"><dt>Total</dt><dd data-testid="cart-total">{quote.data.totalEth} ETH</dd></div></dl>}
        {quote.data.warnings.map((warning) => <p role="alert" key={warning}>{warning}</p>)}{quote.isError && <p role="alert">Falha ao atualizar a cotação. <button onClick={() => void quote.refetch()}>Tentar novamente</button></p>}
        <Button disabled={!quote.data.purchasable || quote.isFetching || quote.isError || mutation.isPending} onClick={() => { void navigate({ to: '/checkout' }) }}>Conectar e finalizar</Button><CatalogLink className="continue-shopping">Continuar explorando</CatalogLink>
      </section>
    </div>}
    <RelatedNfts title="Colecionadores também viram" items={[...(related.data?.items.slice(3) ?? []), ...(related.data?.items.slice(0, 3) ?? [])]} />
  </main>
}
function CartRow({ line, pending, update, remove }: { line: QuoteLine; pending: boolean; update: (quantity: number) => void; remove: () => void }) {
  const [draft, setDraft] = useState<string | null>(null)
  const quantity = Number(draft ?? line.quantity), valid = Number.isInteger(quantity) && quantity >= 1 && quantity <= line.limit
  return <article className="cart-row" data-testid={`cart-${line.id}`}><Link to="/nfts/$nftId" search={{ edition: line.editionId, quantity: line.quantity }} params={{ nftId: line.nftId }}><img src={line.nft.image} width="70" height="70" alt={line.nft.name} /></Link><div><h2>{line.nft.name}</h2><p className="cart-token">ID do token: {line.nft.token}</p><p className="cart-edition">Edição: {line.editionLabel}</p>{!line.available && <p className="cart-stock" role="alert">Indisponível — item preservado</p>}</div><strong className="row-unit-price">{line.nft.priceEth} ETH</strong><div className="cart-quantity"><button aria-label={`Diminuir ${line.nft.name} ${line.editionLabel}`} disabled={pending || line.quantity <= 1 || !line.limit} onClick={() => update(Math.min(line.quantity - 1, line.limit))}>−</button><input type="number" min="1" max={line.limit || 1} aria-label={`Quantidade ${line.nft.name} ${line.editionLabel}`} value={draft ?? line.quantity} aria-invalid={!valid} aria-describedby={`quantity-error-${line.id}`} disabled={pending} onChange={(e) => setDraft(e.target.value)} /><button aria-label={`Aumentar ${line.nft.name} ${line.editionLabel}`} disabled={pending || line.quantity >= line.limit} onClick={() => update(line.quantity + 1)}>+</button>{draft !== null && draft !== String(line.quantity) && <button disabled={!valid || pending} onClick={() => { setDraft(null); update(quantity) }}>Atualizar quantidade</button>}</div><strong className="row-total">{line.lineEth} ETH</strong><button className="remove-item" aria-label={`Remover ${line.nft.name} ${line.editionLabel}`} disabled={pending} onClick={remove}><Trash2 size={20} aria-hidden="true" /></button>{!valid && <p id={`quantity-error-${line.id}`} role="alert">Quantidade inteira de 1 a {line.limit}; edição esgotada se limite 0.</p>}</article>
}
