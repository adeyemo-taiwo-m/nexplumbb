import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserSession {
  id: string
  type: 'customer' | 'artisan' | 'admin' | 'supplier'
  firstName: string
  name: string
  phone: string
  avatar?: string
  isVerified?: boolean
  isOnline?: boolean       // artisan only
  nexScore?: number        // artisan credit score
}

interface AuthState {
  user: UserSession | null
  token: string | null
  setUser: (user: UserSession | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null })
    }),
    {
      name: 'nexplumb-auth-storage'
    }
  )
)
