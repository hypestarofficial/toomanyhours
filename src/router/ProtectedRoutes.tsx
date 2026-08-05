import { Navigate, Outlet } from "react-router"
import { routes } from "../helpers/routes"
import useAuthStore from "../store/useAuthStore"

/**
 * Wraps routes that require a session. An unauthenticated visitor is sent to
 * login rather than shown a 404, which is what happened before: the app used
 * two separate route trees and every URL was missing from one of them.
 */
const ProtectedRoutes = () => {
  const { authenticated } = useAuthStore()

  return authenticated ? <Outlet /> : <Navigate to={routes.login} replace />
}

export default ProtectedRoutes
