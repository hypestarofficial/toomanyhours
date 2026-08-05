// Hand-written hooks for the endpoints not yet on the generated client.
// Admin's endpoints now come from src/api/generated; these are what remains.
import { useMutation, useQuery } from "@tanstack/react-query"
import { getGames, getGameById, getUserById } from "./api"
import useAuthStore from "../../store/useAuthStore"
import type { Game } from "../../types/games"
import type { User, Visibility } from "../../types/users"
import { patchMe } from "./users"

// The token is deliberately NOT part of any queryKey. It never identified a
// request — the request path and params do — and including it meant every
// token change invalidated the whole cache and refetched everything the app
// had loaded. httpRequest now reads the token itself, at request time.
//
// `enabled: !!jwtToken` stays: without it, queries fire before a token exists
// and 401 on every boot.

// Public endpoints
export const useGamesQuery = ({ title, genreIDs }: { title?: string; genreIDs?: number[] } = {}) => {
  const { jwtToken } = useAuthStore()

  return useQuery<Game[], Error>({
    queryKey: ["games", title, genreIDs],
    queryFn: () => getGames(title ?? "", genreIDs ?? []),
    enabled: !!jwtToken,
  })
}

export const useGameByIdQuery = ({ id }: { id: number | null }) => {
  const { jwtToken } = useAuthStore()

  return useQuery<Game, Error>({
    queryKey: ["game", id],
    queryFn: () => getGameById(id!),
    enabled: id !== null && id > 0 && !!jwtToken,
  })
}

export const usePatchMeMutation = () => {
  const { setUser } = useAuthStore()

  return useMutation<User, Error, { username?: string; visibility?: Visibility }>({
    mutationFn: (body) => patchMe(body),
    // useAuthStore.user is what the whole app renders from, so without this
    // the profile and navbar keep showing the old game tag until a reload.
    onSuccess: (updated) => setUser(updated),
  })
}

export const useGetUserByIdQuery = ({ id }: { id: number }) => {
  const { jwtToken } = useAuthStore()

  return useQuery<User, Error>({
    queryKey: ["user", id],
    queryFn: () => getUserById(id),
    enabled: !!jwtToken,
  })
}
