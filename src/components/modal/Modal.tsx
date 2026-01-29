import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"
import styles from "./Modal.module.css"
import { XMarkIcon } from "@heroicons/react/24/outline"
import MotionIconButton from "../motionIconButton/MotionIconButton"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  backdrop?: boolean
}

const Modal = ({ isOpen, onClose, children, backdrop = true }: ModalProps) => {
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
            className={styles.modal}
          >
            <div className={styles.modalContent}>
              <MotionIconButton icon={<XMarkIcon />} onClick={onClose} className={styles.closeBtn} />
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default Modal
