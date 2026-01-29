// hooks/useGamesQuery.ts
import { useQuery } from "@tanstack/react-query"
import { getGames, getGenres, getAdminGames, getGameById } from "./api"
import useAuthStore from "../../store/useAuthStore"
import type { Game, Genre } from "../../types/games"

export const useGamesQuery = ({ title }: { title?: string } = {}) =>
  useQuery<Game[], Error>({
    queryKey: ["games", title],
    queryFn: () => getGames(title ?? ""),
  })

export const useGameByIdQuery = ({ id }: { id: number | null }) =>
  useQuery<Game, Error>({
    queryKey: ["game", id],
    queryFn: () => getGameById(id!),
    enabled: id !== null && id > 0,
  })

export const useGenresQuery = () =>
  useQuery<Genre[], Error>({
    queryKey: ["genres"],
    queryFn: getGenres,
  })

export const useAdminGamesQuery = () => {
  const { jwtToken } = useAuthStore()

  return useQuery<Game[], Error>({
    queryKey: ["admin-games", jwtToken],
    queryFn: () => getAdminGames(jwtToken!),
    enabled: !!jwtToken,
  })
}
