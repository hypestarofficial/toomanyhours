// The hand-written fetch wrapper. Everything that reads or writes cached
// server data is generated now; what stays here is httpRequest itself, which
// the generated mutator does not replace, plus the auth and /me calls that
// manage cookies and store state rather than cached data.
import useAuthStore from "../../store/useAuthStore"
import { ApiError } from "../apiError"
import { withAuthRetry } from "../session"

interface HttpRequestParams {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  url: string
  params?: Record<string, string>
  body?: Record<string, unknown>
  credentials?: RequestCredentials
  authorization?: boolean
}

const BASE_URL = "/api"

export const httpRequest = async ({ method, url, params, body, authorization = false, credentials }: HttpRequestParams) =>
  withAuthRetry(async () => {
    // Read per attempt, so a retry after a refresh carries the new token. This
    // previously took jwtToken as an argument captured when the calling hook
    // rendered, which made retry impossible: the retry would resend the
    // expired token, 401 again, and end a session that was actually fine.
    const { jwtToken } = useAuthStore.getState()

    const headers = new Headers()
    headers.append("Content-Type", "application/json")

    if (authorization && jwtToken) {
      headers.append("Authorization", `Bearer ${jwtToken}`)
    }

    const cleanParams = params ? Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== "")) : {}
    const queryString = Object.keys(cleanParams).length > 0 ? `?${new URLSearchParams(cleanParams).toString()}` : ""
    const fullUrl = `${BASE_URL}${url}${queryString}`

    const response = await fetch(fullUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: credentials,
    })

    const contentType = response.headers.get("content-type")
    const isJson = contentType !== null && contentType.includes("application/json")

    if (!response.ok) {
      const errorBody = isJson ? await response.json().catch(() => null) : null
      // ApiError rather than Error: withAuthRetry needs the status to tell a
      // 401 from any other failure.
      throw new ApiError(response.status, `HTTP ${response.status}: ${errorBody?.message ?? response.statusText}`, errorBody)
    }

    if (!isJson || response.status === 204) {
      return null
    }

    return await response.json()
  })
