import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/Field'
import { EnsField } from '@/shared/ui/EnsField'
import { Skeleton } from '@/shared/ui/skeleton'
import { http } from '@/shared/api/http'
import { activeScope, apiFields, apiMessage, reportExpired, scopedConfig, sessionKey, useSession } from '@/features/auth/session'
import { AccountLayout } from './AccountLayout'
import { profileKey, profileOptions } from './api'
import type { PasswordInput, ProfileInput } from './contracts'
import { Image } from 'lucide-react'

export function ProfilePage() {
  const session = useSession(), client = useQueryClient(), query = useQuery(profileOptions(session.scope))
  const saved = async () => { if (activeScope(client, session.scope)) await Promise.all([client.invalidateQueries({ queryKey: profileKey(session.scope) }), client.invalidateQueries({ queryKey: sessionKey })]) }
  const failure = (error: unknown) => reportExpired(error, session.scope)
  const edit = useMutation({ mutationFn: async (body: ProfileInput) => http.patch('/profile', body, scopedConfig(session.scope)), onSuccess: saved, onError: failure })
  const picture = useMutation({ mutationFn: async (file: File | null) => {
    if (!file) return http.delete('/profile/avatar', scopedConfig(session.scope))
    const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error('Leitura da imagem falhou.')); reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(file) })
    return http.put('/profile/avatar', { data }, scopedConfig(session.scope))
  }, onSuccess: saved, onError: failure })
  const changePassword = useMutation({ mutationFn: async (body: PasswordInput) => http.patch('/profile/password', body, scopedConfig(session.scope)), onError: failure })
  const fields = apiFields(edit.error), passwordErrors = apiFields(changePassword.error)
  return <AccountLayout title="Perfil do colecionador">{query.isPending ? <Skeleton className="account-skeleton" /> : !query.data ? <div role="alert"><p>{apiMessage(query.error)}</p><Button onClick={() => void query.refetch()}>Tentar novamente</Button></div> : <>
    <form aria-label="Dados do perfil" onSubmit={(event) => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); edit.mutate({ displayName: String(data.displayName), username: String(data.username), email: String(data.email), nickname: String(data.nickname), ens: String(data.ens) }) }}><div className="form-grid">{([['displayName', 'Nome de exibição'], ['username', 'Nome de usuário'], ['email', 'E-mail'], ['ens', 'Nome ENS'], ['nickname', 'Apelido da carteira']] as const).map(([name, label]) => name === 'ens' ? <EnsField key={name} value={query.data.ens} error={fields.ens} /> : <Field key={name} name={name} label={label} value={query.data[name]} type={name === 'email' ? 'email' : 'text'} required error={fields[name]} />)}<div className="avatar-field"><label htmlFor="avatar-file">Avatar</label><div>{query.data.avatar ? <img data-testid="avatar" src={query.data.avatar} width="50" height="50" alt="Avatar do colecionador" /> : <span className="avatar-placeholder" aria-label="Sem avatar"><Image size={22} /></span>}<label className="avatar-change" htmlFor="avatar-file">Alterar</label><input className="sr-only" aria-label="Avatar" id="avatar-file" type="file" accept="image/png,image/jpeg,image/webp" aria-describedby={picture.isError ? 'avatar-error' : undefined} onChange={(event) => { const file = event.target.files?.[0]; if (file) picture.mutate(file) }} /><Button type="button" variant="outline" disabled={picture.isPending || !query.data.avatar} onClick={() => picture.mutate(null)}>Remover avatar</Button></div>{picture.isError && <p id="avatar-error" role="alert">{apiMessage(picture.error)}</p>}</div></div>{edit.isError && <p role="alert">{apiMessage(edit.error)}</p>}{edit.isSuccess && <p role="status">Perfil salvo.</p>}<Button disabled={edit.isPending}>{edit.isPending ? 'Salvando…' : 'Salvar perfil'}</Button></form>
    <form className="password-form" aria-label="Alterar senha" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget, data = new FormData(form); changePassword.mutate({ currentPassword: String(data.get('currentPassword')), password: String(data.get('password')), confirmation: String(data.get('confirmation')) }, { onSuccess: () => form.reset() }) }}><h2>Alterar senha</h2><Field name="currentPassword" label="Senha atual" type="password" required requiredMarker={false} error={passwordErrors.currentPassword} /><Field name="password" label="Nova senha" type="password" required requiredMarker={false} error={passwordErrors.password} /><Field name="confirmation" label="Confirmar nova senha" type="password" required requiredMarker={false} error={passwordErrors.confirmation} />{changePassword.isError && <p role="alert">{apiMessage(changePassword.error)}</p>}{changePassword.isSuccess && <p role="status">Senha alterada.</p>}<Button disabled={changePassword.isPending}>Salvar senha</Button></form>
  </>}</AccountLayout>
}
