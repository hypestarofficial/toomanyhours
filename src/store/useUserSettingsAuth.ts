import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
// The dependency points this way on purpose. LIST_LAYOUT is declared here, so
// declaring SORT_FIELD here too would look consistent — but src/list/sort.ts is
// a tested module, and importing this store into sort.test.ts would evaluate
// createJSONStorage(() => localStorage) under Vitest's node environment, where
// localStorage does not exist. Do not flip it for tidiness.
import { NATURAL_DIRECTION, SORT_DIRECTION, SORT_FIELD } from "../list/sort"

export const LIST_LAYOUT = {
  CARDS: "cards",
  ROWS: "rows",
} as const

export type LIST_LAYOUT = (typeof LIST_LAYOUT)[keyof typeof LIST_LAYOUT]

interface AppState {
  filterGenres: number[]
  layout: LIST_LAYOUT
  sortField: SORT_FIELD
  sortDirection: SORT_DIRECTION
  defaultListConfig: {
    finished: boolean
    currentlyPlaying: boolean
    wantToPlay: boolean
  }
  setDefaultListConfig: (config: { finished: boolean; currentlyPlaying: boolean; wantToPlay: boolean }) => void
  setFilterGenres: (genres: number[]) => void
  setLayout: (layout: LIST_LAYOUT) => void
  setSort: (field: SORT_FIELD, direction: SORT_DIRECTION) => void
}

// create<AppState>()(...) — the extra call is required by zustand's typing once
// middleware is involved; omitting it produces a confusing type error.
const useUserSettingsAuthStore = create<AppState>()(
  persist(
    (set) => ({
      filterGenres: [],
      layout: LIST_LAYOUT.CARDS,
      sortField: SORT_FIELD.RATING,
      sortDirection: NATURAL_DIRECTION[SORT_FIELD.RATING],
      defaultListConfig: {
        finished: true,
        currentlyPlaying: false,
        wantToPlay: false,
      },
      setFilterGenres: (genres: number[]) => set({ filterGenres: genres }),
      setLayout: (layout: LIST_LAYOUT) => set({ layout }),
      // One setter rather than two: the pair changes together whenever a field
      // is picked, and separate setters would make that two renders with an
      // intermediate state where the direction does not belong to the field.
      setSort: (field: SORT_FIELD, direction: SORT_DIRECTION) => set({ sortField: field, sortDirection: direction }),
      setDefaultListConfig: (config: { finished: boolean; currentlyPlaying: boolean; wantToPlay: boolean }) =>
        set({ defaultListConfig: config }),
    }),
    {
      name: "user_settings",
      storage: createJSONStorage(() => localStorage),
      // Layout and sort, not the filters. A genre filter restored on your next
      // visit is indistinguishable from your games having disappeared, which
      // is the worst failure available here — it looks like data loss. A
      // restored sort has no such mode: every game is still on screen, in a
      // different order.
      //
      // Entries written before sort existed carry neither key; persist merges
      // the stored partial over the initial state, so they default to Rating,
      // highest first, rather than restoring undefined.
      partialize: (state) => ({ sortField: state.sortField, sortDirection: state.sortDirection, layout: state.layout }),
    },
  ),
)

export default useUserSettingsAuthStore
