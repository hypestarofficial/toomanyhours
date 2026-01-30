import { httpRequest } from "./api"

type LoginParams = {
  email: string
  password: string
}

type TokenPairs = {
  access_token: string
  refresh_token: string
}

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
