import useAuthStore from "../store/useAuthStore"

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

export const customFetch = async <T>(config: FetchConfig, options?: FetchOptions): Promise<T> => {
  const { url, method, params, data, headers: configHeaders, signal } = config

  // The token is read imperatively rather than through useAuthStore(), because
  // this is a plain function and not a component — getState() is Zustand's
  // supported way to reach store state from outside React.
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
    // handleError() reads error.message, and the existing toasts depend on it.
    throw new Error(`HTTP ${response.status}: ${errorBody?.message ?? response.statusText}`)
  }

  if (!isJson || response.status === 204) {
    return null as T
  }

  return (await response.json()) as T
}
