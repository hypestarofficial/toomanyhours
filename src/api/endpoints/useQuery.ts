// hooks/useGamesQuery.ts
import { useMutation, useQuery } from "@tanstack/react-query"
import { getGames, getGenres, getAdminGames, getGameById, postGameToGames, putGameByGameId, deleteGameByGameId, getUserById } from "./api"
import useAuthStore from "../../store/useAuthStore"
import type { Game, Genre } from "../../types/games"
import type { ApiGame } from "../types/apiGames"
import type { User, Visibility } from "../../types/users"
import { patchMe } from "./users"

// Public endpoints
export const useGamesQuery = ({ title, genreIDs }: { title?: string; genreIDs?: number[] } = {}) => {
  const { jwtToken } = useAuthStore()

  return useQuery<Game[], Error>({
    queryKey: ["games", title, genreIDs, jwtToken],
    queryFn: () => getGames(title ?? "", genreIDs ?? [], jwtToken!),
    enabled: !!jwtToken,
  })
}

export const useGameByIdQuery = ({ id }: { id: number | null }) => {
  const { jwtToken } = useAuthStore()
  return useQuery<Game, Error>({
    queryKey: ["game", id, jwtToken],
    queryFn: () => getGameById(id!, jwtToken!),
    enabled: id !== null && id > 0 && !!jwtToken,
  })
}

export const useGenresQuery = () => {
  const { jwtToken } = useAuthStore()

  return useQuery<Genre[], Error>({
    queryKey: ["genres", jwtToken],
    queryFn: () => getGenres(jwtToken!),
    enabled: !!jwtToken,
  })
}

// Admin endpoints
export const useAdminGamesQuery = ({ title, genreIDs }: { title?: string; genreIDs?: number[] }) => {
  const { jwtToken } = useAuthStore()

  return useQuery<Game[], Error>({
    queryKey: ["admin-games", title, genreIDs, jwtToken],
    queryFn: () => getAdminGames(title ?? "", genreIDs ?? [], jwtToken!),
    enabled: !!jwtToken,
  })
}

export const usePostGameToGamesMutation = () => {
  const { jwtToken } = useAuthStore()

  return useMutation<Game, Error, ApiGame>({
    mutationFn: (game: ApiGame) => postGameToGames(game, jwtToken!),
  })
}

export const usePutGameByGameIdMutation = () => {
  const { jwtToken } = useAuthStore()

  return useMutation<Game, Error, { gameId: number; game: Omit<ApiGame, "id"> }>({
    mutationFn: ({ gameId, game }: { gameId: number; game: Omit<ApiGame, "id"> }) => putGameByGameId(gameId, game, jwtToken!),
  })
}

export const useDeleteGameByGameIdMutation = () => {
  const { jwtToken } = useAuthStore()

  return useMutation<void, Error, { gameId: number }>({
    mutationFn: ({ gameId }: { gameId: number }) => deleteGameByGameId(gameId, jwtToken!),
  })
}

export const usePatchMeMutation = () => {
  const { jwtToken, setUser } = useAuthStore()

  return useMutation<User, Error, { username?: string; visibility?: Visibility }>({
    mutationFn: (body) => patchMe({ body, jwtToken: jwtToken! }),
    // useAuthStore.user is what the whole app renders from, so without this
    // the profile and navbar keep showing the old username until a reload.
    onSuccess: (updated) => setUser(updated),
  })
}

export const useGetUserByIdQuery = ({ id }: { id: number }) => {
  const { jwtToken } = useAuthStore()

  return useQuery<User, Error>({
    queryKey: ["user", id, jwtToken],
    queryFn: () => getUserById(id, jwtToken!),
    enabled: !!jwtToken,
  })
}
