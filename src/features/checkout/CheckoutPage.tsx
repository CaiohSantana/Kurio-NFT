import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { http } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/Field'
import { Skeleton } from '@/shared/ui/skeleton'
import { activeScope, apiFields, apiMessage, reportExpired, scopedConfig, useSession } from '@/features/auth/session'
import { profileOptions } from '@/features/profile/api'
import { walletsOptions } from '@/features/wallets/api'
import { networks } from '@/features/catalog/contracts'
import { providers, type Wallet } from '@/features/wallets/contracts'
import { cartKey } from '@/features/cart/api'
import { orderOptions } from '@/features/orders/api'
import type { Attempt, Order } from '@/features/orders/contracts'
import type { Profile } from '@/features/profile/contracts'
import type { CheckoutDraft, CheckoutQuote, OrderInput, WalletConnection } from './contracts'
import { attemptKey, attemptOptions, checkoutQuoteOptions, connectionKey, connectionOptions } from './api'
function paymentMessage(error: unknown) { return isAxiosError(error) ? error.code === 'ECONNABORTED' ? 'Resposta não recebida. Recupere o pedido desta tentativa.' : apiMessage(error) : error instanceof Error ? error.message : apiMessage(error) }

export function CheckoutPage() {
  const session = useSession(), profile = useQuery(profileOptions(session.scope)), wallets = useQuery(walletsOptions(session.scope))
  if (!profile.data || !wallets.data) return <main className="checkout-page">{profile.isError || wallets.isError ? <div role="alert"><p>{apiMessage(profile.error ?? wallets.error)}</p><Button onClick={() => { void profile.refetch(); void wallets.refetch() }}>Tentar novamente</Button></div> : <Skeleton className="account-skeleton" />}</main>
  return <CheckoutContent profile={profile.data} wallets={wallets.data.items} />
}
function initialDraft(profile: Profile, wallets: Wallet[]): CheckoutDraft {
  const primary = wallets.find((w) => w.kind === 'primary') ?? wallets[0]
  const fallback: CheckoutDraft = { collector: { displayName: profile.displayName, username: profile.username, email: profile.email, nickname: profile.nickname, ens: profile.ens, referral: '', secondaryReference: '', observation: '' }, walletId: primary?.id ?? '', network: primary?.network ?? 'Ethereum' }
  try { const draft = JSON.parse(sessionStorage.getItem(`kurio-checkout-draft:${profile.id}`) ?? 'null') as CheckoutDraft | null; if (draft?.collector && typeof draft.walletId === 'string' && networks.includes(draft.network)) return { ...fallback, ...draft, collector: { ...fallback.collector, ...draft.collector } } } catch { /* corrupted local draft falls back to API defaults */ }
  return fallback
}
function CheckoutContent({ profile, wallets }: { profile: Profile; wallets: Wallet[] }) {
  const session = useSession(), client = useQueryClient(), navigate = useNavigate()
  const [draft, setDraft] = useState(() => initialDraft(profile, wallets)), [accepted, setAccepted] = useState('')
  const update = (next: CheckoutDraft) => { setDraft(next); sessionStorage.setItem(`kurio-checkout-draft:${profile.id}`, JSON.stringify(next)) }
  const wallet = wallets.find((w) => w.id === draft.walletId), quoteConfig = checkoutQuoteOptions(session.scope, wallet?.id ?? '', draft.network), quote = useQuery(quoteConfig), connection = useQuery(connectionOptions(session.scope)), attempt = useQuery(attemptOptions(session.scope))
  const previousOrder = useQuery({ ...orderOptions(session.scope, attempt.data?.orderId ?? ''), enabled: !!attempt.data?.orderId })
  const connect = useMutation({ mutationFn: async (disconnect: boolean) => (await http.request<WalletConnection>({ ...scopedConfig(session.scope), method: disconnect ? 'DELETE' : 'POST', url: '/wallet-connection', data: { walletId: draft.walletId, network: draft.network } })).data, onSuccess: (data) => { if (activeScope(client, session.scope)) client.setQueryData(connectionKey(session.scope), data) }, onError: (error) => reportExpired(error, session.scope) })
  const clear = useMutation({ mutationFn: () => http.delete('/order-attempt', scopedConfig(session.scope)), onSuccess: async () => { if (activeScope(client, session.scope)) { setAccepted(''); await client.invalidateQueries({ queryKey: attemptKey(session.scope) }) } }, onError: (error) => reportExpired(error, session.scope) })
  const submit = useMutation({ retry: false, mutationFn: async () => {
    const config = scopedConfig(session.scope), existing = (await http.get<Attempt | null>('/order-attempt', config)).data
    if (existing?.orderId) throw new Error('Existe um pedido desta tentativa. Use Recuperar pedido.')
    const fresh = (await http.post<CheckoutQuote>('/checkout-quotes', { walletId: draft.walletId, network: draft.network }, config)).data
    if (!activeScope(client, session.scope)) throw new Error('Sessão alterada.')
    client.setQueryData(quoteConfig.queryKey, fresh)
    if (fresh.fingerprint !== accepted) throw new Error('Cotação alterada. Revise os valores e confirme novamente.')
    const payload: OrderInput = { quoteId: fresh.id, fingerprint: fresh.fingerprint, walletId: draft.walletId, network: draft.network, collector: draft.collector }
    const prepared = (await http.put<Attempt>('/order-attempt', payload, config)).data
    if (activeScope(client, session.scope)) client.setQueryData(attemptKey(session.scope), prepared)
    return (await http.post<Order>('/orders', prepared.payload, { ...config, headers: { ...config.headers, 'Idempotency-Key': prepared.key } })).data
  }, onSuccess: (order) => { if (activeScope(client, session.scope)) { void client.invalidateQueries({ queryKey: cartKey(session.scope) }); void navigate({ to: '/orders/$orderId', params: { orderId: order.id } }) } }, onError: (error) => { reportExpired(error, session.scope); if (activeScope(client, session.scope)) void client.invalidateQueries({ queryKey: attemptKey(session.scope) }) } })
  const connected = connection.data?.scope === session.scope && connection.data.status === 'connected' && connection.data.walletId === wallet?.id && connection.data.network === draft.network && connection.data.provider === wallet?.provider
  const errorFields = apiFields(submit.error)
  return <main className="checkout-page"><Link to="/cart">← Voltar ao carrinho</Link><h1>Pagamento com carteira</h1>{!wallets.length ? <div className="empty-state"><h2>Nenhuma carteira cadastrada</h2><Link to="/account/wallets" search={{ returnTo: '/checkout' }}>Cadastrar carteira e retornar</Link></div> : <>
    <section className="checkout-wallets"><h2>Carteira conectada</h2><div>{wallets.map((w) => <label key={w.id}><input type="radio" name="checkout-wallet" checked={draft.walletId === w.id} onChange={() => { setAccepted(''); update({ ...draft, walletId: w.id, network: w.network }) }} /><span><strong>{w.kind === 'primary' ? 'Principal' : 'Reserva'} · {w.nickname}</strong><span>{w.address}</span><span>Rede {w.network} · {w.provider}</span></span></label>)}</div><Link to="/account/wallets" search={{ returnTo: '/checkout' }}>Trocar ou editar carteira</Link></section>
    <form aria-label="Pagamento" onSubmit={(event) => { event.preventDefault(); submit.mutate() }} className="checkout-layout"><section><h2>Dados do colecionador</h2><div className="form-grid">{([['displayName', 'Nome de exibição'], ['username', 'Nome de usuário / perfil'], ['email', 'E-mail'], ['nickname', 'Apelido da carteira'], ['ens', 'Nome ENS (opcional)'], ['referral', 'Código de indicação (opcional)'], ['secondaryReference', 'ENS ou carteira secundária (opcional)']] as const).map(([name, label]) => <Field key={name} name={name} label={label} value={draft.collector[name]} onChange={(value) => update({ ...draft, collector: { ...draft.collector, [name]: value } })} type={name === 'email' ? 'email' : 'text'} required={['displayName', 'username', 'email'].includes(name)} error={errorFields[name]} />)}<Field name="network" label="Rede" error={apiFields(quote.error).network} options={networks} value={draft.network} onChange={(network) => { setAccepted(''); update({ ...draft, network: network as CheckoutDraft['network'] }) }} /><Field name="walletAddress" label="Endereço da carteira cadastrada" value={wallet?.address ?? ''} readOnly /><Field name="walletProvider" label="Tipo de carteira cadastrada" value={wallet?.provider ?? ''} readOnly /></div><label className="observation">Observação do colecionador (opcional)<textarea name="observation" maxLength={1000} value={draft.collector.observation} onChange={(e) => update({ ...draft, collector: { ...draft.collector, observation: e.target.value } })} /></label></section>
      <section className="checkout-review"><h2>Revisão · Seus NFTs</h2>{quote.isPending && wallet ? <div role="status"><p>Carregando revisão…</p><Skeleton className="cart-summary-skeleton" /></div> : !quote.data ? <div role="alert"><p>{wallet ? apiMessage(quote.error) : 'Selecione uma carteira cadastrada.'}</p><Button type="button" onClick={() => void quote.refetch()}>Tentar novamente</Button></div> : <><div className="checkout-lines">{quote.data.lines.map((line) => <article key={line.id}><img src={line.nft.image} width="70" height="70" alt={line.nft.name} /><div><strong>{line.nft.name}</strong><p>Edição {line.editionLabel} × {line.quantity}</p></div><strong>{line.lineEth} ETH</strong></article>)}</div><dl className="quote-totals"><div><dt>Subtotal</dt><dd>{quote.data.subtotalEth} ETH</dd></div><div><dt>Desconto</dt><dd>{quote.data.discountEth} ETH</dd></div><div><dt>Taxa de rede simulada</dt><dd>{quote.data.networkFeeEth} ETH</dd></div><div><dt>Total</dt><dd data-testid="checkout-total">{quote.data.totalEth} ETH</dd></div></dl><Link to="/cart">Aplicar ou remover cupom no carrinho</Link>{quote.data.warnings.map((warning) => <p role="alert" key={warning}>{warning}</p>)}{quote.isFetching && <p role="status">Atualizando revisão…</p>}{accepted && accepted !== quote.data.fingerprint && <p role="alert">Cotação alterada. Revise os valores e confirme novamente.</p>}</>}
        <fieldset className="provider-list"><legend>Carteira e rede · provedores simulados</legend>{providers.map((provider) => <label key={provider}><input type="radio" name="provider" checked={provider === wallet?.provider} disabled={provider !== wallet?.provider} readOnly />{provider}</label>)}<p>O tipo vem do cadastro. Para mudar o provedor, edite a carteira.</p></fieldset><div className="connection-actions"><Button type="button" disabled={!wallet || connect.isPending} onClick={() => connect.mutate(false)}>{connected ? 'Reconectar carteira' : 'Conectar carteira'}</Button><Button type="button" variant="outline" disabled={!connected || connect.isPending} onClick={() => connect.mutate(true)}>Desconectar</Button></div><p role="status">{connect.isPending ? 'Conectando…' : connection.data?.status === 'refused' ? 'Conexão recusada pela simulação.' : connected ? 'Carteira conectada na simulação.' : 'Carteira desconectada.'}</p>{connect.isError && <p role="alert">{apiMessage(connect.error)}</p>}
        <label className="checkbox-label"><input type="checkbox" checked={!!quote.data && accepted === quote.data.fingerprint} disabled={!quote.data?.purchasable || quote.isFetching} onChange={(e) => setAccepted(e.target.checked ? quote.data!.fingerprint : '')} />Revisei os dados e aceito esta cotação</label>{submit.isError && <p role="alert">{paymentMessage(submit.error)}</p>}{clear.isError && <p role="alert">{apiMessage(clear.error)}</p>}
        {attempt.data?.orderId ? <div className="attempt-recovery"><Link to="/orders/$orderId" params={{ orderId: attempt.data.orderId }}>Recuperar pedido</Link>{previousOrder.data?.status !== 'pending' && previousOrder.data && <Button type="button" onClick={() => clear.mutate()} disabled={clear.isPending}>Iniciar nova compra</Button>}</div> : <Button type="submit" disabled={!connected || !quote.data?.purchasable || accepted !== quote.data.fingerprint || quote.isFetching || quote.isError || submit.isPending || attempt.isPending}>{submit.isPending ? 'Enviando pedido…' : 'Confirmar compra'}</Button>}
        <p className="simulation-label">Demonstração: sem blockchain ou pagamento real.</p>
      </section>
    </form>
  </>}</main>
}
