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

const AppLayout = () => {
  const { authenticated } = useAuthStore()

  return (
    <BrowserRouter>
      <div className="relative flex h-full">
        <Navbar />
        <main className="flex h-full w-full flex-col px-10 pt-28">
          <Toaster
            closeButton
            position="top-right"
            richColors
            swipeDirections={["top"]}
            toastOptions={{
              classNames: {
                description: "text-text!",
                toast: "bg-secondaryBg! border-none! top-14!",
                title: "text-text!",
                closeButton: "text-bg!",
                error: "text-error!",
                success: "text-success!",
                warning: "text-warning!",
                info: "text-text!",
              },
            }}
          />
          {authenticated ? (
            <Routes>
              <Route path={routes.home} element={<MyList />} />
              <Route path={routes.profile} element={<Profile />} />
              <Route path={routes.login} element={<LoginForm />} />
              <Route path={routes.register} element={<RegisterForm />} />
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
        </main>
        {/* <div className="fixed right-0 bottom-0 left-0 z-30">
          <div className="from-bg pointer-events-none h-20 bg-linear-to-t to-transparent" />
          <div className="bg-bg pointer-events-none h-5" />
        </div> */}
      </div>
    </BrowserRouter>
  )
}

export default AppLayout
