import { ChevronDownIcon } from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "motion/react"
import { useState } from "react"
import { colors } from "../../utils/colors"

type CollapseProps = {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

const MotionCollapse = ({ title, children, defaultOpen = false }: CollapseProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="flex w-full flex-col gap-3 border-b! border-white! pb-5">
      <motion.button
        initial={{ color: colors.text }}
        whileHover={{ color: colors.primary }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <h4 className="font-semibold">{title}</h4>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDownIcon className="h-5 w-5 text-white" />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="py-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MotionCollapse
