import { BrowserRouter, Route, Routes } from "react-router"
import App from "./App.tsx"
import NotFound from "./NotFound.tsx"
import Navbar from "./components/navbar/Navbar.tsx"
import { Toaster } from "sonner"
import LoginForm from "./pages/Auth/LoginForm.tsx"
import RegisterForm from "./pages/Auth/RegisterForm.tsx"
import useAuthStore from "./store/useAuthStore.ts"
import MyList from "./pages/MyList/MyList.tsx"
import { adminRoutes, routes } from "./helpers/routes.ts"
import Profile from "./pages/Profile/Profile.tsx"
import { useEffect } from "react"
import { handleError } from "./utils/errors.ts"
import useGlobalStore from "./store/useGlobalStore.ts"
import Loader from "./components/loader/Loader.tsx"
import useAuth from "./hooks/api/useAuth.ts"
import Admin from "./pages/Admin/Admin.tsx"

const AppLayout = () => {
  const { authenticated, setAuthenticated, jwtToken, setJwtToken } = useAuthStore()
  const { isGlobalLoading, setIsGlobalLoading } = useGlobalStore()
  const { toggleRefresh } = useAuth()

  useEffect(() => {
    setIsGlobalLoading(true)
    if (jwtToken === "") {
      const requestOptions = {
        method: "GET",
        credentials: "include" as RequestCredentials,
      }

      fetch("/api/refresh-token", requestOptions)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Session expired. Please login.")
          }
          return response.json()
        })
        .then((data) => {
          if (data.error) {
            handleError(data.message, "AppLayout")
            setAuthenticated(false)
            setJwtToken("")
          } else {
            setJwtToken(data.access_token)
            setAuthenticated(true)
            toggleRefresh(true)
          }
        })
        .catch((error) => {
          console.warn("Refresh token failed:", error.message)
          setAuthenticated(false)
          setJwtToken("")
        })
        .finally(() => setIsGlobalLoading(false))
    } else {
      setIsGlobalLoading(false)
    }
  }, [jwtToken, toggleRefresh])

  return (
    <BrowserRouter>
      <div className="relative flex h-full">
        <Navbar />
        <main className="flex h-full w-full flex-col px-10 pt-20">
          <Toaster
            closeButton
            position="bottom-right"
            richColors
            swipeDirections={["bottom"]}
            offset="1rem"
            toastOptions={{
              classNames: {
                description: "text-text!",
                toast: "bg-secondaryBg! border-none!",
                title: "text-text!",
                closeButton: "text-bg!",
                error: "text-error!",
                success: "text-success!",
                warning: "text-warning!",
                info: "text-text!",
              },
            }}
          />
          {isGlobalLoading ? (
            <Loader fullPage />
          ) : (
            <>
              {authenticated ? (
                <Routes>
                  <Route path={adminRoutes.games} element={<Admin />} />
                  <Route path={routes.home} element={<MyList />} />
                  <Route path={routes.profile} element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              ) : (
                <Routes>
                  <Route path={routes.home} element={<App />} />
                  <Route path={routes.login} element={<LoginForm />} />
                  <Route path={routes.register} element={<RegisterForm />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              )}
            </>
          )}
        </main>
      </div>
    </BrowserRouter>
  )
}

export default AppLayout
