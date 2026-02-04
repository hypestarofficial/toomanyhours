import type React from "react"
import Modal from "../modal/Modal"
import MotionButton from "../motionButton/MotionButton"
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from "@heroicons/react/24/outline"

type DialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  children: React.ReactNode
  title?: string
  type?: "success" | "info" | "warning" | "error"
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, onConfirm, children, title, type }) => {
  const typeMap = {
    success: <CheckCircleIcon className="text-success" />,
    info: <InformationCircleIcon className="text-info" />,
    warning: <ExclamationTriangleIcon className="text-warning" />,
    error: <XCircleIcon className="text-error" />,
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeBtn={false}
      size="sm"
      footer={
        <div className="flex w-full items-center justify-center gap-2 p-4">
          <MotionButton variant="error" flex onClick={onClose}>
            Cancel
          </MotionButton>
          <MotionButton variant="success" flex onClick={onConfirm}>
            Confirm
          </MotionButton>
        </div>
      }
    >
      <div className="flex w-full flex-col items-center justify-center gap-2 px-6 pb-4">
        {type && <div className="flex h-20 w-20 items-center justify-center">{typeMap[type]}</div>}
        {title && <span className="text-2xl font-bold">{title}</span>}
        {children}
      </div>
    </Modal>
  )
}

export default Dialog
