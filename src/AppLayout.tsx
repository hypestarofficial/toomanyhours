import { BrowserRouter, Route, Routes } from "react-router"
import App from "./App.tsx"
import NotFound from "./NotFound.tsx"
import Navbar from "./components/navbar/Navbar.tsx"
import { Toaster } from "sonner"
import LoginForm from "./pages/Auth/LoginForm.tsx"
import RegisterForm from "./pages/Auth/RegisterForm.tsx"

const AppLayout = () => (
  <BrowserRouter>
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="relative flex grow items-center justify-center px-10 pt-28 pb-20">
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
            },
          }}
        />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <div className="fixed top-0 right-0 left-0 z-30">
        <div className="bg-bg pointer-events-none h-16" />
        <div className="from-bg pointer-events-none h-20 bg-linear-to-b to-transparent" />
      </div>
      <div className="fixed right-0 bottom-0 left-0 z-30">
        <div className="from-bg pointer-events-none h-20 bg-linear-to-t to-transparent" />
        <div className="bg-bg pointer-events-none h-5" />
      </div>
    </div>
  </BrowserRouter>
)

export default AppLayout
