import { ChevronDownIcon } from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "motion/react"
import { useEffect, useState } from "react"
import { colors } from "../../utils/colors"
import Loader from "../loader/Loader"

type CollapseProps = {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  setDefaultOpen?: (open: boolean) => void
  isLoading?: boolean
}

const MotionCollapse = ({ title, children, defaultOpen = false, setDefaultOpen, isLoading = false }: CollapseProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  useEffect(() => {
    if (setDefaultOpen) {
      setDefaultOpen(isOpen)
    }
  }, [isOpen])

  return (
    <div className="flex w-full flex-col gap-3 border-b! border-white! pb-5">
      <motion.button
        initial={{ color: colors.text }}
        whileHover={{ color: colors.primary }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <h4 className="font-semibold select-none">{title}</h4>
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
            <div className="py-4">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Loader fullPage />
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {children}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MotionCollapse
