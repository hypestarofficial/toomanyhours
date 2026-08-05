import { toast } from "sonner"
import { ApiError } from "./apiError"
import useAuthStore from "../store/useAuthStore"
import { routes } from "../helpers/routes"

// All three pieces of state live at module scope, because that is the scope
// matching a session's actual lifetime. The previous implementation kept the
// refresh timer's handle in component state, so whichever component happened
// to start it owned it — and when that component unmounted, the timer kept
// running with no handle left that could clear it.
let refreshInFlight: Promise<string> | null = null
let sessionEnded = false
let navigateTo: ((path: string) => void) | null = null

/** Registered once by NavigationRegistrar, which is mounted inside BrowserRouter. */
export const registerNavigate = (fn: (path: string) => void) => {
  navigateTo = fn
}

/**
 * Called after a successful login or registration, and on deliberate logout,
 * so an earlier expiry does not leave withAuthRetry failing fast forever.
 */
export const beginSession = () => {
  sessionEnded = false
}

/**
 * Exchanges the refresh cookie for a new access token.
 *
 * Single-flight: concurrent callers receive the same promise, so five requests
 * failing together produce one refresh rather than five. Uses fetch directly
 * and is never wrapped in withAuthRetry — a 401 from this endpoint must not
 * trigger another refresh, or it recurses without bound.
 */
export const refreshSession = (): Promise<string> => {
  if (refreshInFlight) {
    return refreshInFlight
  }

  // Assigned synchronously, before any await. If this were assigned after an
  // await, concurrent callers would each start their own refresh.
  refreshInFlight = (async () => {
    const response = await fetch("/api/refresh-token", { method: "GET", credentials: "include" })
    if (!response.ok) {
      throw new ApiError(response.status, "Session refresh failed")
    }
    const data = await response.json()
    useAuthStore.getState().setJwtToken(data.access_token)
    return data.access_token as string
  })()

  // Cleared once settled rather than latched, so a later expiry can refresh again.
  return refreshInFlight.finally(() => {
    refreshInFlight = null
  })
}

/** The session is genuinely over: clear everything and send the user to login. */
export const endSession = () => {
  sessionEnded = true
  localStorage.removeItem("session_active")

  const { setAuthenticated, setJwtToken, setUser } = useAuthStore.getState()
  setAuthenticated(false)
  setJwtToken("")
  setUser(null)

  toast.error("Session expired — please log in again")
  navigateTo?.(routes.login)
}

/**
 * Runs a request, refreshing once and retrying once if it comes back 401.
 *
 * Retry is capped at a single attempt on purpose: if the retried request also
 * 401s, the session is over rather than in need of another refresh. Without
 * the cap, a server-side bug becomes a request storm.
 */
export const withAuthRetry = async <T>(doRequest: () => Promise<T>): Promise<T> => {
  try {
    return await doRequest()
  } catch (error) {
    const isExpired = error instanceof ApiError && error.status === 401
    // sessionEnded matters because TanStack Query retries failed queries by
    // default, so a single expiry can arrive here several times over.
    if (!isExpired || sessionEnded) {
      throw error
    }

    try {
      await refreshSession()
    } catch (refreshError) {
      endSession()
      throw refreshError
    }

    try {
      return await doRequest()
    } catch (retryError) {
      if (retryError instanceof ApiError && retryError.status === 401) {
        endSession()
      }
      throw retryError
    }
  }
}
