import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronDownIcon } from "@heroicons/react/24/outline"
import { colors } from "../../../utils/colors"
import MotionButton from "../../motionButton/MotionButton"
import { cn } from "../../../utils/cn"
import type { LIST_TYPE } from "../../../helpers/enums"

type Option = {
  label: string
  value: LIST_TYPE
}

type SelectProps = {
  options: Option[]
  value: LIST_TYPE | null
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

const Select: React.FC<SelectProps> = ({ options, value, onChange, placeholder = "Select an option", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const toggleOpen = () => setIsOpen(!isOpen)
  const selectedLabel = value ? options.find((opt) => opt.value === value)?.label : null

  return (
    <div className="relative flex">
      <MotionButton onClick={toggleOpen} flex className="justify-between" disabled={disabled} noTap>
        <span className={cn("text-sm font-medium", !selectedLabel && "opacity-50")}>{selectedLabel || placeholder}</span>

        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="inline-block">
          <ChevronDownIcon className="h-5 w-5" />
        </motion.span>
      </MotionButton>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10, scale: 0.95, backgroundColor: colors.secondaryBg }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-10 z-10 w-full overflow-hidden rounded-lg py-1"
          >
            {options.map((option) => (
              <motion.li
                key={option.value}
                whileHover={{ backgroundColor: colors.highlight, color: colors.primary }}
                transition={{ duration: 0.15 }}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className="cursor-pointer px-4 py-2 text-sm"
              >
                {option.label}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Select
