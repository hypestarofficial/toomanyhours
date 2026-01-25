import { AnimatePresence, motion } from "motion/react"
import { colors } from "../../../utils/colors"
import { useRef, useState, useEffect } from "react"
import { EyeIcon } from "@heroicons/react/24/outline"
import { EyeSlashIcon } from "@heroicons/react/20/solid"

const SIDE_LABEL_GAP = 8

type InputProps = {
  type: string
  label: string
  sideLabel?: boolean
  id: string
} & React.InputHTMLAttributes<HTMLInputElement>

const Input: React.FC<InputProps> = ({ id, type, label, sideLabel = true, maxLength, ...props }) => {
  const ref = useRef<HTMLInputElement>(null)
  const [inputWidth, setInputWidth] = useState(0)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const sync = () => setInputWidth(el.offsetWidth)
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="relative flex flex-col gap-1">
      <label
        htmlFor={id}
        className={sideLabel ? "absolute top-0 bottom-0 flex items-center justify-center whitespace-nowrap" : ""}
        style={sideLabel ? { right: inputWidth + SIDE_LABEL_GAP } : undefined}
      >
        {label}
      </label>
      <div ref={ref} className="bg-bg flex h-10 overflow-hidden rounded-md">
        <motion.input
          className="w-full rounded-l-md px-2 py-1 focus:outline-none"
          type={showPassword ? "text" : type}
          maxLength={maxLength}
          id={id}
          placeholder={props.placeholder}
          initial={{ backgroundColor: colors.secondaryBg }}
          whileFocus={{ backgroundColor: colors.inputBg, color: colors.bg }}
          transition={{ duration: 0.1 }}
        />
        {type === "password" && (
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="relative p-2 transition-colors focus:outline-none"
            type="button"
          >
            <AnimatePresence mode="wait" initial={false}>
              {showPassword ? (
                <motion.div
                  key="visible"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ color: colors.primary }}
                  transition={{ duration: 0.15 }}
                >
                  <EyeIcon className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="hidden"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ color: colors.primary }}
                  transition={{ duration: 0.15 }}
                >
                  <EyeSlashIcon className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>
    </div>
  )
}

export default Input
