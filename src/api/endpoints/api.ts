// api.ts (Renamed from useApi.ts)
import type { Game, Genre } from "../../types/games"

interface HttpRequestParams {
  method: "GET" | "POST" | "PUT"
  url: string
  params?: Record<string, string>
  authorization?: boolean
}

const BASE_URL = "/api"

const httpRequest = async ({ method, url, params, authorization = false, jwtToken }: HttpRequestParams & { jwtToken?: string }) => {
  const headers = new Headers()
  headers.append("Content-Type", "application/json")

  if (authorization && jwtToken) {
    headers.append("Authorization", `Bearer ${jwtToken}`)
  }
  const cleanParams = params ? Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== "")) : {}
  const queryString = Object.keys(cleanParams).length > 0 ? `?${new URLSearchParams(cleanParams).toString()}` : ""
  const fullUrl = `${BASE_URL}${url}${queryString}`

  try {
    const response = await fetch(fullUrl, { method, headers })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      throw new Error(`HTTP ${response.status}: ${errorData.message}`)
    }
    return await response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

// ENDPOINTS - These are now just simple functions
export const getGames = async (title: string): Promise<Game[]> =>
  httpRequest({
    method: "GET",
    url: "/games",
    params: { title },
  }) as Promise<Game[]>

export const getGameById = async (gameId: number): Promise<Game> => {
  const url = `/games/${gameId}`

  return httpRequest({
    method: "GET",
    url: url,
  }) as Promise<Game>
}

export const getGenres = async (): Promise<Genre[]> =>
  httpRequest({
    method: "GET",
    url: "/genres",
  }) as Promise<Genre[]>

// Admin endpoints need to accept a token now
export const getAdminGames = async (jwtToken: string): Promise<Game[]> =>
  httpRequest({
    method: "GET",
    url: "/admin/games",
    authorization: true,
    jwtToken: jwtToken,
  }) as Promise<Game[]>
