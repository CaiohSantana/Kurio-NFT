import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { sessionKey, useSession } from './session'
import type { Session } from './contracts'
export function RequireSession({ children }: { children: ReactNode }) {
  const session = useSession(), location = useLocation(), navigate = useNavigate(), client = useQueryClient()
  const [returnTo] = useState(() => location.href)
  // Query notifications are batched. Login may navigate before Context renders
  // the just-written session; check the authoritative cache before redirecting.
  useEffect(() => { if (!client.getQueryData<Session>(sessionKey)?.user) void navigate({ to: '/login', search: { returnTo, favorite: '' }, replace: true }) }, [session.user, client, navigate, returnTo])
  return session.user ? children : <p role="status">Entre para acessar este conteúdo.</p>
}
