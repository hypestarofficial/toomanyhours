import { motion } from "motion/react"
import type { HTMLMotionProps } from "motion/react"
import { colors } from "../../../utils/colors"
import { useRef, useState, useEffect } from "react"
import styles from "./TextArea.module.css"
import { cn } from "../../../utils/cn"

const SIDE_LABEL_GAP = 8

type TextAreaProps = {
  label?: string
  sideLabel?: boolean
  id: string
  name?: string
  error?: string | null
  rows?: number
} & HTMLMotionProps<"textarea">

const TextArea: React.FC<TextAreaProps> = ({ id, label, sideLabel = true, name, maxLength, error, rows = 3, ...props }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [inputWidth, setInputWidth] = useState(0)

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
    <div ref={ref} className={styles.inputContainer}>
      {label && (
        <label
          htmlFor={id}
          className={cn(styles.label, sideLabel && styles.sideLabel)}
          style={sideLabel ? { right: inputWidth + SIDE_LABEL_GAP } : undefined}
        >
          {label}
        </label>
      )}
      {error && <p className="errorStr">{error}</p>}
      <motion.textarea
        className={cn(styles.input)}
        rows={rows}
        spellCheck="false"
        maxLength={maxLength}
        id={id}
        placeholder={props.placeholder}
        initial={{ backgroundColor: colors.secondaryBg, color: colors.text }}
        animate={{ backgroundColor: colors.secondaryBg }}
        whileFocus={{ backgroundColor: colors.inputBg, color: colors.bg }}
        transition={{ duration: 0.1 }}
        autoCapitalize="off"
        autoCorrect="off"
        name={name}
        {...props}
      />
    </div>
  )
}

export default TextArea
