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
import Changelog from "./pages/Changelog/Changelog.tsx"

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
    // Zustand store actions are stable references, created once when the
    // store is defined, so listing them cannot make this effect re-run. The
    // boot-time refresh stays one-shot. The second effect in this file
    // already lists the same setters, which is the precedent.
  }, [jwtToken, setAuthenticated, setJwtToken, setUser, setIsGlobalLoading])

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
        {/* The app's one scroll container, and it has to be this element.
            Scrolling a page's own wrapper instead put the scrollbar inside this
            padding — floating 40px in from the window edge with a strip of
            background to its right, which reads as a bug. A scrollbar belongs
            on the border box, so the element that scrolls must be the one whose
            edge is the window's. */}
        <main className="flex h-full w-full flex-col overflow-y-auto px-4 pt-20 sm:px-10">
          {/* theme="dark" is the load-bearing one: sonner defaults to light,
              so the toast arrived as a pale box on a dark app with almost no
              contrast in it. richColors goes with it — it makes sonner impose
              its own palette per type, which is exactly what the overrides
              below were fighting.

              The type is a filled background with white text, not a tinted
              border, because that is what --color-success and --color-error
              are: dark shades meant to sit *behind* white text, which is how
              Badge's status variants use them. As a hairline on the near-black
              surface they would have been invisible, which is the bug being
              fixed here rather than a new look. Info is neutral grey, since
              --color-info is white and a white toast is where this started. */}
          <Toaster
            closeButton
            position="bottom-right"
            theme="dark"
            swipeDirections={["bottom"]}
            offset="1rem"
            toastOptions={{
              classNames: {
                toast: "bg-secondaryBg! text-text! border! border-highlight! shadow-lg! shadow-black/50!",
                title: "text-text! font-semibold!",
                description: "text-text! opacity-90!",
                closeButton: "bg-secondaryBg! border-highlight! text-text! hover:bg-highlight!",
                success: "bg-success! border-success!",
                error: "bg-error! border-error!",
                info: "bg-highlight! border-highlight!",
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

              {/* Outside both guards for the same reason as the profile above:
                  ProtectedRoutes would send a logged-out reader to login, and
                  PublicRoutes would send a logged-in one to their list. Either
                  breaks a link to a release note. */}
              <Route path={routes.changelog} element={<Changelog />} />

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
