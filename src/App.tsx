import MotionContainer from "./components/motionContainer/MotionContainer"
import MotionButton from "./components/motionButton/MotionButton"
import { useNavigate } from "react-router"
import Page from "./components/page/Page"

function App() {
  const navigate = useNavigate()

  return (
    <Page>
      <MotionContainer className="flex flex-col items-start justify-center space-y-5">
        <div className="flex flex-col items-start justify-center">
          <h1 className="font-semibold">tooManyHours</h1>
          <p>
            a platform where <span className="text-primary font-bold">YOU</span> can track and share your list of completed, finished or
            currently playing games.
          </p>
        </div>
        <MotionButton onClick={() => navigate("/register")}>Get Started</MotionButton>
      </MotionContainer>
    </Page>
  )
}

export default App
