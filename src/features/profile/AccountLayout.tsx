import { Link, useSearch } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useUnavailable, useSignOut } from '@/features/catalog/MarketShell'
import { UserRound, MapPin, ShoppingCart, Heart, BadgeDollarSign, Download, TriangleAlert, LogOut } from 'lucide-react'
export function AccountLayout({ title, children }: { title: string; children: ReactNode }) {
  const unavailable = useUnavailable(), signOut = useSignOut(), search = useSearch({ strict: false })
  return <main className="account-layout"><aside><h2>Meu perfil</h2><nav aria-label="Minha conta"><Link to="/account/profile" activeProps={{ className: 'active' }}><UserRound size={16} />Dados do perfil</Link><Link to="/account/wallets" activeProps={{ className: 'active' }} search={{ returnTo: typeof search.returnTo === 'string' ? search.returnTo : '/' }}><MapPin size={16} />Carteiras</Link>{([['Atividade', ShoppingCart], ['Lista de interesse', Heart], ['Ofertas', BadgeDollarSign], ['Arquivos baixados', Download], ['Suporte', TriangleAlert]] as const).map(([name, Icon]) => <button key={name} onClick={() => unavailable(name)}><Icon size={16} />{name}</button>)}<button className="account-signout" onClick={signOut}><LogOut size={16} />Sair</button></nav></aside><section><h1>{title}</h1>{children}</section></main>
}
