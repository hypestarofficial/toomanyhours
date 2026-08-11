import { LinkIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"
import MotionButton from "../motionButton/MotionButton"
import { copyText } from "../../utils/clipboard"

type ShareListButtonProps = {
  /** The absolute link to copy. Built by the caller, from profileShareUrl. */
  url: string
  disabled?: boolean
  /** Why it is disabled, shown instead of the URL. */
  disabledReason?: string
}

/**
 * Copies a link to a public profile.
 *
 * Takes the URL rather than reading the signed-in user, because it serves two
 * pages: on MyList it shares your own list, and on someone else's profile it
 * shares theirs. Reading the auth store would have made the second case copy
 * the wrong link — silently, since both are valid URLs.
 *
 * It sits in the list toolbar rather than in profile settings because sharing
 * is something you do while looking at the list you want to show someone.
 */
const ShareListButton: React.FC<ShareListButtonProps> = ({ url, disabled = false, disabledReason }) => {
  const handleCopy = async () => {
    if (await copyText(url)) {
      toast.success("Link copied")
      return
    }
    // The URL goes in the message rather than an apology: with no field on this
    // page to select from, the toast is the user's only way through.
    toast.error(`Could not copy. The link is ${url}`)
  }

  return (
    <MotionButton
      size="square"
      onClick={handleCopy}
      disabled={disabled || !url}
      ariaLabel="Copy the link to this list"
      title={disabled && disabledReason ? disabledReason : `Copy the link: ${url}`}
      icon={<LinkIcon className="h-5 w-5" />}
    >
      {/* children is required by MotionButtonProps; {null} satisfies it without
          rendering anything, as in LayoutToggle. */}
      {null}
    </MotionButton>
  )
}

export default ShareListButton
