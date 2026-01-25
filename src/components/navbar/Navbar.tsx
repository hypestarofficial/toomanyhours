import { forwardRef } from "react"
import type { ComponentPropsWithoutRef } from "react"
import MotionLink from "../motionLink/MotionLink"
import useAuthStore from "../../store/useAuthStore"
import UserMenu from "./UserMenu"
import styles from "./Navbar.module.css"
import MotionContainer from "../motionContainer/MotionContainer"

type NavbarProps = ComponentPropsWithoutRef<"nav">

const AuthenticatedNavbar = () => (
  <MotionContainer type="ease" className={styles.navContent}>
    <UserMenu />
  </MotionContainer>
)

const UnauthenticatedNavbar = () => (
  <MotionContainer type="ease" className={styles.navContent}>
    <MotionLink to="/login">Login</MotionLink>
    <div className={styles.dividerY} />
    <MotionLink to="/register">Register</MotionLink>
  </MotionContainer>
)

const Navbar = forwardRef<HTMLElement, NavbarProps>((props, ref) => {
  const { authenticated } = useAuthStore()

  return (
    <nav ref={ref} {...props} className={styles.nav}>
      <MotionLink to="/" className={styles.title}>
        tooManyHours
      </MotionLink>
      {authenticated ? <AuthenticatedNavbar /> : <UnauthenticatedNavbar />}
    </nav>
  )
})

export default Navbar
