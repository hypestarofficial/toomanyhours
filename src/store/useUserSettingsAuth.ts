import { create } from "zustand"

interface AppState {
  filterGenres: number[]
  defaultListConfig: {
    finished: boolean
    currentlyPlaying: boolean
    wantToPlay: boolean
  }
  setDefaultListConfig: (config: { finished: boolean; currentlyPlaying: boolean; wantToPlay: boolean }) => void
  setFilterGenres: (genres: number[]) => void
}

const useUserSettingsAuthStore = create<AppState>((set) => ({
  filterGenres: [],
  defaultListConfig: {
    finished: true,
    currentlyPlaying: false,
    wantToPlay: false,
  },
  setFilterGenres: (genres: number[]) => set({ filterGenres: genres }),
  setDefaultListConfig: (config: { finished: boolean; currentlyPlaying: boolean; wantToPlay: boolean }) =>
    set({ defaultListConfig: config }),
}))

export default useUserSettingsAuthStore
