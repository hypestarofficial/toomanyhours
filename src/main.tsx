import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import AppLayout from "./AppLayout"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppLayout />
    </QueryClientProvider>
  </StrictMode>,
)
