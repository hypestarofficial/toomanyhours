// Hand-written hooks for the endpoints that are deliberately not generated:
// they manage store state rather than cached server data.
import { useMutation } from "@tanstack/react-query"
import useAuthStore from "../../store/useAuthStore"
import type { User, Visibility } from "../../types/users"
import { patchMe } from "./users"

// The token is deliberately NOT part of any queryKey. It never identified a
// request — the request path and params do — and including it meant every
// token change invalidated the whole cache and refetched everything the app
// had loaded. httpRequest now reads the token itself, at request time.
//
// `enabled: !!jwtToken` stays: without it, queries fire before a token exists
// and 401 on every boot.

export const usePatchMeMutation = () => {
  const { setUser } = useAuthStore()

  return useMutation<User, Error, { username?: string; visibility?: Visibility }>({
    mutationFn: (body) => patchMe(body),
    // useAuthStore.user is what the whole app renders from, so without this
    // the profile and navbar keep showing the old game tag until a reload.
    onSuccess: (updated) => setUser(updated),
  })
}
