import { BrowserRouter, Route, Routes } from "react-router"
import App from "./App.tsx"
import NotFound from "../NotFound.tsx"
import Navbar from "./components/navbar/Navbar.tsx"

const AppLayout = () => (
  <BrowserRouter>
    {/* 
        This outer container manages the full viewport height layout.
        We keep 'min-h-screen flex flex-col'.
      */}
    <div className="flex min-h-screen flex-col">
      {/* Navbar stays fixed or normal at the top */}
      <Navbar />

      {/* 
          This main container uses 'flex-grow' to expand and take up ALL 
          remaining vertical space between the Navbar and the bottom of the screen.
          It is also the container we want to center things within.
        */}
      <main className="flex grow items-center justify-center px-10 pt-28 pb-20">
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <div className="fixed top-0 right-0 left-0 z-30">
        <div className="pointer-events-none h-16 bg-[#242424]" />
        <div className="pointer-events-none h-20 bg-linear-to-b from-[#242424] to-transparent" />
      </div>
      <div className="fixed right-0 bottom-0 left-0 z-30">
        <div className="pointer-events-none h-20 bg-linear-to-t from-[#242424] to-transparent" />
        <div className="pointer-events-none h-5 bg-[#242424]" />
      </div>
    </div>
  </BrowserRouter>
)

export default AppLayout
