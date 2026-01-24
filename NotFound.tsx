import React from "react"
import { Link } from "react-router"

const NotFound: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-4">
    <h1 className="font-bold">404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <Link to="/" className="underline">
      Go to Home
    </Link>
  </div>
)

export default NotFound
