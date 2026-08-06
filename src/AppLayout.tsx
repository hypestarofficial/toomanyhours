import { BrowserRouter, Route, Routes } from "react-router"
import App from "./App.tsx"
import NotFound from "./NotFound.tsx"
import Navbar from "./components/navbar/Navbar.tsx"
import { Toaster } from "sonner"
import LoginForm from "./pages/Auth/LoginForm.tsx"
import RegisterForm from "./pages/Auth/RegisterForm.tsx"
import useAuthStore from "./store/useAuthStore.ts"
import MyList from "./pages/MyList/MyList.tsx"
import { routes } from "./helpers/routes.ts"
import Profile from "./pages/Profile/Profile.tsx"
import { useEffect } from "react"
import useGlobalStore from "./store/useGlobalStore.ts"
import Loader from "./components/loader/Loader.tsx"
import { refreshToken } from "./api/endpoints/auth.ts"
import { getMe } from "./api/endpoints/users.ts"
import { handleError } from "./utils/errors.ts"
import NavigationRegistrar from "./api/NavigationRegistrar.tsx"
import ProtectedRoutes from "./router/ProtectedRoutes.tsx"
import PublicRoutes from "./router/PublicRoutes.tsx"
import PublicProfile from "./pages/PublicProfile/PublicProfile.tsx"

const AppLayout = () => {
  const { setAuthenticated, jwtToken, setJwtToken, setUser, user } = useAuthStore()
  const { isGlobalLoading, setIsGlobalLoading } = useGlobalStore()

  useEffect(() => {
    const checkSession = async () => {
      if (jwtToken !== "") {
        setIsGlobalLoading(false)
        return
      }

      const sessionActiveHint = localStorage.getItem("session_active") === "true"

      if (sessionActiveHint) {
        setIsGlobalLoading(true)
        try {
          const data = await refreshToken()

          if (data && data.access_token) {
            setJwtToken(data.access_token)
            setAuthenticated(true)
          }
        } catch (error: unknown) {
          localStorage.removeItem("session_active")
          console.warn("Refresh token failed:", error)
          handleError({ error, userMessage: "Session expired. Please login.", componentName: "AppLayout" })
          setAuthenticated(false)
          setJwtToken("")
          setUser(null)
        } finally {
          setIsGlobalLoading(false)
        }
      } else {
        setIsGlobalLoading(false)
      }
    }

    checkSession()
  }, [jwtToken])

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (jwtToken && !user) {
        try {
          const userData = await getMe()
          setUser(userData)
        } catch (error) {
          console.error("Failed to fetch user profile:", error)
          setAuthenticated(false)
          setJwtToken("")
        }
      }
    }

    fetchUserProfile()
  }, [jwtToken, user, setUser, setAuthenticated, setJwtToken])

  return (
    <BrowserRouter>
      <NavigationRegistrar />
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
                info: "text-info!",
              },
            }}
          />
          {isGlobalLoading ? (
            <Loader fullPage />
          ) : (
            // One tree, with guards as layout routes.
            //
            // This previously swapped between two entirely separate <Routes>
            // trees based on `authenticated`, and neither contained the other's
            // paths. So every render where the flag and the URL disagreed —
            // unavoidably, for a frame after login — matched only "*" and
            // flashed a 404. Guards redirect instead, so every URL resolves
            // under either state.
            <Routes>
              <Route element={<PublicRoutes />}>
                <Route path={routes.home} element={<App />} />
                <Route path={routes.login} element={<LoginForm />} />
                <Route path={routes.register} element={<RegisterForm />} />
              </Route>

              <Route element={<ProtectedRoutes />}>
                <Route path={routes.myList} element={<MyList />} />
                <Route path={routes.profile} element={<Profile />} />
              </Route>

              {/* Outside both guards on purpose: ProtectedRoutes would send an
                  anonymous visitor to /login, and PublicRoutes would send a
                  logged-in one to /myList. Either breaks a shared link. */}
              <Route path={routes.publicProfile} element={<PublicProfile />} />

              {/* Outside both guards on purpose: an unknown URL should say so
                  rather than bounce the visitor to login. */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </main>
      </div>
    </BrowserRouter>
  )
}

export default AppLayout
