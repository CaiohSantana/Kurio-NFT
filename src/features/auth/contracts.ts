export interface User { id: string; username: string; email: string }
export interface Session { user: User | null; scope: string; expiresAt: number | null; notices: string[]; expired?: boolean }
export interface Credentials { email: string; password: string; username?: string; confirmation?: string }
export interface ApiError { code: string; message: string; fieldErrors?: Record<string, string> }
export function safeReturn(value: unknown): string {
  return typeof value === 'string' && /^\/(?!\/)/.test(value) && !/[\\\r\n]/.test(value) && !/^\/(login|signup)([/?#]|$)/.test(value) ? value : '/'
}
export function authSearch(raw: Record<string, unknown>): { returnTo: string; favorite: string; favoriteMode?: 'remove' } {
  return { returnTo: safeReturn(raw.returnTo), favorite: typeof raw.favorite === 'string' && /^[\w-]+$/.test(raw.favorite) ? raw.favorite : '', ...(raw.favoriteMode === 'remove' ? { favoriteMode: 'remove' as const } : {}) }
}
