import { useCallback, useState } from "react"
import useAuthStore from "../../store/useAuthStore"

export default function useAuth() {
  const { setJwtToken, setAuthenticated } = useAuthStore()
  const [tickInterval, setTickInterval] = useState<ReturnType<typeof setInterval> | undefined>(undefined)

  const toggleRefresh = useCallback(
    (status: boolean) => {
      if (status) {
        const requestOptions = {
          method: "GET",
          credentials: "include" as RequestCredentials,
        }

        const i = setInterval(() => {
          fetch("/api/refresh-token", requestOptions)
            .then((response) => {
              if (!response.ok) {
                throw new Error("Session expired. Please login.")
              }
              return response.json()
            })
            .then((data) => {
              if (data.error) {
                console.error(data.message, "AppLayout")
                setAuthenticated(false)
                setJwtToken("")
                clearInterval(i)
                setTickInterval(undefined)
              } else {
                setJwtToken(data.access_token)
                setAuthenticated(true)
              }
            })
            .catch((error) => {
              console.warn("Refresh token failed:", error.message)
              setAuthenticated(false)
              setJwtToken("")
              clearInterval(i)
              setTickInterval(undefined)
            })
        }, 600000) // 10 minutes
        setTickInterval(i)
      } else {
        setTickInterval(undefined)
        clearInterval(tickInterval)
      }
    },
    [setAuthenticated, setJwtToken, tickInterval],
  )

  return { toggleRefresh }
}
