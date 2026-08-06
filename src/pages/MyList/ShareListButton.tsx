import { LinkIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"
import MotionButton from "../../components/motionButton/MotionButton"
import useAuthStore from "../../store/useAuthStore"
import { profileShareUrl } from "../../helpers/shareUrl"
import { copyText } from "../../utils/clipboard"

/**
 * Copies the link to the owner's public profile.
 *
 * It sits in the list toolbar rather than in profile settings because sharing
 * is something you do while looking at the list you want to show someone.
 */
const ShareListButton: React.FC = () => {
  const { user } = useAuthStore()

  const shareUrl = profileShareUrl(window.location.origin, user?.username ?? "")
  const isPrivate = user?.visibility === "private"

  const handleCopy = async () => {
    if (await copyText(shareUrl)) {
      toast.success("Link copied")
      return
    }
    // The URL goes in the message rather than an apology: with no field on this
    // page to select from, the toast is the user's only way through.
    toast.error(`Could not copy. Your link is ${shareUrl}`)
  }

  return (
    // Disabled rather than warned about while the profile is private: the API
    // answers 403 to everyone else, so the link would look broken to the friend
    // and give the owner no clue why. The tooltip says where to change it.
    <MotionButton
      size="square"
      onClick={handleCopy}
      disabled={isPrivate || !shareUrl}
      ariaLabel="Copy the link to your public list"
      title={isPrivate ? "Your profile is private — make it public in settings to share it" : `Copy your link: ${shareUrl}`}
      icon={<LinkIcon className="h-5 w-5" />}
    >
      {/* children is required by MotionButtonProps; {null} satisfies it without
          rendering anything, as in LayoutToggle. */}
      {null}
    </MotionButton>
  )
}

export default ShareListButton
