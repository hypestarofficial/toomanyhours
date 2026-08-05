import type { User, Visibility } from "../../types/users"
import { httpRequest } from "./api"

type PatchMeBody = {
  username?: string
  visibility?: Visibility
}

export const getMe = async (): Promise<User | null> =>
  httpRequest({
    method: "GET",
    url: "/me",
    authorization: true,
  }) as Promise<User | null>

export const patchMe = async (body: PatchMeBody): Promise<User> =>
  httpRequest({
    method: "PATCH",
    url: "/me",
    authorization: true,
    body: body,
  }) as Promise<User>
