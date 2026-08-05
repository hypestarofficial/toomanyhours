// api.ts (Renamed from useApi.ts)
import type { Game, Genre } from "../../types/games"
import type { User } from "../../types/users"
import type { ApiGame } from "../types/apiGames"

interface HttpRequestParams {
  method: "GET" | "POST" | "PUT" | "DELETE"
  url: string
  params?: Record<string, string>
  body?: Record<string, unknown>
  credentials?: RequestCredentials
  authorization?: boolean
}

const BASE_URL = "/api"

export const httpRequest = async ({
  method,
  url,
  params,
  body,
  authorization = false,
  jwtToken,
  credentials,
}: HttpRequestParams & { jwtToken?: string }) => {
  const headers = new Headers()
  headers.append("Content-Type", "application/json")

  if (authorization && jwtToken) {
    headers.append("Authorization", `Bearer ${jwtToken}`)
  }

  const cleanParams = params ? Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== "")) : {}
  const queryString = Object.keys(cleanParams).length > 0 ? `?${new URLSearchParams(cleanParams).toString()}` : ""
  const fullUrl = `${BASE_URL}${url}${queryString}`

  try {
    const response = await fetch(fullUrl, { method, headers, body: body ? JSON.stringify(body) : undefined, credentials: credentials })

    const contentType = response.headers.get("content-type")
    const isJson = contentType && contentType.includes("application/json")

    if (!response.ok) {
      let errorData = { message: `HTTP error ${response.status}` }

      if (isJson) {
        errorData = await response.json().catch(() => ({ message: "Failed to parse error JSON" }))
      }

      throw new Error(`HTTP ${response.status}: ${errorData.message}`)
    }

    if (!isJson || response.status === 204) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

// ENDPOINTS - These are now just simple functions
export const getGames = async (title: string, genreIDs: number[], jwtToken: string): Promise<Game[]> =>
  httpRequest({
    method: "GET",
    url: "/games",
    params: { title, genreIDs: genreIDs.join(",") },
    authorization: true,
    jwtToken: jwtToken,
  }) as Promise<Game[]>

export const getGameById = async (gameId: number, jwtToken: string): Promise<Game> => {
  const url = `/games/${gameId}`

  return httpRequest({
    method: "GET",
    url: url,
    authorization: true,
    jwtToken: jwtToken,
  }) as Promise<Game>
}

export const getGenres = async (jwtToken: string): Promise<Genre[]> =>
  httpRequest({
    method: "GET",
    url: "/genres",
    authorization: true,
    jwtToken: jwtToken,
  }) as Promise<Genre[]>

// Admin endpoints need to accept a token now
export const getAdminGames = async (title: string, genreIDs: number[], jwtToken: string): Promise<Game[]> =>
  httpRequest({
    method: "GET",
    url: "/admin/games",
    params: { title, genreIDs: genreIDs.join(",") },
    authorization: true,
    jwtToken: jwtToken,
  }) as Promise<Game[]>

export const postGameToGames = async (game: ApiGame, jwtToken: string): Promise<Game> =>
  httpRequest({
    method: "POST",
    url: "/admin/games",
    authorization: true,
    jwtToken: jwtToken,
    body: {
      id: Number(game.id),
      title: game.title,
      image: game.image,
      releaseDate: game.releaseDate,
      genreIDs: game.genreIds,
    },
  }) as Promise<Game>

export const putGameByGameId = async (gameId: number, game: Omit<ApiGame, "id">, jwtToken: string): Promise<Game> =>
  httpRequest({
    method: "PUT",
    url: `/admin/games/${gameId}`,
    authorization: true,
    jwtToken: jwtToken,
    body: {
      title: game.title,
      image: game.image,
      releaseDate: game.releaseDate,
      genreIDs: game.genreIds,
    },
  }) as Promise<Game>

export const deleteGameByGameId = async (gameId: number, jwtToken: string): Promise<void> =>
  httpRequest({
    method: "DELETE",
    url: `/admin/games/${gameId}`,
    authorization: true,
    jwtToken: jwtToken,
  }) as Promise<void>

export const getUserById = async (userId: number, jwtToken: string): Promise<User> =>
  httpRequest({
    method: "GET",
    url: `/users/${userId}`,
    authorization: true,
    jwtToken: jwtToken,
  }) as Promise<User>
