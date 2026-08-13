import type { User } from "../../types/users"
import { httpRequest } from "./api"

/**
 * Uploads a profile photo and returns the updated account.
 *
 * Hand-written beside getMe/patchMe rather than generated, for the same reason
 * they are: this writes the account `useAuthStore` renders identity from, so
 * the caller sets the store from the response rather than invalidating a query.
 *
 * FormData, and deliberately no Content-Type header — the browser has to set it
 * so the multipart boundary matches the body it built.
 */
export const uploadAvatar = async (blob: Blob): Promise<User> => {
  const form = new FormData()
  form.append("avatar", blob, "avatar.jpg")

  return httpRequest({
    method: "PUT",
    url: "/me/avatar",
    authorization: true,
    body: form,
  }) as Promise<User>
}

export const deleteAvatar = async (): Promise<User> =>
  httpRequest({
    method: "DELETE",
    url: "/me/avatar",
    authorization: true,
  }) as Promise<User>
