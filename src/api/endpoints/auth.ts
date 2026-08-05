import { httpRequest } from "./api"

type LoginParams = {
  email: string
  password: string
}

type TokenPairs = {
  access_token: string
  refresh_token: string
}

type RegisterParams = {
  username: string
  email: string
  password: string
}

// Returns the same TokenPairs as login and sets the refresh cookie, so a
// successful signup leaves the user logged in.
export const register = async ({ username, email, password }: RegisterParams): Promise<TokenPairs | null> =>
  httpRequest({
    method: "POST",
    url: "/register",
    body: { username, email, password },
    credentials: "include" as RequestCredentials,
  }) as Promise<TokenPairs | null>

export const login = async ({ email, password }: LoginParams): Promise<TokenPairs | null> =>
  httpRequest({
    method: "POST",
    url: "/authenticate",
    body: { email, password },
    credentials: "include" as RequestCredentials,
  }) as Promise<TokenPairs | null>

export const refreshToken = async (): Promise<TokenPairs | null> =>
  httpRequest({
    method: "GET",
    url: "/refresh-token",
    credentials: "include" as RequestCredentials,
  }) as Promise<TokenPairs | null>

export const logout = async () => {
  await httpRequest({
    method: "GET",
    url: "/logout",
    credentials: "include" as RequestCredentials,
  })
}
