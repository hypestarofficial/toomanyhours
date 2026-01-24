import { forwardRef } from "react"
import type { ComponentPropsWithoutRef } from "react"

import { Link } from "react-router"
import styles from "./Navbar.module.css"

type NavbarProps = ComponentPropsWithoutRef<"nav">

const Navbar = forwardRef<HTMLElement, NavbarProps>((props, ref) => (
  <nav ref={ref} {...props} className={styles.nav}>
    <h3 className={styles.title}>tooManyHours</h3>
    <ul className="flex gap-4">
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/about">About</Link>
      </li>
    </ul>
  </nav>
))

export default Navbar
