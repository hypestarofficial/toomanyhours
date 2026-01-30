import type { User } from "../../types/users"
import { httpRequest } from "./api"

export const getMe = async ({ jwtToken }: { jwtToken: string }): Promise<User | null> =>
  httpRequest({
    method: "GET",
    url: "/me",
    authorization: true,
    jwtToken: jwtToken,
  }) as Promise<User | null>
