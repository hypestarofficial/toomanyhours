import { create } from "zustand"

interface AppState {
  authenticated: boolean
  jwtToken: string
  setJwtToken: (token: string) => void
  setAuthenticated: (authenticated: boolean) => void
}

const useAuthStore = create<AppState>((set) => ({
  authenticated: false,
  jwtToken: "",
  setJwtToken: (token: string) => set({ jwtToken: token }),
  setAuthenticated: (authenticated: boolean) => set({ authenticated }),
}))

export default useAuthStore
