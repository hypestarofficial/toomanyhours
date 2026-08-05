import { toast } from "sonner"
import { useState } from "react"
import { Controller, Form, useForm } from "react-hook-form"
import type { SubmitHandler } from "react-hook-form"
import Input from "../../components/form/input/Input"
import Loader from "../../components/loader/Loader"
import MotionButton from "../../components/motionButton/MotionButton"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import MotionLink from "../../components/motionLink/MotionLink"
import styles from "./Auth.module.css"
import { useNavigate } from "react-router"
import useAuthStore from "../../store/useAuthStore"
import { beginSession } from "../../api/session"
import { register } from "../../api/endpoints/auth"
import { routes } from "../../helpers/routes"
import { handleError } from "../../utils/errors"
import Page from "../../components/page/Page"

type Inputs = {
  username: string
  email: string
  password: string
}

const RegisterForm: React.FC = () => {
  const { setAuthenticated, setJwtToken } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
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

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true)

    try {
      const result = await register({ username: data.username, email: data.email, password: data.password })

      if (result && result.access_token) {
        localStorage.setItem("session_active", "true")

        setJwtToken(result.access_token)
        setAuthenticated(true)
        toast.success("Welcome to the club!")
        // Without this the access token expires in 15 minutes with nothing
        // renewing it, and the user is silently logged out mid-session.
        beginSession()
        navigate(routes.myList)
      }
    } catch (error: unknown) {
      handleError({ error, userMessage: "Could not create account", componentName: "RegisterForm" })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <Loader fullPage />
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
                rules={{
                  required: "Game tag is required",
                  minLength: { value: 3, message: "At least 3 characters" },
                  // Uppercase is accepted because the server lowercases it.
                  // Rejecting it here would be a lie about what's allowed.
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Letters, numbers and underscores only" },
                }}
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
                  minLength: { value: 8, message: "Password must be at least 8 characters long" },
                }}
                render={({ field, formState: { errors } }) => (
                  <Input
                    type="password"
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
              <MotionButton type="submit" flex disabled={!isValid}>
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
