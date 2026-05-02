import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'otto_access_token'
const REFRESH_TOKEN = 'otto_refresh_token'

interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  cabang: string | null
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    refreshToken: string
    setRefreshToken: (refreshToken: string) => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  let initToken = ''
  let initRefreshToken = ''
  
  try {
    const cookieState = getCookie(ACCESS_TOKEN)
    initToken = cookieState ? JSON.parse(cookieState) : ''
  } catch {
    initToken = ''
  }
  
  try {
    const refreshCookieState = getCookie(REFRESH_TOKEN)
    initRefreshToken = refreshCookieState ? JSON.parse(refreshCookieState) : ''
  } catch {
    initRefreshToken = ''
  }
  
  return {
    auth: {
      user: null,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      refreshToken: initRefreshToken,
      setRefreshToken: (refreshToken) =>
        set((state) => {
          setCookie(REFRESH_TOKEN, JSON.stringify(refreshToken))
          return { ...state, auth: { ...state.auth, refreshToken } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(REFRESH_TOKEN)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '', refreshToken: '' },
          }
        }),
    },
  }
})
