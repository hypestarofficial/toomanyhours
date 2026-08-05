import { Navigate, Outlet } from "react-router"
import useAuthStore from "../store/useAuthStore"
import { routes } from "../helpers/routes"

/**
 * Wraps routes that only make sense when logged out — the landing page, login
 * and register. An authenticated visitor is sent to their list instead.
 *
 * The redirect target must NOT be routes.home: home is itself wrapped by this
 * guard, so redirecting there would re-enter the guard, redirect again, and
 * loop forever.
 */
const PublicRoutes = () => {
  const { authenticated } = useAuthStore()

  return authenticated ? <Navigate to={routes.myList} replace /> : <Outlet />
}

export default PublicRoutes
