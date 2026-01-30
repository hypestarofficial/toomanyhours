// hooks/useGamesQuery.ts
import { useQuery } from "@tanstack/react-query"
import { getGames, getGenres, getAdminGames, getGameById } from "./api"
import useAuthStore from "../../store/useAuthStore"
import type { Game, Genre } from "../../types/games"

export const useGamesQuery = ({ title }: { title?: string } = {}) => {
  const { jwtToken } = useAuthStore()

  return useQuery<Game[], Error>({
    queryKey: ["games", title, jwtToken],
    queryFn: () => getGames(title ?? "", jwtToken!),
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

export const useAdminGamesQuery = () => {
  const { jwtToken } = useAuthStore()

  return useQuery<Game[], Error>({
    queryKey: ["admin-games", jwtToken],
    queryFn: () => getAdminGames(jwtToken!),
    enabled: !!jwtToken,
  })
}
