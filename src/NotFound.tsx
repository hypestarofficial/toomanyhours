import React from "react"
import MotionContainer from "./components/motionContainer/MotionContainer"
import MotionButton from "./components/motionButton/MotionButton"
import { useNavigate } from "react-router"
import Page from "./components/page/Page"

const NotFound: React.FC = () => {
  const navigate = useNavigate()
  return (
    <Page>
      <MotionContainer className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-primary font-bold">404 Page Not Found</h1>
        <p>Nothing to see here brother, move along.</p>
        <MotionButton onClick={() => navigate(-1)}>Go Back</MotionButton>
      </MotionContainer>
    </Page>
  )
}

export default NotFound
