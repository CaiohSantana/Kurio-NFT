import { createContext, useContext, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { Search, LogIn, User } from 'lucide-react'
import { Modal } from '@/shared/ui/modal'
import { useCatalogSocket } from './use-catalog-socket'
import { CatalogLink } from './CatalogLink'
import { CartLink } from '@/features/cart/CartLink'
import { defaultCatalogSearch } from './contracts'
import { SessionProvider, useSession, replaceSession, scopedConfig, apiMessage } from '@/features/auth/session'
import type { Session } from '@/features/auth/contracts'
import { http } from '@/shared/api/http'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const NoticeContext = createContext<(action: string) => void>(() => undefined)
const SignOutContext = createContext<() => void>(() => undefined)
export const useUnavailable = () => useContext(NoticeContext)
export const useSignOut = () => useContext(SignOutContext)
export function MarketShell() {
  return <SessionProvider><MarketContent /></SessionProvider>
}
function MarketContent() {
  const session = useSession(), client = useQueryClient()
  const [notice, setNotice] = useState(''), [accountOpen, setAccountOpen] = useState(false)
  const realtime = useCatalogSocket(session.scope)
  const pathname = useLocation({ select: (location) => location.pathname })
  const navigate = useNavigate()
  const logout = useMutation({ mutationFn: async () => (await http.delete<Session>('/session', scopedConfig(session.scope))).data, onSuccess: async (incoming) => { await replaceSession(client, incoming); void navigate({ to: '/', search: defaultCatalogSearch }) }, onError: (error) => setNotice(apiMessage(error)) })
  const login = () => { void navigate({ to: '/login', search: { returnTo: window.location.pathname + window.location.search, favorite: '' } }) }
  const focusSearch = () => {
    const input = document.getElementById('catalog-search')
    if (input) input.focus()
    else void navigate({ to: '/', search: defaultCatalogSearch }).then(() => document.getElementById('catalog-search')?.focus())
  }
  const unavailable = (action: string) => setNotice(`${action} não está disponível no momento. Nenhuma operação foi realizada.`)
  return <NoticeContext.Provider value={unavailable}><SignOutContext.Provider value={() => logout.mutate()}>
    <div className={`market ${pathname === '/' ? 'home-market' : pathname.startsWith('/nfts/') ? 'detail-market nft-market' : 'detail-market'}`}>
      <header className="desktop-header">
        <Link to="/" search={defaultCatalogSearch} className="wordmark">KURIO</Link>
        <nav aria-label="Navegação principal"><Link to="/" search={defaultCatalogSearch} className={pathname === '/' || pathname.startsWith('/account') ? 'active' : ''}>Início</Link><CatalogLink className={pathname.startsWith('/nfts') || pathname === '/cart' || pathname === '/checkout' ? 'active' : ''}>Mercado</CatalogLink><button onClick={() => unavailable('Criadores')}>Criadores</button><button onClick={() => unavailable('Aprenda')}>Aprenda</button></nav>
        <div className="header-actions"><button aria-label="Abrir busca" onClick={focusSearch}><Search size={20} /></button><CartLink />{session.user ? <button className="login-button" aria-label={`Minha conta: ${session.user.username}`} onClick={() => setAccountOpen(true)}><User size={18} />{session.user.username}</button> : <button className="login-button" onClick={login}><LogIn size={18} />Entrar</button>}</div>
      </header>
      {session.user && <button className="mobile-account-button" aria-label={`Minha conta: ${session.user.username}`} onClick={() => setAccountOpen(true)}><User size={18} /></button>}
      {realtime && !pathname.startsWith('/orders') && <p className="realtime-notice" role="status">{realtime}</p>}
      {session.notices.filter((message) => message.startsWith('Não foi possível favoritar')).map((message) => <p role="alert" key={message}>{message}</p>)}
      <Outlet />
      <Footer onAccount={() => setAccountOpen(true)} />
      {pathname === '/' && <nav className="mobile-navigation" aria-label="Navegação mobile">
        <Link to="/" search={defaultCatalogSearch} aria-label="Início"><img src="/assets/figma/b096d.svg" width="16" height="17" alt="" /></Link><button aria-label="Favoritos" onClick={() => unavailable('Lista de favoritos — use os corações nos NFTs')}><img src="/assets/figma/c40be.svg" width="20" height="18" alt="" /></button><button className="scan" aria-label="Scanner indisponível" onClick={() => unavailable('Scanner')}><span className="reference-scan" aria-hidden="true"><img className="scan-line" src="/assets/figma/d5458.svg" alt="" /><img className="scan-tl" src="/assets/figma/ca931.svg" alt="" /><img className="scan-tr" src="/assets/figma/97351.svg" alt="" /><img className="scan-br" src="/assets/figma/db42b.svg" alt="" /><img className="scan-bl" src="/assets/figma/f7581.svg" alt="" /></span></button><CartLink size={20} /><Link to="/account/profile" aria-label="Perfil" onClick={event => { if(session.user) { event.preventDefault(); setAccountOpen(true) } }}><img src="/assets/figma/99dca.svg" width="20" height="20" alt="" /></Link>
      </nav>}
      <Modal title="Funcionalidade indisponível" open={!!notice} onClose={() => setNotice('')}><p>{notice}</p></Modal>
      <Modal title="Minha conta" open={accountOpen} onClose={() => setAccountOpen(false)}><nav className="account-actions" aria-label="Ações da conta"><Link to="/account/profile" onClick={() => setAccountOpen(false)}>Meu perfil</Link><Link to="/account/wallets" search={{ returnTo: '/' }} onClick={() => setAccountOpen(false)}>Carteiras</Link><button onClick={() => { setAccountOpen(false); logout.mutate() }} disabled={logout.isPending}>Encerrar sessão</button><button onClick={() => { setAccountOpen(false); login() }}>Trocar usuário</button></nav></Modal>
    </div>
  </SignOutContext.Provider></NoticeContext.Provider>
}
function Footer({onAccount}: {onAccount:()=>void}) {
  const unavailable = useUnavailable(), session=useSession()
  const groups = [['Meu perfil', 'Meu perfil', 'Minha coleção', 'Atividade', 'Estúdio do criador', 'Lista de interesse'], ['Central de ajuda', 'Central de ajuda', 'Como comprar NFTs', 'Carteira e segurança', 'Política do mercado', 'Denunciar item'], ['Coleções', 'Arte digital', 'Fotografia', 'Música', 'Arte 3D', 'Utilidade']]
  return <footer className="market-footer">
    <div className="benefits">{[['W', 'Segurança da carteira', 'Proteja sua carteira e colecione arte digital verificada com confiança.'], ['C', 'Criadores em destaque', 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.'], ['D', 'Alertas de lançamentos', 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.']].map(([letter, title, description]) => <section key={letter}><span className="medallion">{letter}</span><h3>{title}</h3><p>{description}</p></section>)}
      <section className="newsletter"><h3>Antecipe-se ao próximo lançamento</h3><form onSubmit={(e) => { e.preventDefault(); unavailable('Newsletter') }}><label className="sr-only" htmlFor="newsletter">E-mail da newsletter</label><input id="newsletter" type="email" placeholder="digite seu e-mail..." /><button>Enviar</button></form><p>Receba lançamentos selecionados, histórias de criadores e novidades do mercado.</p></section>
    </div>
    <div className="contact-band"><span className="wordmark">KURIO</span><span>Feito para colecionadores,<br />criadores e cultura</span><button onClick={() => unavailable('Contato')}>contato@email.com</button><span>+55 11 4002 8922</span></div>
    <div className="footer-links">{groups.map(([title, ...links]) => <section key={title}><h3>{title}</h3>{links.map((label) => label === 'Meu perfil' ? <Link to="/account/profile" key={label} onClick={event=>{if(session.user && matchMedia('(max-width:639px)').matches){event.preventDefault();onAccount()}}}>{label}</Link> : <button key={label} onClick={() => unavailable(label)}>{label}</button>)}</section>)}<section><h3>Redes sociais</h3><div className="social-icons">{['99280.svg', 'd48dd.svg', 'b4111.svg', 'b8b84.svg', 'ca2da.svg'].map((asset, i) => <button aria-label={['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube'][i]} key={asset} onClick={() => unavailable('Redes sociais')}><img src={`/assets/figma/${asset}`} width="30" height="30" alt="" /></button>)}</div><h3>Carteiras compatíveis</h3><p className="wallet-chip"><span>METAMASK</span><span>WALLETCONNECT</span><span>COINBASE</span></p></section></div>
    <p className="copyright">© 2026 Kurio. Propriedade digital para todos.</p>
  </footer>
}
