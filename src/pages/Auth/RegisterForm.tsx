import { toast } from "sonner"
import { Controller, Form, useForm } from "react-hook-form"
import type { SubmitHandler } from "react-hook-form"
import Input from "../../components/form/input/Input"
import MotionButton from "../../components/motionButton/MotionButton"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import MotionLink from "../../components/motionLink/MotionLink"
import styles from "./Auth.module.css"
import { useNavigate } from "react-router"
import useAuthStore from "../../store/useAuthStore"
import { routes } from "../../helpers/routes"
import { handleError } from "../../utils/errors"
import Page from "../../components/page/Page"

type Inputs = {
  username: string
  email: string
  password: string
}

const RegisterForm: React.FC = () => {
  const { setAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm<Inputs>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  })

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    try {
      console.log(data)
      setAuthenticated(true)
      toast.success("Welcome to the club!")
      navigate(routes.home)
    } catch (error: unknown) {
      handleError(error, "RegisterForm")
    }
  }

  return (
    <Page>
      <Form control={control} onSubmit={({ data }) => onSubmit(data)} autoComplete="on">
        <MotionContainer className={styles.form}>
          <h1>register</h1>
          <div className={styles.container}>
            <div className={styles.colWrapper}>
              <Controller
                name="username"
                control={control}
                rules={{ required: "Game tag is required" }}
                render={({ field, formState: { errors } }) => (
                  <Input
                    type="text"
                    maxLength={16}
                    label="Game tag"
                    id="username"
                    placeholder="john_doe"
                    {...field}
                    error={errors.username?.message}
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" },
                }}
                render={({ field, formState: { errors } }) => (
                  <Input
                    type="email"
                    label="Email"
                    id="email"
                    autoComplete="email"
                    placeholder="john@doe.com"
                    {...field}
                    error={errors.email?.message}
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                rules={{
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 6 characters long" },
                }}
                render={({ field, formState: { errors } }) => (
                  <Input
                    type="password"
                    maxLength={16}
                    label="Password"
                    id="password"
                    autoComplete="new-password"
                    placeholder="********"
                    {...field}
                    error={errors.password?.message}
                  />
                )}
              />
            </div>
            <div className={styles.buttonWrapper}>
              <MotionLink to={routes.login} className="text-center text-xs">
                Already a gamer? Login here brother
              </MotionLink>
              <MotionButton flex onClick={handleSubmit(onSubmit)} disabled={!isValid}>
                Register
              </MotionButton>
            </div>
          </div>
        </MotionContainer>
      </Form>
    </Page>
  )
}

export default RegisterForm
