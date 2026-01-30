import { Navigate, Outlet } from "react-router"
import useAuthStore from "../store/useAuthStore"
import { routes } from "../helpers/routes"

const PublicRoute = () => {
  const { authenticated } = useAuthStore()

  return !authenticated ? <Outlet /> : <Navigate to={routes.home} replace />
}

export default PublicRoute
