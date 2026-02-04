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

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, backdrop = true, footer, size = "md", closeBtn = true }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const sizeMap = {
    xs: "min-w-xs",
    sm: "min-w-sm",
    md: "min-w-md",
    lg: "min-w-lg",
    xl: "min-w-xl",
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
