import { forwardRef } from "react"
import type { ComponentPropsWithoutRef } from "react"
import MotionLink from "../motionLink/MotionLink"
import useAuthStore from "../../store/useAuthStore"
import UserMenu from "./UserMenu"
import styles from "./Navbar.module.css"
import MotionContainer from "../motionContainer/MotionContainer"
import { motion } from "motion/react"
import { colors } from "../../utils/colors"
import IgdbLogo from "../../assets/igdb.svg?react"
import { routes } from "../../helpers/routes"
import { Link } from "react-router"

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
        {/* The version sits outside the wordmark on purpose: stacked over the
            IGDB credit it made a two-line block, and items-baseline aligns a
            block's *first* line, so the credit hung below the title. */}
        <div className="flex items-center gap-2">
          {/* From package.json via Vite's define, so it is a literal in the
              bundle and moves on rebuild with nothing to configure. */}
          {/* The version number is the thing someone clicks to ask what
              changed, so it should answer. */}
          <Link to={routes.changelog} className={styles.versionChip} title="What's new">
            v{__APP_VERSION__}
          </Link>
        </div>
        {/* Baseline-aligned rather than bottom-aligned: the credit sits on the
            same line as the title instead of dropping into its descender space,
            which is what reads as one piece of type rather than two. This only
            works while it is a single line — see the version chip above. */}
        <div className="flex items-baseline gap-1">
          <h1 className={styles.title}>tooManyHours</h1>
          {/* IGDB asks to be credited where their data is used. "powered by"
              stays as text and only the name became the logo, so the credit
              still reads as a sentence — and only the logo is the link, for
              the same reason: a credit that reads as a sentence should not
              have the whole sentence underlined.

              The accessible name sits on the anchor rather than the svg: a
              link needs its own name, and leaving one on both announces
              "IGDB" twice. */}
          <span className={styles.attribution}>
            powered by
            <motion.a
              initial={{ color: colors.text }}
              whileHover={{ color: colors.primary }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              href="https://www.igdb.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="IGDB"
              className="inline-flex"
            >
              <IgdbLogo className={styles.igdbLogo} aria-hidden="true" />
            </motion.a>
          </span>
        </div>
      </div>
      {authenticated ? <AuthenticatedNavbar /> : <UnauthenticatedNavbar />}
    </nav>
  )
})

export default Navbar
