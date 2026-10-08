import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'
import { useSession } from '@/features/auth/session'
import { cartOptions } from './api'
export function CartLink({ size = 24 }: { size?: number }) {
  const session = useSession(), query = useQuery(cartOptions(session.scope))
  const count = query.data?.items.reduce((sum, item) => sum + item.quantity, 0)
  return <Link to="/cart" className="cart-nav-link" aria-label={count === undefined ? 'Carrinho, consultando quantidade' : `Carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`}><ShoppingCart size={size} /><span aria-hidden="true" className="cart-badge" data-testid="cart-badge">{count ?? '…'}</span>{query.isError && <span className="sr-only">Falha ao consultar quantidade</span>}</Link>
}
