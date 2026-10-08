import { createContext, useContext, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { Search, LogIn, Heart, Home, User, ScanLine } from 'lucide-react'
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
export const useUnavailable = () => useContext(NoticeContext)
export function MarketShell() {
  return <SessionProvider><MarketContent /></SessionProvider>
}
function MarketContent() {
  const session = useSession(), client = useQueryClient()
  const [notice, setNotice] = useState('')
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
  const unavailable = (action: string) => setNotice(`${action} ainda não está disponível nesta etapa. Nenhuma operação foi realizada.`)
  return <NoticeContext.Provider value={unavailable}>
    <div className={`market ${pathname === '/' ? 'home-market' : 'detail-market'}`}>
      <header className="desktop-header">
        <Link to="/" search={defaultCatalogSearch} className="wordmark">KURIO</Link>
        <nav aria-label="Navegação principal"><Link to="/" search={defaultCatalogSearch} className={pathname === '/' ? 'active' : ''}>Início</Link><CatalogLink>Mercado</CatalogLink><button onClick={() => unavailable('Criadores')}>Criadores</button><button onClick={() => unavailable('Aprenda')}>Aprenda</button></nav>
        <div className="header-actions"><button aria-label="Abrir busca" onClick={focusSearch}><Search size={20} /></button><CartLink />{session.user ? <button onClick={() => logout.mutate()} disabled={logout.isPending}>Sair ({session.user.username})</button> : <button className="login-button" onClick={login}><LogIn size={18} />Entrar</button>}</div>
      </header>
      <div className="sr-only" role="status" aria-live="polite">{realtime}</div>
      {realtime && <p className="realtime-notice" role="status">{realtime}</p>}
      {session.notices.filter((message) => message.startsWith('Não foi possível favoritar')).map((message) => <p role="alert" key={message}>{message}</p>)}
      <Outlet />
      {session.user && <div className="session-controls"><p>Sessão: {session.user.username}</p><Link to="/account/profile">Meu perfil</Link><Link to="/account/wallets" search={{ returnTo: '/' }}>Carteiras</Link><button onClick={() => logout.mutate()} disabled={logout.isPending}>Encerrar sessão</button><button onClick={login}>Trocar usuário</button></div>}
      <Footer />
      {pathname === '/' && <nav className="mobile-navigation" aria-label="Navegação mobile">
        <Link to="/" search={defaultCatalogSearch} aria-label="Início"><Home size={20} /></Link><button aria-label="Favoritos" onClick={() => unavailable('Lista de favoritos — use os corações nos NFTs')}><Heart size={20} /></button><button className="scan" aria-label="Scanner indisponível" onClick={() => unavailable('Scanner')}><ScanLine /></button><CartLink size={20} /><Link to="/account/profile" aria-label="Perfil"><User size={20} /></Link>
      </nav>}
      <Modal title="Funcionalidade indisponível" open={!!notice} onClose={() => setNotice('')}><p>{notice}</p></Modal>
    </div>
  </NoticeContext.Provider>
}
function Footer() {
  const unavailable = useUnavailable()
  const groups = [['Meu perfil', 'Meu perfil', 'Minha coleção', 'Atividade', 'Estúdio do criador', 'Lista de interesse'], ['Central de ajuda', 'Central de ajuda', 'Como comprar NFTs', 'Carteira e segurança', 'Política do mercado', 'Denunciar item'], ['Coleções', 'Arte digital', 'Fotografia', 'Música', 'Arte 3D', 'Utilidade']]
  return <footer className="market-footer">
    <div className="benefits">{[['W', 'Segurança da carteira', 'Proteja sua carteira e colecione arte digital verificada com confiança.'], ['C', 'Criadores em destaque', 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.'], ['D', 'Alertas de lançamentos', 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.']].map(([letter, title, description]) => <section key={letter}><span className="medallion">{letter}</span><h3>{title}</h3><p>{description}</p></section>)}
      <section className="newsletter"><h3>Antecipe-se ao próximo lançamento</h3><form onSubmit={(e) => { e.preventDefault(); unavailable('Newsletter') }}><label className="sr-only" htmlFor="newsletter">E-mail da newsletter</label><input id="newsletter" type="email" placeholder="digite seu e-mail..." /><button>Enviar</button></form><p>Receba lançamentos selecionados, histórias de criadores e novidades do mercado.</p></section>
    </div>
    <div className="contact-band"><span className="wordmark">KURIO</span><span>Feito para colecionadores,<br />criadores e cultura</span><button onClick={() => unavailable('Contato')}>contato@email.com</button><span>+55 11 4002 8922</span></div>
    <div className="footer-links">{groups.map(([title, ...links]) => <section key={title}><h3>{title}</h3>{links.map((label) => label === 'Meu perfil' ? <Link to="/account/profile" key={label}>{label}</Link> : <button key={label} onClick={() => unavailable(label)}>{label}</button>)}</section>)}<section><h3>Redes sociais</h3><div className="social-icons">{['99280.svg', 'd48dd.svg', 'b4111.svg', 'b8b84.svg', 'ca2da.svg'].map((asset, i) => <button aria-label={['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube'][i]} key={asset} onClick={() => unavailable('Redes sociais')}><img src={`/assets/figma/${asset}`} width="30" height="30" alt="" /></button>)}</div><h3>Carteiras compatíveis</h3><p className="wallet-chip">METAMASK · WALLETCONNECT · COINBASE</p></section></div>
    <p className="copyright">© 2026 Kurio. Propriedade digital para todos.</p><Link className="proof-link" to="/integration">Abrir prova de integração</Link>
  </footer>
}
