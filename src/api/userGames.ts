import { useQueryClient } from "@tanstack/react-query"
import { useAddMeGames, useUpdateMeGame, getGetMeGamesQueryKey } from "./generated/user-games/user-games"

// Invalidation goes through the generated key helper, never a string literal.
// A stale literal fails silently: the mutation succeeds and the list simply
// never refreshes, which reads as a backend bug and sends you looking in the
// wrong repository.
export const useAddGames = () => {
  const queryClient = useQueryClient()

  return useAddMeGames({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetMeGamesQueryKey() }),
    },
  })
}

export const useUpdateEntry = () => {
  const queryClient = useQueryClient()

  return useUpdateMeGame({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetMeGamesQueryKey() }),
    },
  })
}
