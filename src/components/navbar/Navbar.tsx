import { forwardRef } from "react"
import type { ComponentPropsWithoutRef } from "react"
import MotionLink from "../motionLink/MotionLink"
import useAuthStore from "../../store/useAuthStore"
import UserMenu from "./UserMenu"
import styles from "./Navbar.module.css"
import MotionContainer from "../motionContainer/MotionContainer"
import { motion } from "motion/react"
import { colors } from "../../utils/colors"
import GithubIcon from "../../assets/github.svg?react"
import { adminRoutes, routes } from "../../helpers/routes"

type NavbarProps = ComponentPropsWithoutRef<"nav">

const AuthenticatedNavbar = () => (
  <MotionContainer type="ease" className={styles.navContent}>
    <MotionLink to={adminRoutes.games}>Admin</MotionLink>
    <MotionLink to={routes.home}>My list</MotionLink>
    <UserMenu />
  </MotionContainer>
)

const UnauthenticatedNavbar = () => (
  <MotionContainer type="ease" className={styles.navContent}>
    <MotionLink to={routes.login}>Login</MotionLink>
    <div className={styles.dividerY} />
    <MotionLink to={routes.register}>Register</MotionLink>
  </MotionContainer>
)

const Navbar = forwardRef<HTMLElement, NavbarProps>((props, ref) => {
  const { authenticated } = useAuthStore()

  return (
    <nav ref={ref} {...props} className={styles.nav}>
      <div className="flex items-center justify-start gap-3">
        <h1 className={styles.title}>tooManyHours</h1>
        <motion.a
          initial={{ color: colors.text }}
          whileHover={{ color: colors.primary }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          href="https://github.com/hypestarofficial"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary"
        >
          <GithubIcon className="h-5 w-5" />
        </motion.a>
      </div>
      {authenticated ? <AuthenticatedNavbar /> : <UnauthenticatedNavbar />}
    </nav>
  )
})

export default Navbar
