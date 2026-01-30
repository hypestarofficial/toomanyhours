import { UserCircleIcon } from "@heroicons/react/24/solid"
import styles from "./Navbar.module.css"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import MotionButton from "../motionButton/MotionButton"
import useAuthStore from "../../store/useAuthStore"
import { routes } from "../../helpers/routes"
import { useNavigate } from "react-router"
import { logout } from "../../api/endpoints/auth"

const UserMenu: React.FC = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuSize, setMenuSize] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { setAuthenticated, setJwtToken, user, setUser } = useAuthStore()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpen && menuRef.current && !(menuRef.current as HTMLElement).contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  useEffect(() => {
    const el = buttonRef.current
    if (!el) return
    const sync = () => setMenuSize(el.offsetWidth)
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handleProfile = () => {
    navigate(routes.profile)
    setMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      localStorage.removeItem("session_active")
    } catch (error: unknown) {
      console.error(error, "UserMenu")
    } finally {
      setAuthenticated(false)
      setJwtToken("")
      setMenuOpen(false)
      setUser(null)
      navigate(routes.login)
    }
  }

  return (
    <div ref={menuRef} className="relative inline-block">
      <MotionButton ref={buttonRef} variant="text" size="menu" onClick={() => setMenuOpen(!menuOpen)} className={styles.profile}>
        <span className="text-base">{user?.username || "Unknown user"}</span>
        <UserCircleIcon className="h-6 w-6" />
      </MotionButton>

      <AnimatePresence>
        {menuOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="bg-secondaryBg border-bg absolute top-9 right-0 flex flex-col gap-1 rounded-xl border-2 p-2"
            style={{ width: menuSize }}
          >
            <MotionButton size="menu" onClick={handleProfile}>
              Profile
            </MotionButton>
            <div className={styles.dividerX} />
            <MotionButton size="menu" onClick={handleLogout}>
              Logout
            </MotionButton>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserMenu
