import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "motion/react"
import { useEffect } from "react"
import styles from "./Modal.module.css"
import { XMarkIcon } from "@heroicons/react/24/outline"
import MotionIconButton from "../motionIconButton/MotionIconButton"
import { cn } from "../../utils/cn"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  closeBtn?: boolean
  children: React.ReactNode
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  backdrop?: boolean
  footer?: React.ReactNode
}

// How many modals are open. `document.body.style.overflow` is one global
// value, so a nested modal — the remove confirmation inside the game detail
// modal — would unlock scrolling for its parent when it closed. The lock has
// to be counted, not toggled.
let openModalCount = 0

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, backdrop = true, footer, size = "md", closeBtn = true }) => {
  useEffect(() => {
    if (!isOpen) return

    openModalCount += 1
    document.body.style.overflow = "hidden"

    return () => {
      openModalCount -= 1
      if (openModalCount === 0) {
        document.body.style.overflow = "unset"
      }
    }
  }, [isOpen])

  // Every one is sm:-prefixed, and that prefix is load-bearing. min-width beats
  // max-width in the cascade, so a bare min-w-md here overrode .modal's
  // max-w-[90%] and made a 448px dialog on a 390px phone — overflowing the
  // viewport sideways and taking the page with it. Below sm the modal takes its
  // width from .modal instead; from sm up these are unchanged.
  const sizeMap = {
    xs: "sm:min-w-xs",
    sm: "sm:min-w-sm",
    md: "sm:min-w-md",
    lg: "sm:min-w-lg",
    xl: "sm:min-w-xl",
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className={styles.wrapper}>
          {backdrop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className={styles.backdrop}
              aria-hidden="true"
            />
          )}

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(styles.modal, sizeMap[size])}
          >
            <div className={styles.modalHeader}>
              {closeBtn && <MotionIconButton icon={<XMarkIcon />} onClick={onClose} className={styles.closeBtn} />}
            </div>
            <div className={styles.modalContent}>{children}</div>
            {footer && <div className={styles.modalFooter}>{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default Modal
