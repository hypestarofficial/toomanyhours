import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export const LIST_LAYOUT = {
  CARDS: "cards",
  ROWS: "rows",
} as const

export type LIST_LAYOUT = (typeof LIST_LAYOUT)[keyof typeof LIST_LAYOUT]

interface AppState {
  filterGenres: number[]
  layout: LIST_LAYOUT
  defaultListConfig: {
    finished: boolean
    currentlyPlaying: boolean
    wantToPlay: boolean
  }
  setDefaultListConfig: (config: { finished: boolean; currentlyPlaying: boolean; wantToPlay: boolean }) => void
  setFilterGenres: (genres: number[]) => void
  setLayout: (layout: LIST_LAYOUT) => void
}

// create<AppState>()(...) — the extra call is required by zustand's typing once
// middleware is involved; omitting it produces a confusing type error.
const useUserSettingsAuthStore = create<AppState>()(
  persist(
    (set) => ({
      filterGenres: [],
      layout: LIST_LAYOUT.CARDS,
      defaultListConfig: {
        finished: true,
        currentlyPlaying: false,
        wantToPlay: false,
      },
      setFilterGenres: (genres: number[]) => set({ filterGenres: genres }),
      setLayout: (layout: LIST_LAYOUT) => set({ layout }),
      setDefaultListConfig: (config: { finished: boolean; currentlyPlaying: boolean; wantToPlay: boolean }) =>
        set({ defaultListConfig: config }),
    }),
    {
      name: "user_settings",
      storage: createJSONStorage(() => localStorage),
      // Only the layout. A genre filter restored on your next visit is
      // indistinguishable from your games having disappeared, which is the
      // worst failure available here — it looks like data loss.
      partialize: (state) => ({ layout: state.layout }),
    },
  ),
)

export default useUserSettingsAuthStore
