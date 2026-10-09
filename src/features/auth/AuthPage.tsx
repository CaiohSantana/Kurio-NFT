import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import { Modal } from '@/shared/ui/modal'
import { Button } from '@/shared/ui/button'
import { http } from '@/shared/api/http'
import { defaultCatalogSearch } from '@/features/catalog/contracts'
import { CatalogPage } from '@/features/catalog/CatalogPage'
import { apiMessage, replaceSession, scopedConfig, useSession } from './session'
import { authSearch, type ApiError, type Credentials, type Session } from './contracts'

export function AuthPage({ signup = false }: { signup?: boolean }) {
  const search = authSearch(useSearch({ strict: false })), navigate = useNavigate()
  const [mobile] = useState(() => matchMedia('(max-width:639px)').matches)
  const close = () => { void navigate({ href: search.returnTo }) }
  return mobile ? <main className="auth-page"><Link to="/" search={defaultCatalogSearch} className="auth-brand">KURIO</Link><h1>{signup ? 'Criar perfil de colecionador' : 'Entrar'}</h1><AuthForm signup={signup} /></main> : <><CatalogPage /><Modal title={signup ? 'Criar conta' : 'Entrar'} open onClose={close}><div className="auth-modal"><AuthForm signup={signup} /></div></Modal></>
}
function AuthForm({ signup }: { signup: boolean }) {
  const mobile = matchMedia('(max-width:639px)').matches
  const client = useQueryClient(), navigate = useNavigate(), search = authSearch(useSearch({ strict: false }))
  const session = useSession()
  const [show, setShow] = useState(false), [showConfirmation,setShowConfirmation] = useState(false), [auxiliary, setAuxiliary] = useState('')
  const mutation = useMutation({ retry: false, mutationFn: async (body: Credentials) => {
    const result = (await http.post<Session>(signup ? '/accounts' : '/session', body)).data
    if (search.favorite) {
      try { await http.request({ ...scopedConfig(result.scope), method: search.favoriteMode === 'remove' ? 'DELETE' : 'PUT', url: `/favorites/${search.favorite}` }) }
      catch (error) { result.notices.push(`Não foi possível favoritar ${search.favorite}: ${apiMessage(error)}. Use o coração para tentar novamente.`) }
    }
    await replaceSession(client, result)
    return result
  }, onSuccess: () => { void navigate({ href: search.returnTo }) } })
  const errors = isAxiosError<ApiError>(mutation.error) ? mutation.error.response?.data.fieldErrors ?? {} : {}
  const fields = [...(signup ? [['username', 'Nome de usuário', 'text']] : []), ['email', 'E-mail', 'email'], ['password', 'Senha', show ? 'text' : 'password'], ...(signup ? [['confirmation', 'Confirmar senha', (mobile ? showConfirmation : show) ? 'text' : 'password']] : [])]
  return <div className="auth-form"><div className="auth-tabs"><Link to="/login" search={search}>Entrar</Link><span>|</span><Link to="/signup" search={search}>Criar conta</Link></div><p className="auth-intro">{signup ? 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.' : 'Entre para gerenciar sua carteira, coleção e perfil de criador.'}</p>
    {session.expired && <p role="alert">Sua sessão expirou. Entre novamente para continuar.</p>}
    <form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); mutation.mutate({ email: String(data.get('email')), password: String(data.get('password')), username: String(data.get('username') ?? ''), confirmation: String(data.get('confirmation') ?? '') }) }}>
      {fields.map(([name, label, type]) => <div className="auth-field" key={name}><label className="sr-only" htmlFor={`auth-${name}`}>{label}</label><div><input id={`auth-${name}`} name={name} placeholder={name === 'email' ? 'Digite seu e-mail' : label} type={type} required minLength={name === 'username' ? 3 : name === 'password' || name === 'confirmation' ? 8 : undefined} maxLength={name === 'username' ? 32 : name === 'email' ? 254 : 128} autoComplete={name === 'password' ? signup ? 'new-password' : 'current-password' : name === 'confirmation' ? 'new-password' : name} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `error-${name}` : undefined} />{(name === 'password' || name === 'confirmation') && <button type="button" aria-label={name === 'confirmation' ? (showConfirmation ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha') : show ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => name === 'confirmation' ? setShowConfirmation(!showConfirmation) : setShow(!show)}>{(name === 'confirmation' ? showConfirmation : show) ? <EyeOff size={18} /> : <Eye size={18} />}</button>}</div>{errors[name] && <p id={`error-${name}`}>{errors[name]}</p>}</div>)}
      {!signup && <button type="button" className="forgot" onClick={() => setAuxiliary('Recuperação de senha indisponível no momento.')}>Esqueceu a senha?</button>}
      {mutation.isError && <p role="alert">{apiMessage(mutation.error)}{search.favorite && ' A intenção de favoritar permanece no endereço; tente novamente.'}</p>}
      <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Aguarde…' : signup ? mobile ? 'Criar perfil' : 'Criar conta' : 'Entrar'}</Button>
    </form><div className="auth-social"><p>Ou continue com</p>{['Google', 'Facebook'].map((provider) => <Button key={provider} variant="outline" onClick={() => setAuxiliary(`Autenticação com ${provider} fora do escopo. Nenhuma sessão foi criada.`)}><SocialIcon provider={provider} />Continuar com {provider}</Button>)}</div>{auxiliary && <p role="status">{auxiliary}</p>}{mobile && <Link className="auth-switch" to={signup ? '/login' : '/signup'} search={search}>{signup ? 'Já tem uma conta? Entre' : 'Novo na Kurio? Crie uma conta'}</Link>}
  </div>
}

function SocialIcon({ provider }: { provider: string }) {
  if (provider === 'Facebook') return <img src="/assets/figma/5561e.svg" width="20" height="20" alt="" />
  return <span className="google-mark" aria-hidden="true">{[['5f1dc.svg', 1.4219, 0, 15.1771, 8.4648], ['a3c98.svg', 0, 4.9375, 4.9492, 10.125], ['88a3c.svg', 1.4219, 11.5352, 15.0117, 8.4648], ['75804.svg', 10, 14.2656, 6.4336, 5.7344], ['1174b.svg', 10, 8, 10, 9.9492]].map(([file, left, top, width, height]) => <img key={file} src={`/assets/figma/${file}`} alt="" style={{ left: Number(left), top: Number(top), width: Number(width), height: Number(height) }} />)}</span>
}
