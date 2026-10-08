import type { Profile, ProfileInput, PasswordInput } from '@/features/profile/contracts'
import { providers, type WalletInput, type WalletsResponse } from '@/features/wallets/contracts'
import { networks } from '@/features/catalog/contracts'
import { account, allAccounts, authorize, CommerceError, hash, save, type Account } from './commerce-state'

function profileOf(a: Account): Profile { return { id: a.id, username: a.username, email: a.email, displayName: a.username, nickname: `${a.username}-wallet`, ens: '', avatar: null, ...a.profile } }
function errors(fields: Record<string, string>) { if (Object.keys(fields).length) throw new CommerceError(422, 'VALIDATION', 'Revise os campos.', fields) }
function identity(input: { displayName: string; username: string; email: string; ens: string; nickname: string }) {
  const fields: Record<string, string> = {}
  if (typeof input.displayName !== 'string' || input.displayName.trim().length < 2 || input.displayName.length > 64) fields.displayName = 'Informe de 2 a 64 caracteres.'
  if (typeof input.username !== 'string' || !/^[\w-]{3,32}$/.test(input.username)) fields.username = 'Use de 3 a 32 letras, números, _ ou -.'
  if (typeof input.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) fields.email = 'Informe um e-mail válido.'
  if (typeof input.nickname !== 'string' || input.nickname.trim().length < 2 || input.nickname.length > 32) fields.nickname = 'Informe de 2 a 32 caracteres.'
  if (input.ens && (typeof input.ens !== 'string' || !/^[a-z\d-]+(?:\.[a-z\d-]+)*\.eth$/i.test(input.ens) || input.ens.length > 128)) fields.ens = 'Informe um ENS terminado em .eth ou deixe vazio.'
  return fields
}
export async function profile(scope: string | null) { return profileOf(await account(scope)) }
export async function editProfile(scope: string | null, input: ProfileInput) {
  const a = await account(scope); errors(identity(input))
  if ((await allAccounts()).some((other) => other.id !== a.id && (other.email.toLowerCase() === input.email.toLowerCase() || other.username.toLowerCase() === input.username.toLowerCase()))) throw new CommerceError(409, 'ACCOUNT_CONFLICT', 'E-mail ou usuário já utilizado.', { email: 'Escolha outro e-mail ou usuário.' })
  await authorize(scope, true)
  a.profile = { ...profileOf(a), displayName: input.displayName.trim(), nickname: input.nickname.trim(), ens: input.ens.trim() }
  // Identity stays canonical on Account; never duplicate username/email/id in profile persistence.
  const { displayName, nickname, ens, avatar } = a.profile
  a.profile = { displayName, nickname, ens, avatar }; a.username = input.username; a.email = input.email.toLowerCase(); save(); return profileOf(a)
}
export async function avatar(scope: string | null, data: string | null) {
  const a = await account(scope)
  if (data !== null) {
    const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z\d+/=]+)$/.exec(data)
    if (!match || match[2].length > 2 * 1024 * 1024 * 4 / 3 + 4) throw new CommerceError(422, 'AVATAR_INVALID', 'Use PNG, JPEG ou WebP de até 2 MB.', { avatar: 'Imagem inválida ou maior que 2 MB.' })
    try { const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0)); const bitmap = await createImageBitmap(new Blob([bytes], { type: match[1] })); bitmap.close() }
    catch { throw new CommerceError(422, 'AVATAR_INVALID', 'Não foi possível decodificar a imagem.', { avatar: 'Arquivo não contém uma imagem válida.' }) }
  }
  await authorize(scope, true)
  const p = profileOf(a); a.profile = { displayName: p.displayName, nickname: p.nickname, ens: p.ens, avatar: data }; save(); return profileOf(a)
}
export async function password(scope: string | null, input: PasswordInput) {
  const a = await account(scope)
  if (typeof input.currentPassword !== 'string' || await hash(input.currentPassword, a.salt) !== a.hash) throw new CommerceError(422, 'PASSWORD_INVALID', 'Senha atual incorreta.', { currentPassword: 'Confira a senha atual.' })
  errors({ ...(typeof input.password !== 'string' || input.password.length < 8 || input.password.length > 128 ? { password: 'Use de 8 a 128 caracteres.' } : {}), ...(input.password !== input.confirmation ? { confirmation: 'As senhas não coincidem.' } : {}) })
  const salt = [...crypto.getRandomValues(new Uint8Array(16))].map((v) => v.toString(16).padStart(2, '0')).join(''), result = await hash(input.password, salt)
  await authorize(scope, true); a.salt = salt; a.hash = result; save(); return { message: 'Senha alterada.' }
}
export async function wallets(scope: string | null): Promise<WalletsResponse> { const a = await account(scope); return { items: structuredClone(a.wallets ?? []), reusePrimary: a.reusePrimary ?? false } }
export async function editWallet(scope: string | null, input: WalletInput, id?: string) {
  const a = await account(scope), existing = id && a.wallets?.find((w) => w.id === id)
  if (id && !existing) throw new CommerceError(404, 'NOT_FOUND', 'Carteira inexistente nesta conta.')
  const fields = identity(input)
  if (!networks.includes(input.network)) fields.network = 'Selecione uma rede.'
  if (!providers.includes(input.provider)) fields.provider = 'Selecione um tipo de carteira.'
  if (!['primary', 'secondary'].includes(input.kind)) fields.kind = 'Tipo de registro inválido.'
  if (typeof input.address !== 'string' || !(input.network === 'Solana' ? /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input.address) : /^0x[a-fA-F\d]{40}$/.test(input.address))) fields.address = 'Endereço incompatível com a rede selecionada.'
  if ((input.referral?.length ?? 0) > 64) fields.referral = 'Use até 64 caracteres.'
  if ((input.secondaryReference?.length ?? 0) > 128) fields.secondaryReference = 'Use até 128 caracteres.'
  errors(fields)
  if ((a.wallets ?? []).some((w) => w.id !== id && (w.kind === input.kind || w.network === input.network && (input.network === 'Solana' ? w.address === input.address : w.address.toLowerCase() === input.address.toLowerCase())))) throw new CommerceError(409, 'WALLET_CONFLICT', 'Carteira ou endereço já cadastrado.', { address: 'Não duplique o registro; use Igual à principal para reutilizar.' })
  const wallet = { ...input, address: input.network === 'Solana' ? input.address : input.address.toLowerCase(), id: id ?? crypto.randomUUID() }
  await authorize(scope, true)
  a.wallets = [...(a.wallets ?? []).filter((w) => w.id !== id), wallet]; save(); return wallets(scope)
}
export async function reusePrimary(scope: string | null, enabled: boolean) {
  const a = await account(scope)
  if (enabled && !a.wallets?.some((w) => w.kind === 'primary')) throw new CommerceError(422, 'WALLET_REQUIRED', 'Cadastre a carteira principal primeiro.')
  a.reusePrimary = enabled; save(); return wallets(scope)
}
