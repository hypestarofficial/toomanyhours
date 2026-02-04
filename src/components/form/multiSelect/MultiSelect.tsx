import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "motion/react"
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline"
import { colors } from "../../../utils/colors"
import MotionButton from "../../motionButton/MotionButton"
import Badge from "../../badge/Badge"

type Option<T extends string | number> = {
  label: string
  value: T
}

type MultiSelectProps<T extends string | number> = {
  options: Option<T>[]
  value: T[]
  onChange: (value: T[]) => void
  placeholder?: string
  disabled?: boolean
}

const MultiSelect = <T extends string | number>({
  options,
  value = [],
  onChange,
  placeholder = "Select options",
  disabled = false,
}: MultiSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const buttonRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)

  const toggleOpen = () => !disabled && setIsOpen(!isOpen)

  const handleSelect = (optionValue: T) => {
    const newValue = value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue]
    onChange(newValue)
  }

  const selectedOptions = options.filter((opt) => value.includes(opt.value))

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        buttonRef.current &&
        dropdownRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return (
    <div ref={buttonRef} className="relative flex w-full">
      <MotionButton onClick={toggleOpen} flex className="min-h-[40px] w-full min-w-[9rem] justify-between px-2!" disabled={disabled} noTap>
        <div className="flex flex-wrap items-center gap-1 overflow-hidden">
          {selectedOptions.length > 0 ? (
            <>
              {selectedOptions.slice(0, 3).map((opt) => (
                <Badge key={opt.value}>{opt.label}</Badge>
              ))}

              {selectedOptions.length > 3 && <Badge>{`+${selectedOptions.length - 3}`}</Badge>}
            </>
          ) : (
            <span className="text-sm font-medium opacity-50">{placeholder}</span>
          )}
        </div>

        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }} className="ml-2 inline-block">
          <ChevronDownIcon className="h-5 w-5" />
        </motion.span>
      </MotionButton>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, backgroundColor: colors.secondaryBg }}
              animate={{ opacity: 1, y: 5 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: "absolute",
                top: `${position.top}px`,
                left: `${position.left}px`,
                width: `${position.width}px`,
                zIndex: 9999,
              }}
              className="overflow-hidden rounded-lg py-1"
            >
              <div className="flex justify-end py-2">
                <MotionButton size="menu" variant="text" onClick={() => onChange([])}>
                  Clear
                </MotionButton>
              </div>
              {options.map((option) => (
                <motion.li
                  key={option.value}
                  whileHover={{ backgroundColor: colors.highlight, color: colors.primary }}
                  onClick={() => handleSelect(option.value)}
                  className="flex cursor-pointer items-center justify-between px-4 py-2 text-sm"
                >
                  <span>{option.label}</span>
                  {value.includes(option.value) && <CheckIcon className="text-primary h-4 w-4" />}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}

export default MultiSelect
