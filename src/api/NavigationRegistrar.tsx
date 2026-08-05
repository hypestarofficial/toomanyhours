import { useEffect } from "react"
import { useNavigate } from "react-router"
import { registerNavigate } from "./session"

/**
 * Gives session.ts a way to navigate.
 *
 * endSession() is a plain module and cannot call useNavigate, and a full-page
 * redirect would work but destroy the toast it shows on the way out. Handing
 * it the router's navigate keeps the SPA intact and the toast visible.
 *
 * Renders nothing. Must be mounted inside BrowserRouter.
 */
const NavigationRegistrar = () => {
  const navigate = useNavigate()

  useEffect(() => {
    registerNavigate(navigate)
  }, [navigate])

  return null
}

export default NavigationRegistrar
