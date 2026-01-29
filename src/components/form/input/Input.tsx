import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react"
import { colors } from "../../../utils/colors"
import { useRef, useState, useEffect, type ChangeEvent } from "react"
import { EyeIcon } from "@heroicons/react/24/outline"
import { EyeSlashIcon } from "@heroicons/react/20/solid"
import styles from "./Input.module.css"
import { XCircleIcon } from "@heroicons/react/24/solid"
import { cn } from "../../../utils/cn"

const SIDE_LABEL_GAP = 8

type InputProps = {
  type: string
  label?: string
  sideLabel?: boolean
  id: string
  name?: string
  error?: string | null
  clearable?: boolean
} & HTMLMotionProps<"input">

const Input: React.FC<InputProps> = ({ id, type, label, sideLabel = true, name, maxLength, error, clearable = false, ...props }) => {
  const ref = useRef<HTMLInputElement>(null)
  const [inputWidth, setInputWidth] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const sync = () => setInputWidth(el.offsetWidth)
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handleClear = () => {
    if (props.onChange) {
      props.onChange({ target: { value: "" } } as ChangeEvent<HTMLInputElement>)
    }
  }

  return (
    <div className={styles.inputContainer}>
      {label && (
        <label
          htmlFor={id}
          className={sideLabel ? styles.sideLabel : ""}
          style={sideLabel ? { right: inputWidth + SIDE_LABEL_GAP } : undefined}
        >
          {label}
        </label>
      )}
      {error && <p className="errorStr">{error}</p>}
      <div ref={ref} className={styles.inputWrapper}>
        <motion.input
          className={cn(styles.input, clearable ? "relative rounded-md" : "rounded-l-md")}
          type={showPassword ? "text" : type}
          maxLength={maxLength}
          id={id}
          placeholder={props.placeholder}
          initial={{ backgroundColor: colors.secondaryBg }}
          whileFocus={{ backgroundColor: colors.inputBg, color: colors.bg }}
          transition={{ duration: 0.1 }}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
          name={name}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {type === "password" && (
          <button onClick={() => setShowPassword(!showPassword)} className={styles.passwordToggle} type="button">
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
                  <EyeIcon className={styles.icon} />
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
                  <EyeSlashIcon className={styles.icon} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        )}
        {clearable && props.value && (
          <motion.button
            key="clear"
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            onClick={handleClear}
            className={cn(styles.clear, isFocused ? "text-bg" : "text-text")}
            type="button"
          >
            <XCircleIcon className={styles.iconClear} />
          </motion.button>
        )}
      </div>
    </div>
  )
}

export default Input
