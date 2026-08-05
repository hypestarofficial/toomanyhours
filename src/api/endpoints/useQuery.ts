// Hand-written hooks for the endpoints not yet on the generated client.
// Admin's endpoints now come from src/api/generated; these are what remains.
import { useMutation, useQuery } from "@tanstack/react-query"
import { getGames, getGameById, getUserById } from "./api"
import useAuthStore from "../../store/useAuthStore"
import type { Game } from "../../types/games"
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
