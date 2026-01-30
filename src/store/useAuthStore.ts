import { create } from "zustand"
import type { User } from "../types/users"

interface AppState {
  authenticated: boolean
  jwtToken: string
  user: User | null
  setJwtToken: (token: string) => void
  setAuthenticated: (authenticated: boolean) => void
  setUser: (user: User | null) => void
}

const useAuthStore = create<AppState>((set) => ({
  authenticated: false,
  jwtToken: "",
  user: null,
  setJwtToken: (token: string) => set({ jwtToken: token }),
  setAuthenticated: (authenticated: boolean) => set({ authenticated }),
  setUser: (user: User | null) => set({ user }),
}))

export default useAuthStore
