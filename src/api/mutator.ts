import useAuthStore from "../store/useAuthStore"
import { ApiError } from "./apiError"
import { withAuthRetry } from "./session"

// Matches httpRequest's BASE_URL. vite.config.ts proxies /api/* to the API host
// and strips the prefix, so this must stay in step with that rewrite rule.
const BASE_URL = "/api"

// The shape Orval passes. Confirmed against the generated output rather than
// assumed: generated operations call customFetch({ url, method, ... }, options),
// i.e. a single config object, not (url, RequestInit).
export type FetchConfig = {
  url: string
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  params?: Record<string, string | number | boolean | undefined | null>
  data?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

// Orval's `request` option is typed as the second parameter of this function,
// so declaring it lets callers pass per-request header overrides.
export type FetchOptions = {
  headers?: Record<string, string>
}

export const customFetch = async <T>(config: FetchConfig, options?: FetchOptions): Promise<T> =>
  withAuthRetry(async () => {
    const { url, method, params, data, headers: configHeaders, signal } = config

    // Read inside the retry closure, not outside. After a refresh the retry
    // must pick up the NEW token; reading once outside would resend the
    // expired one and 401 again, ending a session that was actually fine.
    //
    // getState() rather than useAuthStore() because this is a plain function,
    // not a component.
    const { jwtToken } = useAuthStore.getState()

    const headers = new Headers({ ...configHeaders, ...options?.headers })
    headers.set("Content-Type", "application/json")
    if (jwtToken) {
      headers.set("Authorization", `Bearer ${jwtToken}`)
    }

    // Drop empty and absent params, matching httpRequest — the API treats an
    // empty `title` as "no filter", but only if the key is absent entirely.
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value))
      }
    }
    const queryString = query.size > 0 ? `?${query.toString()}` : ""

    const response = await fetch(`${BASE_URL}${url}${queryString}`, {
      method,
      headers,
      signal,
      credentials: "include",
      body: data === undefined ? undefined : JSON.stringify(data),
    })

    const contentType = response.headers.get("content-type")
    const isJson = contentType !== null && contentType.includes("application/json")

    if (!response.ok) {
      const errorBody = isJson ? await response.json().catch(() => null) : null
      // ApiError rather than Error: withAuthRetry needs the status to tell a
      // 401 from any other failure. handleError() still reads .message.
      throw new ApiError(response.status, `HTTP ${response.status}: ${errorBody?.message ?? response.statusText}`, errorBody)
    }

    if (!isJson || response.status === 204) {
      return null as T
    }

    return (await response.json()) as T
  })
