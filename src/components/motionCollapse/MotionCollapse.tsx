import { ChevronDownIcon } from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { colors } from "../../utils/colors"

type CollapseProps = {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export const MotionCollapse = ({ title, children, defaultOpen = false }: CollapseProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="flex w-full flex-col gap-3 pb-5">
      <motion.button
        initial={{ color: colors.text, borderBottomWidth: 1, borderBottomColor: "white" }}
        whileHover={{ color: colors.primary }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-0! pb-3! text-left"
        aria-expanded={isOpen}
      >
        <h4 className="font-semibold">{title}</h4>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
          <ChevronDownIcon className="h-5 w-5 text-white" />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MotionCollapse
