import { useRef, useState } from "react"
import { ArrowUpTrayIcon, PhotoIcon } from "@heroicons/react/24/outline"
import Modal from "../../components/modal/Modal"
import MotionButton from "../../components/motionButton/MotionButton"
import { cn } from "../../utils/cn"
import { ACCEPTED_AVATAR_LABEL, ACCEPTED_AVATAR_TYPES, MAX_AVATAR_FILE_LABEL, avatarFileError } from "./avatarFile"

type AvatarUploadModalProps = {
  isOpen: boolean
  onClose: () => void
  /** Called with a file that has already passed avatarFileError. */
  onSelect: (file: File) => void
  busy: boolean
}

/**
 * Picking a photo: drop one on the zone, or choose one from the file dialog.
 *
 * Both routes converge on `choose`, so the format and size rules cannot apply
 * to one and not the other — a drop bypasses the `accept` attribute entirely,
 * which is the trap here. `accept` stays on the input anyway, because it is
 * what keeps the OS dialog from offering files that would be refused.
 *
 * The limits are written on the zone rather than discovered by hitting them: a
 * dialog that only tells you the rules after you break them is a worse dialog.
 */
const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({ isOpen, onClose, onSelect, busy }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const choose = (file: File | undefined) => {
    // Cleared so picking the same file twice still fires a change event — which
    // is exactly what happens after a rejected pick, when the file dialog is
    // reopened and the same wrong file is corrected by choosing another.
    if (inputRef.current) inputRef.current.value = ""
    if (!file) return

    const problem = avatarFileError(file)
    if (problem) {
      // Shown in the dialog rather than as a toast: the dialog is where the
      // mistake was made and where the next attempt happens.
      setError(problem)
      return
    }

    setError(null)
    onSelect(file)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragging(false)
    if (busy) return

    choose(event.dataTransfer.files?.[0])
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex w-full flex-col gap-4 p-6">
        <h2 className="text-lg font-semibold">Profile photo</h2>

        <div
          // preventDefault on dragOver is what makes this a drop target at all;
          // without it the browser navigates to the dropped file.
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
            dragging ? "border-primary bg-secondaryBg" : "border-secondaryBg",
            busy && "opacity-60",
          )}
        >
          <PhotoIcon className="h-10 w-10 opacity-70" />
          <p className="text-sm">Drag a photo here</p>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_AVATAR_TYPES.join(",")}
            className="hidden"
            onChange={(event) => choose(event.currentTarget.files?.[0])}
          />
          <MotionButton icon={<ArrowUpTrayIcon className="h-4 w-4" />} onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? "Uploading…" : "Choose a file"}
          </MotionButton>
        </div>

        <p className="text-xs opacity-70">
          {ACCEPTED_AVATAR_LABEL}, up to {MAX_AVATAR_FILE_LABEL}. Photos are cropped to a square and resized to 256×256 before they are
          uploaded, so only the middle of a wide photo is kept.
        </p>

        {error && <p className="text-error text-sm font-semibold">{error}</p>}
      </div>
    </Modal>
  )
}

export default AvatarUploadModal
