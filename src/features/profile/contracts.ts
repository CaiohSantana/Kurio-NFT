import type { User } from '@/features/auth/contracts'
export interface Profile extends User { displayName: string; nickname: string; ens: string; avatar: string | null }
export type ProfileInput = Pick<Profile, 'username' | 'email' | 'displayName' | 'nickname' | 'ens'>
export interface PasswordInput { currentPassword: string; password: string; confirmation: string }
