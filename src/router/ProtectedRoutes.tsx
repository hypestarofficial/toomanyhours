import { Navigate, Outlet } from "react-router"
import { routes } from "../helpers/routes"
import useAuthStore from "../store/useAuthStore"

const ProtectedRoutes = () => {
  const { authenticated } = useAuthStore()

  return authenticated ? <Outlet /> : <Navigate to={routes.login} replace />
}

export default ProtectedRoutes
