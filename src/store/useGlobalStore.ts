import { create } from "zustand"

interface AppState {
  isGlobalLoading: boolean
  setIsGlobalLoading: (isLoading: boolean) => void
}

const useGlobalStore = create<AppState>((set) => ({
  isGlobalLoading: false,
  setIsGlobalLoading: (isGlobalLoading: boolean) => set({ isGlobalLoading }),
}))

export default useGlobalStore
