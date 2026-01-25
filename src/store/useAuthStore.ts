import { create } from "zustand"

interface AppState {
  authenticated: boolean
  setAuthenticated: (authenticated: boolean) => void
}

const useAuthStore = create<AppState>((set) => ({
  authenticated: true,
  setAuthenticated: (authenticated: boolean) => set({ authenticated }),
}))

export default useAuthStore
