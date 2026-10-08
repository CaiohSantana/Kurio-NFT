import { Link, useSearch } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useUnavailable } from '@/features/catalog/MarketShell'
export function AccountLayout({ title, children }: { title: string; children: ReactNode }) {
  const unavailable = useUnavailable(), search = useSearch({ strict: false })
  return <main className="account-layout"><aside><h2>Meu perfil</h2><nav aria-label="Minha conta"><Link to="/account/profile">Dados do perfil</Link><Link to="/account/wallets" search={{ returnTo: typeof search.returnTo === 'string' ? search.returnTo : '/' }}>Carteiras</Link>{['Atividade', 'Lista de interesse', 'Ofertas', 'Arquivos baixados', 'Suporte'].map((name) => <button key={name} onClick={() => unavailable(name)}>{name}</button>)}</nav></aside><section><h1>{title}</h1>{children}</section></main>
}
