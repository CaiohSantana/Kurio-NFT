import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { orderRoute } from '@/app/router'
import { activeScope, apiMessage, reportExpired, scopedConfig, useSession } from '@/features/auth/session'
import { cartKey, quoteKey } from '@/features/cart/api'
import { PurchaseItems } from '@/features/cart/PurchaseItems'
import { CatalogLink, useCatalogDestination } from '@/features/catalog/CatalogLink'
import { attemptKey } from '@/features/checkout/api'
import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'
import { Skeleton } from '@/shared/ui/skeleton'
import { http } from '@/shared/api/http'
import { orderOptions } from './api'

export function OrderPage() {
  const { orderId } = orderRoute.useParams(), session = useSession(), client = useQueryClient(), navigate = useNavigate(), query = useQuery(orderOptions(session.scope, orderId)), search = useCatalogDestination()
  const [explorer, setExplorer] = useState(false)
  const restart = useMutation({ mutationFn: () => http.delete('/order-attempt', scopedConfig(session.scope)), onSuccess: () => { if (activeScope(client, session.scope)) { void client.invalidateQueries({ queryKey: attemptKey(session.scope) }); void navigate({ to: '/checkout' }) } }, onError: (error) => reportExpired(error, session.scope) })
  useEffect(() => { if (query.data?.status === 'confirmed') { void client.invalidateQueries({ queryKey: cartKey(session.scope) }); void client.invalidateQueries({ queryKey: quoteKey(session.scope) }) } }, [client, session.scope, query.data?.status])
  const close = () => { void navigate({ to: '/', search, hash: 'catalog' }) }
  if (!query.data) return <main className="order-page">{query.isPending ? <Skeleton className="account-skeleton" /> : <div className="empty-state" role="alert"><h1>{isAxiosError(query.error) && query.error.response?.status === 404 ? 'Pedido inexistente' : 'Pedido não disponível'}</h1><p>{apiMessage(query.error)}</p><Button onClick={() => void query.refetch()}>Tentar novamente</Button><CatalogLink>Voltar ao catálogo</CatalogLink></div>}</main>
  const order = query.data, snapshot = order.snapshot, title = order.status === 'confirmed' ? 'Seus NFTs agora estão na sua carteira' : order.status === 'pending' ? 'Pedido pendente' : 'Pagamento recusado'
  const date = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).formatToParts(new Date(order.createdAt))
  const part = (type: string) => date.find((value) => value.type === type)?.value ?? ''
  const month = part('month').replace('.', ''), formattedDate = `${part('day')} ${month[0].toUpperCase()}${month.slice(1)}, ${part('year')}`
  return <main className="order-page">
    <Modal title={title} open onClose={close} className="receipt-dialog" showTitle={false}>
      <article className="receipt-card">
        <header>{order.status === 'confirmed' && <img className="receipt-thanks" src="/assets/icons/thank-you.svg" width="66" height="80" alt="" />}<h1>{title}</h1>{order.status !== 'confirmed' && <p role={order.status === 'refused' ? 'alert' : 'status'}>{order.status === 'pending' ? 'Estamos processando seu pedido. Você pode atualizar esta página.' : order.reason + ' Seu carrinho foi preservado.'}</p>}</header>
        <dl className="receipt-meta"><div><dt>ID da transação</dt><dd data-testid="order-transaction" title={order.transaction}>{order.transaction.slice(0, 8)}…{order.transaction.slice(-4)}</dd></div><div><dt>Data</dt><dd data-testid="order-date">{formattedDate}</dd></div><div><dt>Total</dt><dd>{snapshot.totalEth} ETH</dd></div><div><dt>Carteira</dt><dd>{snapshot.wallet.provider === 'Coinbase' ? 'Coinbase Wallet' : snapshot.wallet.provider}</dd></div></dl>
        <section className="receipt-details"><h2>Detalhes da transação</h2><PurchaseItems lines={snapshot.lines} receipt />
          <dl className="receipt-totals">{snapshot.discountEth !== '0' && <><div><dt>Subtotal</dt><dd>{snapshot.subtotalEth} ETH</dd></div><div><dt>Desconto</dt><dd>{snapshot.discountEth} ETH</dd></div></>}<div><dt>Taxa de rede</dt><dd>{snapshot.networkFeeEth} ETH</dd></div><div><dt>Total</dt><dd data-testid="receipt-total">{snapshot.totalEth} ETH</dd></div></dl>
          {query.isError && <p role="alert">Falha ao atualizar pedido. <Button onClick={() => void query.refetch()}>Tentar novamente</Button></p>}
          {order.status === 'pending' && <Button onClick={() => void query.refetch()}>Consultar estado do pedido</Button>}
          {order.status === 'refused' && <Button disabled={restart.isPending} onClick={() => restart.mutate()}>Revisar pagamento</Button>}{restart.isError && <p role="alert">{apiMessage(restart.error)}</p>}
          {order.status === 'confirmed' && <><p className="receipt-result">Transação confirmada na {snapshot.network}. A propriedade foi transferida para sua carteira conectada e registrada na rede.</p><Button className="receipt-explorer" onClick={() => setExplorer(true)}>Ver transação</Button></>}
        </section>
      </article>
    </Modal>
    <Modal title="Explorador de transações · ambiente simulado" open={explorer} onClose={() => setExplorer(false)}><p>Esta referência pertence ao ambiente local de testes, sem registro em uma blockchain pública.</p><dl><dt>Transação</dt><dd className="explorer-reference">{order.transaction}</dd><dt>Rede</dt><dd>{snapshot.network}</dd><dt>Total</dt><dd>{snapshot.totalEth} ETH</dd><dt>Destino</dt><dd className="explorer-reference">{snapshot.wallet.address}</dd></dl><Button onClick={() => setExplorer(false)}>Voltar ao recibo</Button></Modal>
  </main>
}
