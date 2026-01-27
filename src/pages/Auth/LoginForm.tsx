import { toast } from "sonner"
import MotionButton from "../../components/motionButton/MotionButton"
import Input from "../../components/form/input/Input"
import MotionLink from "../../components/motionLink/MotionLink"
import styles from "./Auth.module.css"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import useAuthStore from "../../store/useAuthStore"
import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import { useNavigate } from "react-router"
import { handleError } from "../../utils/errors"
import Page from "../../components/page/Page"

type Inputs = {
  email: string
  password: string
}

const LoginForm: React.FC = () => {
  const { setAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm<Inputs>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  })

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    try {
      console.log(data)
      setAuthenticated(true)
      toast.success("Login successful")
      navigate("/")
    } catch (error: unknown) {
      handleError(error, "LoginForm")
    }
  }

  return (
    <Page>
      <MotionContainer className={styles.form}>
        <h1>login</h1>
        <div className={styles.container}>
          <div className={styles.colWrapper}>
            <Controller
              name="email"
              control={control}
              render={({ field, formState: { errors } }) => (
                <Input type="email" label="Email" id="email" placeholder="john@doe.com" {...field} error={errors.email?.message} />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field, formState: { errors } }) => (
                <Input
                  type="password"
                  maxLength={16}
                  label="Password"
                  id="password"
                  placeholder="********"
                  {...field}
                  error={errors.password?.message}
                />
              )}
            />
          </div>
          <div className={styles.buttonWrapper}>
            <MotionLink to="/register" className="text-center text-xs">
              No bitches? Register here brother
            </MotionLink>
            <MotionButton flex onClick={handleSubmit(onSubmit)} disabled={!isValid}>
              Login
            </MotionButton>
          </div>
        </div>
      </MotionContainer>
    </Page>
  )
}

export default LoginForm
