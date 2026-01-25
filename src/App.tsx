import MotionContainer from "./components/motionContainer/MotionContainer"
import "./App.css"
import MotionButton from "./components/motionButton/MotionButton"
import { useNavigate } from "react-router"

function App() {
  const navigate = useNavigate()

  return (
    <MotionContainer className="flex-col items-center justify-center space-y-5">
      <div>
        <h1 className="font-semibold">tooManyHours</h1>
        <p>
          a platform where <span className="text-primary font-bold">YOU</span> can track and share your list of completed, finished or
          currently playing games.
        </p>
      </div>
      <MotionButton onClick={() => navigate("/login")}>Get Started</MotionButton>
    </MotionContainer>
  )
}

export default App
