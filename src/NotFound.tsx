import React from "react"
import MotionContainer from "./components/motionContainer/MotionContainer"
import MotionButton from "./components/motionButton/MotionButton"
import { useNavigate } from "react-router"

const NotFound: React.FC = () => {
  const navigate = useNavigate()
  return (
    <MotionContainer className="flex flex-col items-center justify-center gap-4">
      <h1 className="text-primary font-bold">404 Page Not Found</h1>
      <p>Nothing to see here brother, move along.</p>
      <MotionButton onClick={() => navigate(-1)}>Go to Home</MotionButton>
    </MotionContainer>
  )
}

export default NotFound
