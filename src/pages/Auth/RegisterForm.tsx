import { toast } from "sonner"
import Input from "../../components/form/input/Input"
import MotionButton from "../../components/motionButton/MotionButton"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import MotionLink from "../../components/motionLink/MotionLink"
import styles from "./Auth.module.css"

const RegisterForm: React.FC = () => (
  <MotionContainer className="flex w-60 flex-col justify-center gap-6">
    <h1>register</h1>
    <div className={styles.container}>
      <div className={styles.colWrapper}>
        <Input type="text" maxLength={16} label="Game tag" id="username" placeholder="john_doe" />
        <Input type="email" label="Email" id="email" placeholder="john@doe.com" />
        <Input type="password" maxLength={16} label="Password" id="password" placeholder="********" />
      </div>
      <div className={styles.colWrapper}>
        <MotionLink to="/login" className="text-center text-xs">
          Already a gamer? Login here brother
        </MotionLink>
        <MotionButton flex onClick={() => toast.success("Registration successful")}>
          Register
        </MotionButton>
      </div>
    </div>
  </MotionContainer>
)

export default RegisterForm
