import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'otto_access_token'
const REFRESH_TOKEN = 'otto_refresh_token'
const LAYOUT_KEY = 'otto_layout'
const USER_KEY = 'otto_user'

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
    layout: 'desktop' | 'mobile'
    setLayout: (layout: 'desktop' | 'mobile') => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  let initToken = ''
  let initRefreshToken = ''
  let initLayout: 'desktop' | 'mobile' = 'desktop'

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

  try {
    const savedLayout = localStorage.getItem(LAYOUT_KEY)
    if (savedLayout === 'mobile' || savedLayout === 'desktop') initLayout = savedLayout
  } catch {
    initLayout = 'desktop'
  }

  let initUser: AuthUser | null = null
  try {
    const savedUser = localStorage.getItem(USER_KEY)
    if (savedUser) initUser = JSON.parse(savedUser)
  } catch {
    initUser = null
  }

  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
          else localStorage.removeItem(USER_KEY)
          return { ...state, auth: { ...state.auth, user } }
        }),
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
      layout: initLayout,
      setLayout: (layout) =>
        set((state) => {
          localStorage.setItem(LAYOUT_KEY, layout)
          return { ...state, auth: { ...state.auth, layout } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(REFRESH_TOKEN)
          localStorage.removeItem(USER_KEY)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '', refreshToken: '' },
          }
        }),
    },
  }
})
