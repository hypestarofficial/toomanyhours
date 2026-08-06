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
import { routes } from "../../helpers/routes"

type NavbarProps = ComponentPropsWithoutRef<"nav">

const AuthenticatedNavbar = () => (
  <MotionContainer type="ease" className={styles.navContent}>
    <MotionLink to={routes.myList}>My list</MotionLink>
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
        {/* Centred, not baseline-aligned. Baseline alignment was right while the
            credit was a single line, but it aligns a block's *first* line — so
            the second line hung below the title, pushing the whole group taller
            than the wordmark and dragging the GitHub icon (centred on that
            group) visibly low. Centring makes the stack straddle the title. */}
        <div className="flex items-center gap-2">
          <h1 className={styles.title}>tooManyHours</h1>
          {/* Version above the credit: two facts about the build, stacked so
              they read as metadata rather than competing with the wordmark.
              The version comes from package.json via Vite's define. */}
          <div className="flex flex-col leading-tight">
            <span className={styles.attribution}>v{__APP_VERSION__}</span>
            {/* IGDB asks to be credited where their data is used. */}
            <span className={styles.attribution}>powered by IGDB</span>
          </div>
        </div>
      </div>
      {authenticated ? <AuthenticatedNavbar /> : <UnauthenticatedNavbar />}
    </nav>
  )
})

export default Navbar
