import { useQueryClient } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { useAddMeGames, useUpdateMeGame, getGetMeGamesQueryKey } from "./generated/user-games/user-games"
import type { UserGame, UpdateUserGameRequest } from "./generated/models"

// Invalidation goes through the generated key helper, never a string literal.
// A stale literal fails silently: the mutation succeeds and the list simply
// never refreshes, which reads as a backend bug and sends you looking in the
// wrong repository.
export const useAddGames = () => {
  const queryClient = useQueryClient()

  return useAddMeGames({
    mutation: {
      // Invalidating the list is what re-greys the row you just added: the
      // picker derives its owned set from this query, so nothing else needs
      // touching. Search results are IGDB's and do not change when you add a
      // game, which is why the old ["games"] catalog invalidation is gone.
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

type MoveVariables = { gameId: number; data: UpdateUserGameRequest }
type MoveContext = { previous?: UserGame[] }

// Extracted from the hook so the cache behaviour can be tested without
// rendering anything. Rollback is the part that breaks silently: when it stops
// working the UI shows a move that never happened, and nothing disagrees until
// the page is reloaded.
export const moveEntryMutationOptions = (queryClient: QueryClient) => {
  const listKey = getGetMeGamesQueryKey()

  return {
    listKey,

    onMutate: async ({ gameId, data }: MoveVariables): Promise<MoveContext> => {
      // Cancel first. An in-flight GET that resolves after the optimistic
      // write would overwrite it with pre-move data, and the card would drift
      // back to where it started with no error reported anywhere.
      await queryClient.cancelQueries({ queryKey: listKey })

      const previous = queryClient.getQueryData<UserGame[]>(listKey)

      queryClient.setQueryData<UserGame[]>(listKey, (entries) =>
        // Only the category changes — the same promise the server makes, so
        // the optimistic state and the eventual response agree.
        entries?.map((entry) => (entry.gameId === gameId ? { ...entry, category: data.category ?? entry.category } : entry)),
      )

      return { previous }
    },

    onError: (_error: unknown, _variables: MoveVariables, context?: MoveContext) => {
      if (context?.previous) {
        queryClient.setQueryData(listKey, context.previous)
      }
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: listKey }),
  }
}

export const useMoveEntry = () => {
  const queryClient = useQueryClient()
  const options = moveEntryMutationOptions(queryClient)

  return useUpdateMeGame({
    mutation: {
      onMutate: options.onMutate,
      onError: options.onError,
      onSettled: options.onSettled,
    },
  })
}
