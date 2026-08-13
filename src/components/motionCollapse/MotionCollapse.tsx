import { ChevronDownIcon } from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "motion/react"
import { colors } from "../../utils/colors"
import Loader from "../loader/Loader"

type CollapseProps = {
  title: string
  children: React.ReactNode
  /**
   * Controlled. It used to own this in useState seeded from a defaultOpen it
   * read only on mount, which meant a parent could never open it — and MyList
   * was already storing the same flag, so there were two sources of truth
   * synced one way, once. Filtering needs to open every section, so the state
   * lives with the parent that knows about the filter.
   */
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading?: boolean
  /**
   * How many things are inside, shown beside the title. Undefined hides it
   * entirely, which is what a section still loading passes — a 0 mid-fetch
   * reads as "none" a moment before the content arrives.
   */
  count?: number
}

const MotionCollapse = ({ title, children, open, onOpenChange, isLoading = false, count }: CollapseProps) => (
  <div className="flex w-full flex-col gap-3 border-b! border-white! pb-5">
    <motion.button
      initial={{ color: colors.text }}
      whileHover={{ color: colors.primary }}
      onClick={() => onOpenChange(!open)}
      className="flex w-full items-center justify-between text-left"
    >
      <div className="flex items-baseline gap-2">
        <h4 className="font-semibold select-none">{title}</h4>
        {/* A bare dimmed number, as DlcList prints beside its own heading — no
            parentheses, and no size of its own, so it sits at the title's size
            rather than the small one that suits a heading inside a card. */}
        {count !== undefined && <span className="opacity-60 select-none">{count}</span>}
      </div>
      <motion.div animate={{ rotate: open ? 180 : 0 }}>
        <ChevronDownIcon className="h-5 w-5 text-white" />
      </motion.div>
    </motion.button>

    <AnimatePresence initial={false}>
      {open && (
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

export default MotionCollapse
