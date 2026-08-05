import type { User, Visibility } from "../../types/users"
import { httpRequest } from "./api"

type PatchMeBody = {
  username?: string
  visibility?: Visibility
}

export const getMe = async ({ jwtToken }: { jwtToken: string }): Promise<User | null> =>
  httpRequest({
    method: "GET",
    url: "/me",
    authorization: true,
    jwtToken: jwtToken,
  }) as Promise<User | null>

export const patchMe = async ({ body, jwtToken }: { body: PatchMeBody; jwtToken: string }): Promise<User> =>
  httpRequest({
    method: "PATCH",
    url: "/me",
    authorization: true,
    jwtToken: jwtToken,
    body: body,
  }) as Promise<User>
