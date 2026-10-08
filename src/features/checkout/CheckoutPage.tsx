import { useEffect, useRef, useState } from 'react'
import './checkout.css'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { http } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/Field'
import { EnsField } from '@/shared/ui/EnsField'
import { Modal } from '@/shared/ui/modal'
import { PurchaseItems } from '@/features/cart/PurchaseItems'
import { CatalogLink } from '@/features/catalog/CatalogLink'
import { Skeleton } from '@/shared/ui/skeleton'
import { activeScope, apiFields, apiMessage, reportExpired, scopedConfig, useSession } from '@/features/auth/session'
import { profileOptions } from '@/features/profile/api'
import { walletsOptions } from '@/features/wallets/api'
import { networks, defaultCatalogSearch } from '@/features/catalog/contracts'
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
  const submitting = useRef(false)
  const [draft, setDraft] = useState(() => initialDraft(profile, wallets)), [accepted, setAccepted] = useState(''), [review, setReview] = useState(false), [chooseWallet, setChooseWallet] = useState(false), [detailsOpen, setDetailsOpen] = useState(() => matchMedia('(min-width:640px)').matches)
  const update = (next: CheckoutDraft) => { setDraft(next); sessionStorage.setItem(`kurio-checkout-draft:${profile.id}`, JSON.stringify(next)) }
  const wallet = wallets.find((w) => w.id === draft.walletId), quoteConfig = checkoutQuoteOptions(session.scope, wallet?.id ?? '', draft.network), quote = useQuery(quoteConfig), connection = useQuery(connectionOptions(session.scope)), attempt = useQuery(attemptOptions(session.scope))
  const previousOrder = useQuery({ ...orderOptions(session.scope, attempt.data?.orderId ?? ''), enabled: !!attempt.data?.orderId })
  // Track the initially displayed review fingerprint, not a second quote cache.
  if (!accepted && quote.data) setAccepted(quote.data.fingerprint)
  useEffect(() => { if (attempt.data?.orderId && previousOrder.data?.status === 'pending') void navigate({ to: '/orders/$orderId', params: { orderId: attempt.data.orderId } }) }, [attempt.data?.orderId, previousOrder.data?.status, navigate])
  const connect = useMutation({ mutationFn: async ({ selected, network, disconnect = false }: { selected: Wallet; network: CheckoutDraft['network']; disconnect?: boolean }) => (await http.request<WalletConnection>({ ...scopedConfig(session.scope), method: disconnect ? 'DELETE' : 'POST', url: '/wallet-connection', data: { walletId: selected.id, network } })).data, onSuccess: (data) => { if (activeScope(client, session.scope)) client.setQueryData(connectionKey(session.scope), data) }, onError: (error) => reportExpired(error, session.scope) })
  const submit = useMutation({ retry: false, mutationFn: async (reviewedFingerprint: string) => {
    const config = scopedConfig(session.scope), existing = (await http.get<Attempt | null>('/order-attempt', config)).data
    if (existing?.orderId) { const order = (await http.get<Order>(`/orders/${existing.orderId}`, config)).data; if (order.status === 'pending') return order; await http.delete('/order-attempt', config) }
    const fresh = (await http.post<CheckoutQuote>('/checkout-quotes', { walletId: draft.walletId, network: draft.network }, config)).data
    if (!activeScope(client, session.scope)) throw new Error('Sessão alterada.')
    client.setQueryData(quoteConfig.queryKey, fresh)
    if (fresh.fingerprint !== reviewedFingerprint) throw new Error('Cotação alterada. Revise os valores e confirme novamente.')
    const payload: OrderInput = { quoteId: fresh.id, fingerprint: fresh.fingerprint, walletId: draft.walletId, network: draft.network, collector: draft.collector }
    const prepared = (await http.put<Attempt>('/order-attempt', payload, config)).data
    if (activeScope(client, session.scope)) client.setQueryData(attemptKey(session.scope), prepared)
    return (await http.post<Order>('/orders', prepared.payload, { ...config, headers: { ...config.headers, 'Idempotency-Key': prepared.key } })).data
  }, onSuccess: (order) => { if (activeScope(client, session.scope)) { void client.invalidateQueries({ queryKey: cartKey(session.scope) }); void navigate({ to: '/orders/$orderId', params: { orderId: order.id } }) } }, onError: (error) => { reportExpired(error, session.scope); if (activeScope(client, session.scope)) { if (paymentMessage(error).includes('Cotação alterada')) setReview(true); void client.invalidateQueries({ queryKey: attemptKey(session.scope) }) } }, onSettled: () => { submitting.current = false } })
  const connected = connection.data?.scope === session.scope && connection.data.status === 'connected' && connection.data.walletId === wallet?.id && connection.data.network === draft.network && connection.data.provider === wallet?.provider
  const errorFields = apiFields(submit.error)
  const selectWallet = (value: Wallet) => { setAccepted(''); update({ ...draft, walletId: value.id, network: value.network }); setChooseWallet(false); connect.mutate({ selected: value, network: value.network }) }
  const selectProvider = (provider: Wallet['provider']) => { const selected = wallet?.provider === provider ? wallet : wallets.find((value) => value.provider === provider); if (selected) selectWallet(selected); else setChooseWallet(true) }
  const collectorField = (name: keyof CheckoutDraft['collector'], label: string, required = false, placeholder = false, requiredMarker = required) => <Field name={name} label={label} value={draft.collector[name]} onChange={(value) => update({ ...draft, collector: { ...draft.collector, [name]: value } })} type={name === 'email' ? 'email' : 'text'} required={required} requiredMarker={requiredMarker} placeholder={placeholder ? label : undefined} hideLabel={placeholder} error={errorFields[name]} />
  return <main className="checkout-page">
    <nav className="checkout-breadcrumb" aria-label="Breadcrumb"><Link to="/" search={defaultCatalogSearch}>Início</Link><span>/</span><CatalogLink>Mercado</CatalogLink><span>/</span><span aria-current="page">Pagamento</span></nav>
    <div className="checkout-mobile-title"><Link to="/cart" aria-label="Voltar ao carrinho">‹</Link><h1>Pagamento com carteira</h1></div>
    {!wallets.length ? <div className="empty-state"><h2>Nenhuma carteira cadastrada</h2><Link to="/account/wallets" search={{ returnTo: '/checkout' }}>Cadastrar carteira e retornar</Link></div> : <>
      <form aria-label="Pagamento" onSubmit={(event) => { event.preventDefault(); if (!submitting.current) { if (quote.data) { if (accepted !== quote.data.fingerprint) { setReview(true); return } submitting.current = true; submit.mutate(quote.data.fingerprint) } } }} className="checkout-layout">
        <details className="checkout-collector" open={detailsOpen || Object.keys(errorFields).length > 0} onToggle={(event) => setDetailsOpen(event.currentTarget.open)}><summary><h2>Perfil do colecionador</h2></summary><div className="form-grid">
          {collectorField('displayName', 'Nome de exibição', true)}{collectorField('username', 'Nome de usuário', true)}
          <Field name="network" label="Rede" required error={apiFields(quote.error).network} options={networks} value={draft.network} onChange={(network) => { setAccepted(''); update({ ...draft, network: network as CheckoutDraft['network'] }) }} />
          {collectorField('username', 'Nome do perfil', true)}
          <Field name="walletAddress" label="Endereço da carteira cadastrada" value={wallet?.address ?? ''} readOnly required />
          {collectorField('secondaryReference', 'ENS ou carteira secundária (opcional)', false, true)}
          <Field name="walletProvider" label="Tipo de carteira" value={wallet?.provider ?? ''} options={providers} onChange={(value) => selectProvider(value as Wallet['provider'])} required />
          {collectorField('referral', 'Código de indicação', false, false, true)}
          {collectorField('email', 'E-mail', true)}<EnsField value={draft.collector.ens} onChange={(ens) => update({ ...draft, collector: { ...draft.collector, ens } })} error={errorFields.ens} />
        </div><button type="button" className="wallet-context" onClick={() => setChooseWallet(true)}><span aria-hidden="true">○</span> Usar outra carteira?</button>
          <label className="observation">Observação do colecionador (opcional)<textarea name="observation" maxLength={1000} value={draft.collector.observation} onChange={(event) => update({ ...draft, collector: { ...draft.collector, observation: event.target.value } })} /></label>
        </details>
        <section className="checkout-review">
          <section className="checkout-mobile-wallets"><header><h2>{connected ? 'Carteira conectada' : 'Carteiras cadastradas'}</h2><button type="button" aria-label="Usar outra carteira?" onClick={() => setChooseWallet(true)}>Trocar carteira</button></header><div>{[...wallets].sort((a, b) => a.kind === b.kind ? 0 : a.kind === 'secondary' ? -1 : 1).map((value) => <label key={value.id}><input type="radio" name="mobile-wallet" checked={draft.walletId === value.id} onChange={() => selectWallet(value)} /><span><strong>{value.kind === 'primary' ? 'Principal' : 'Reserva'}</strong><span title={value.address}>{value.ens || `${value.address.slice(0, 6)}…${value.address.slice(-4)}`}</span><span>Rede {value.network}</span></span></label>)}</div></section>
          {quote.isPending && wallet ? <div role="status"><span className="sr-only">Carregando revisão…</span><Skeleton className="cart-summary-skeleton" /></div> : !quote.data ? <div role="alert"><p>{wallet ? apiMessage(quote.error) : 'Selecione uma carteira cadastrada.'}</p><Button type="button" onClick={() => void quote.refetch()}>Tentar novamente</Button></div> : <>
            <details className="checkout-nfts" open={matchMedia('(min-width:640px)').matches ? true : undefined}><summary><h2>Seus NFTs</h2></summary><PurchaseItems lines={quote.data.lines} />
            <Link className="checkout-coupon" to="/cart">Tem um código promocional? Aplique aqui</Link>
            <dl className="checkout-totals"><div><dt>Subtotal</dt><dd>{quote.data.subtotalEth} ETH</dd></div><div><dt>Desconto do lançamento</dt><dd>(−) {quote.data.discountEth} ETH</dd></div><div><dt>Taxa de rede</dt><dd>{quote.data.networkFeeEth} ETH</dd></div></dl><p className="fee-hint">Taxa estimada</p></details>
            <div className="checkout-total"><strong>Total</strong><strong data-testid="checkout-total">{quote.data.totalEth} ETH</strong></div>
            {quote.data.warnings.map((warning) => <p role="alert" key={warning}>{warning}</p>)}
            {quote.isFetching && <span className="sr-only" role="status">Atualizando revisão…</span>}
            {accepted && accepted !== quote.data.fingerprint && <p role="alert">Cotação alterada. Revise os valores e confirme novamente.</p>}
          </>}
          <fieldset className="provider-list"><legend>Carteira e rede</legend>{providers.map((provider) => <label key={provider}><input type="radio" name="provider" checked={provider === wallet?.provider} disabled={connect.isPending} onChange={() => {}} onClick={() => selectProvider(provider)} /><span className="provider-symbol" aria-hidden="true">{provider === 'Coinbase' ? '◫' : provider[0]}</span><span>{provider === 'Coinbase' ? 'Coinbase Wallet' : provider}</span></label>)}</fieldset>
          {connect.isPending && <p role="status">Conectando carteira…</p>}
          {(connection.data?.status === 'refused' || connect.isError) && <div role="alert"><p>{connect.isError ? apiMessage(connect.error) : 'Conexão recusada. Tente novamente.'}</p><Button type="button" disabled={!wallet || connect.isPending} onClick={() => wallet && connect.mutate({ selected: wallet, network: draft.network })}>Tentar conectar novamente</Button></div>}
          {(attempt.isError || !!attempt.data?.orderId && previousOrder.isError) && <div role="alert"><p>Não foi possível recuperar sua tentativa.</p><Button type="button" onClick={() => { void attempt.refetch(); if (attempt.data?.orderId) void previousOrder.refetch() }}>Tentar novamente</Button></div>}
          {submit.isError && <p role="alert">{paymentMessage(submit.error)}</p>}
          <Button className="checkout-submit" type="submit" disabled={!connected || !quote.data?.purchasable || quote.isFetching || quote.isError || submit.isPending || attempt.isPending || attempt.isError || !!attempt.data?.orderId && (previousOrder.isPending || previousOrder.isError)}>{submit.isPending ? 'Enviando pedido…' : 'Confirmar compra'}</Button>

        </section>
      </form>
      <Modal title="Revisar cotação alterada" open={review} onClose={() => setReview(false)}><p role="alert">Cotação alterada. Revise os valores e confirme novamente.</p><p>Total: {quote.data?.totalEth} ETH</p>{quote.data?.warnings.map((warning) => <p role="alert" key={warning}>{warning}</p>)}<Button type="button" disabled={!quote.data?.purchasable || quote.isFetching || submit.isPending || !connected} onClick={() => { if (!submitting.current && quote.data) { const fingerprint = quote.data.fingerprint; setAccepted(fingerprint); setReview(false); submitting.current = true; submit.mutate(fingerprint) } }}>Confirmar nova cotação</Button></Modal>
      <Modal title="Carteiras cadastradas" open={chooseWallet} onClose={() => setChooseWallet(false)}><div className="wallet-picker">{wallets.map((value) => <label key={value.id}><input type="radio" name="registered-wallet" checked={draft.walletId === value.id} onChange={() => selectWallet(value)} /><span><strong>{value.kind === 'primary' ? 'Principal' : 'Reserva'} · {value.nickname}</strong><span>{value.address}</span><span>{value.network} · {value.provider}</span></span></label>)}</div><Link to="/account/wallets" search={{ returnTo: '/checkout' }}>Trocar ou editar carteira</Link>{connected && <Button type="button" variant="outline" disabled={connect.isPending} onClick={() => { if (wallet) connect.mutate({ selected: wallet, network: draft.network, disconnect: true }); setChooseWallet(false) }}>Desconectar</Button>}</Modal>
    </>}
  </main>
}
