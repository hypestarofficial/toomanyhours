import { toast } from "sonner"
import MotionButton from "../../components/motionButton/MotionButton"
import Input from "../../components/form/input/Input"
import MotionLink from "../../components/motionLink/MotionLink"
import styles from "./Auth.module.css"
import MotionContainer from "../../components/motionContainer/MotionContainer"

const LoginForm: React.FC = () => (
  <MotionContainer className="flex w-60 flex-col justify-center gap-6">
    <h1>login</h1>
    <div className={styles.container}>
      <div className={styles.colWrapper}>
        <Input type="email" label="Email" id="email" placeholder="john@doe.com" />
        <Input type="password" label="Password" id="password" placeholder="********" />
      </div>
      <div className={styles.colWrapper}>
        <MotionLink to="/register" className="text-center text-xs">
          No bitches? Register here brother
        </MotionLink>
        <MotionButton flex onClick={() => toast.success("Login successful")}>
          Login
        </MotionButton>
      </div>
    </div>
  </MotionContainer>
)

export default LoginForm
