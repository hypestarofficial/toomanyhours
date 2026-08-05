import { beforeEach, describe, expect, it, vi } from "vitest"
import { ApiError } from "./apiError"
import { beginSession, endSession, refreshSession, registerNavigate, withAuthRetry } from "./session"
import useAuthStore from "../store/useAuthStore"

// sonner renders toasts into the DOM; in a node environment we only care that
// calling it does not throw.
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

// localStorage does not exist in the node environment. The backing Map lives in
// closure scope rather than on the object, so there is no `this` to type.
vi.stubGlobal(
  "localStorage",
  (() => {
    const store = new Map<string, string>()
    return {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
      clear: () => store.clear(),
    }
  })(),
)

const unauthorized = () => Promise.reject(new ApiError(401, "HTTP 401: expired"))

/** A request that fails with 401 the first time and succeeds afterwards. */
const failsOnceThenSucceeds = () => {
  let calls = 0
  return vi.fn(() => {
    calls += 1
    return calls === 1 ? unauthorized() : Promise.resolve("ok")
  })
}

const mockRefreshResponse = (token = "new-token") =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ access_token: token, refresh_token: "r" }),
  } as unknown as Response)

beforeEach(() => {
  beginSession()
  useAuthStore.setState({ jwtToken: "", authenticated: false, user: null })
  registerNavigate(vi.fn())
  vi.restoreAllMocks()
})

describe("refreshSession", () => {
  it("stores the new access token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => mockRefreshResponse("fresh")),
    )
    await refreshSession()
    expect(useAuthStore.getState().jwtToken).toBe("fresh")
  })

  it("is single-flight: concurrent callers share one request", async () => {
    const fetchSpy = vi.fn(() => mockRefreshResponse())
    vi.stubGlobal("fetch", fetchSpy)

    await Promise.all([refreshSession(), refreshSession(), refreshSession(), refreshSession(), refreshSession()])

    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it("can refresh again after an earlier refresh settled", async () => {
    const fetchSpy = vi.fn(() => mockRefreshResponse())
    vi.stubGlobal("fetch", fetchSpy)

    await refreshSession()
    await refreshSession()

    // Not latched: the in-flight promise is cleared when it settles.
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })
})

describe("withAuthRetry", () => {
  it("returns the result when the request succeeds", async () => {
    const request = vi.fn(() => Promise.resolve("fine"))
    await expect(withAuthRetry(request)).resolves.toBe("fine")
    expect(request).toHaveBeenCalledTimes(1)
  })

  it("refreshes once and retries once on a 401", async () => {
    const fetchSpy = vi.fn(() => mockRefreshResponse())
    vi.stubGlobal("fetch", fetchSpy)
    const request = failsOnceThenSucceeds()

    await expect(withAuthRetry(request)).resolves.toBe("ok")
    expect(request).toHaveBeenCalledTimes(2)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it("five concurrent 401s trigger exactly one refresh", async () => {
    const fetchSpy = vi.fn(() => mockRefreshResponse())
    vi.stubGlobal("fetch", fetchSpy)

    const requests = [
      failsOnceThenSucceeds(),
      failsOnceThenSucceeds(),
      failsOnceThenSucceeds(),
      failsOnceThenSucceeds(),
      failsOnceThenSucceeds(),
    ]
    await Promise.all(requests.map((r) => withAuthRetry(r)))

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    requests.forEach((r) => expect(r).toHaveBeenCalledTimes(2))
  })

  it("does not refresh twice when the retry also 401s", async () => {
    const fetchSpy = vi.fn(() => mockRefreshResponse())
    vi.stubGlobal("fetch", fetchSpy)
    const alwaysUnauthorized = vi.fn(unauthorized)

    await expect(withAuthRetry(alwaysUnauthorized)).rejects.toBeInstanceOf(ApiError)

    expect(alwaysUnauthorized).toHaveBeenCalledTimes(2)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it("ends the session when the refresh itself fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: false, status: 401 } as unknown as Response)),
    )
    useAuthStore.setState({ authenticated: true, jwtToken: "stale" })

    await expect(withAuthRetry(vi.fn(unauthorized))).rejects.toBeTruthy()

    expect(useAuthStore.getState().authenticated).toBe(false)
    expect(useAuthStore.getState().jwtToken).toBe("")
  })

  it("fails fast without refreshing once the session has ended", async () => {
    const fetchSpy = vi.fn(() => mockRefreshResponse())
    vi.stubGlobal("fetch", fetchSpy)
    endSession()

    const request = vi.fn(unauthorized)
    await expect(withAuthRetry(request)).rejects.toBeInstanceOf(ApiError)

    // TanStack Query retries failed queries by default, so without this guard
    // one expiry would become a burst of refresh calls.
    expect(request).toHaveBeenCalledTimes(1)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("passes through non-401 failures untouched", async () => {
    const fetchSpy = vi.fn(() => mockRefreshResponse())
    vi.stubGlobal("fetch", fetchSpy)
    const request = vi.fn(() => Promise.reject(new ApiError(500, "server exploded")))

    await expect(withAuthRetry(request)).rejects.toThrow("server exploded")
    expect(request).toHaveBeenCalledTimes(1)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe("endSession", () => {
  it("clears auth state, the hint, and navigates to login", () => {
    const navigate = vi.fn()
    registerNavigate(navigate)
    localStorage.setItem("session_active", "true")
    useAuthStore.setState({ authenticated: true, jwtToken: "t" })

    endSession()

    expect(useAuthStore.getState().authenticated).toBe(false)
    expect(useAuthStore.getState().jwtToken).toBe("")
    expect(localStorage.getItem("session_active")).toBeNull()
    expect(navigate).toHaveBeenCalledWith("/login")
  })
})
