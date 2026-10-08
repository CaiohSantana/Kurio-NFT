import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { MailCheck } from 'lucide-react'
import { orderRoute } from '@/app/router'
import { activeScope, apiMessage, reportExpired, scopedConfig, useSession } from '@/features/auth/session'
import { cartKey, quoteKey } from '@/features/cart/api'
import { CatalogLink } from '@/features/catalog/CatalogLink'
import { attemptKey } from '@/features/checkout/api'
import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'
import { Skeleton } from '@/shared/ui/skeleton'
import { http } from '@/shared/api/http'
import { orderOptions } from './api'
export function OrderPage() {
  const { orderId } = orderRoute.useParams(), session = useSession(), client = useQueryClient(), navigate = useNavigate(), query = useQuery(orderOptions(session.scope, orderId))
  const [explorer, setExplorer] = useState(false)
  const restart = useMutation({ mutationFn: () => http.delete('/order-attempt', scopedConfig(session.scope)), onSuccess: () => { if (activeScope(client, session.scope)) { void client.invalidateQueries({ queryKey: attemptKey(session.scope) }); void navigate({ to: '/checkout' }) } }, onError: (error) => reportExpired(error, session.scope) })
  useEffect(() => { if (query.data?.status === 'confirmed') { void client.invalidateQueries({ queryKey: cartKey(session.scope) }); void client.invalidateQueries({ queryKey: quoteKey(session.scope) }) } }, [client, session.scope, query.data?.status])
  if (!query.data) return <main className="order-page">{query.isPending ? <Skeleton className="account-skeleton" /> : <div className="empty-state" role="alert"><h1>{isAxiosError(query.error) && query.error.response?.status === 404 ? 'Pedido inexistente' : 'Pedido não disponível'}</h1><p>{apiMessage(query.error)}</p><Button onClick={() => void query.refetch()}>Tentar novamente</Button><CatalogLink>Voltar ao catálogo</CatalogLink></div>}</main>
  const order = query.data, snapshot = order.snapshot
  return <main className="order-page"><article className="receipt-card"><header>{order.status === 'confirmed' && <MailCheck size={74} aria-hidden="true" />}<h1>{order.status === 'confirmed' ? 'Compra confirmada pela simulação' : order.status === 'pending' ? 'Pedido pendente' : 'Pagamento recusado'}</h1><p role={order.status === 'refused' ? 'alert' : 'status'}>{order.status === 'pending' ? 'Aguardando a API simulada. Você pode atualizar ou recuperar esta rota.' : order.status === 'refused' ? `${order.reason} Carrinho preservado.` : 'Seus NFTs foram confirmados para a carteira cadastrada na demonstração.'}</p></header>
    <dl className="receipt-meta"><div><dt>ID da transação simulada</dt><dd data-testid="order-transaction">{order.transaction}</dd></div><div><dt>Data</dt><dd data-testid="order-date">{new Date(order.createdAt).toLocaleString('pt-BR')}</dd></div><div><dt>Carteira</dt><dd>{snapshot.wallet.provider} · {snapshot.network}</dd></div></dl><p className="receipt-id">Pedido: <span data-testid="order-id">{order.id}</span> · Versão <span data-testid="order-version">{order.version}</span></p><h2>{order.status === 'confirmed' ? 'Detalhes da transação simulada' : 'Resumo da tentativa'}</h2><div className="checkout-lines">{snapshot.lines.map((line) => <article key={line.id}><img src={line.nft.image} width="70" height="70" alt={line.nft.name} /><div><strong>{line.nft.name}</strong><p>Edição {line.editionLabel} × {line.quantity}</p><p>{line.nft.priceEth} ETH por unidade</p></div><strong>{line.lineEth} ETH</strong></article>)}</div><dl className="quote-totals"><div><dt>Subtotal</dt><dd>{snapshot.subtotalEth} ETH</dd></div><div><dt>Desconto</dt><dd>{snapshot.discountEth} ETH</dd></div><div><dt>Taxa de rede</dt><dd>{snapshot.networkFeeEth} ETH</dd></div><div><dt>Total</dt><dd data-testid="receipt-total">{snapshot.totalEth} ETH</dd></div></dl><p className="receipt-address">Endereço registrado: {snapshot.wallet.address}</p>{query.isError && <p role="alert">Falha ao atualizar pedido. <Button onClick={() => void query.refetch()}>Tentar novamente</Button></p>}{order.status === 'pending' && <Button onClick={() => void query.refetch()}>Consultar estado do pedido</Button>}{order.status === 'refused' && <Button disabled={restart.isPending} onClick={() => restart.mutate()}>Revisar pagamento</Button>}{restart.isError && <p role="alert">{apiMessage(restart.error)}</p>}{order.status === 'confirmed' && <Button onClick={() => setExplorer(true)}>Ver exploração simulada</Button>}<CatalogLink>Continuar explorando</CatalogLink></article><Modal title="Exploração simulada da transação" open={explorer} onClose={() => setExplorer(false)}><p>{order.transaction}</p><p>Referência fictícia da API. Nenhuma transação foi enviada ao Etherscan ou a uma blockchain.</p><p>{snapshot.totalEth} ETH · {snapshot.network}</p></Modal></main>
}
