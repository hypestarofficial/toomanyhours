import { toast } from "sonner"
import MotionButton from "../../components/motionButton/MotionButton"
import Input from "../../components/form/input/Input"
import MotionLink from "../../components/motionLink/MotionLink"
import styles from "./Auth.module.css"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import useAuthStore from "../../store/useAuthStore"
import { Controller, Form, useForm, type SubmitHandler } from "react-hook-form"
import { useNavigate } from "react-router"
import { handleError } from "../../utils/errors"
import Page from "../../components/page/Page"
import { routes } from "../../helpers/routes"
import { useState } from "react"
import Loader from "../../components/loader/Loader"
import useAuth from "../../hooks/api/useAuth"

type Inputs = {
  email: string
  password: string
}

const LoginForm: React.FC = () => {
  const { setAuthenticated, setJwtToken } = useAuthStore()
  const { toggleRefresh } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const {
    control,
    formState: { isValid },
  } = useForm<Inputs>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  })

  const onSubmit: SubmitHandler<Inputs> = async (data, event) => {
    event?.preventDefault()
    setIsLoading(true)
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include" as RequestCredentials,
      body: JSON.stringify(data),
    }

    try {
      const response = await fetch("/api/authenticate", requestOptions)
      const result = await response.json()

      if (result.error) {
        handleError(result.message, "LoginForm")
      } else {
        setJwtToken(result.access_token)
        setAuthenticated(true)
        toast.success("Login successful")
        toggleRefresh(true)
        navigate(routes.home)
      }
    } catch (error: unknown) {
      console.error(error, "LoginForm")
      handleError(error, "LoginForm")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <Loader fullPage />
  }

  return (
    <Page>
      <Form control={control} onSubmit={({ data, event }) => onSubmit(data, event)}>
        <MotionContainer className={styles.form}>
          <h1>login</h1>
          <div className={styles.container}>
            <div className={styles.colWrapper}>
              <Controller
                name="email"
                control={control}
                rules={{ pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" } }}
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
                render={({ field, formState: { errors } }) => (
                  <Input
                    type="password"
                    maxLength={16}
                    label="Password"
                    autoComplete="current-password"
                    id="password"
                    placeholder="********"
                    {...field}
                    error={errors.password?.message}
                  />
                )}
              />
            </div>
            <div className={styles.buttonWrapper}>
              <MotionLink to={routes.register} className="text-center text-xs">
                No bitches? Register here brother
              </MotionLink>
              <MotionButton type="submit" flex disabled={!isValid || isLoading}>
                Login
              </MotionButton>
            </div>
          </div>
        </MotionContainer>
      </Form>
    </Page>
  )
}

export default LoginForm
