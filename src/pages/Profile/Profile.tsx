import { useState } from "react"
import { toast } from "sonner"
import Avatar from "../../components/avatar/Avatar"
import Input from "../../components/form/input/Input"
import Select from "../../components/form/select/Select"
import MotionButton from "../../components/motionButton/MotionButton"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import Page from "../../components/page/Page"
import useAuthStore from "../../store/useAuthStore"
import { usePatchMeMutation } from "../../api/endpoints/useQuery"
import { handleError } from "../../utils/errors"
import { copyText } from "../../utils/clipboard"
import { profileShareUrl } from "../../helpers/shareUrl"
import { LinkIcon } from "@heroicons/react/24/outline"
import type { Visibility } from "../../types/users"

const visibilityOptions: { label: string; value: Visibility }[] = [
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
]

const Profile: React.FC = () => {
  const { user } = useAuthStore()
  const [username, setUsername] = useState(user?.username ?? "")
  const patchMe = usePatchMeMutation()

  const usernameChanged = username !== user?.username && username.length >= 3

  const handleSaveUsername = () => {
    patchMe.mutate(
      { username },
      {
        onSuccess: () => toast.success("Game tag updated"),
        onError: (error) => handleError({ error, userMessage: "Could not update game tag", componentName: "Profile" }),
      },
    )
  }

  // The saved username, not the input's: typing a new tag must not change the
  // link until it is saved, or the copied URL 404s.
  const shareUrl = profileShareUrl(window.location.origin, user?.username ?? "")
  const isPrivate = user?.visibility === "private"

  const handleCopyLink = async () => {
    if (await copyText(shareUrl)) {
      toast.success("Link copied")
      return
    }
    // Not a thrown error: the field beside the button still holds the link, so
    // the user has a way through.
    toast.error("Could not copy — select the link and copy it manually")
  }

  const handleVisibilityChange = (value: string | number) => {
    patchMe.mutate(
      { visibility: value as Visibility },
      {
        onSuccess: () => toast.success(value === "private" ? "Profile is now private" : "Profile is now public"),
        onError: (error) => handleError({ error, userMessage: "Could not update visibility", componentName: "Profile" }),
      },
    )
  }

  return (
    <Page>
      <MotionContainer className="flex w-full max-w-md flex-col items-center gap-10 p-10">
        <Avatar image={null} username={user?.username} email={user?.email} />

        <div className="flex w-full flex-col gap-2">
          <Input
            type="text"
            id="username"
            label="Game tag"
            maxLength={16}
            value={username}
            onChange={(event) => setUsername(event.currentTarget.value)}
          />
          <MotionButton flex disabled={!usernameChanged || patchMe.isPending} onClick={handleSaveUsername}>
            Save
          </MotionButton>
        </div>

        <div className="flex w-full flex-col gap-2">
          <p className="text-sm">Profile visibility</p>
          <Select
            options={visibilityOptions}
            value={user?.visibility ?? "public"}
            onChange={handleVisibilityChange}
            disabled={patchMe.isPending}
          />
          <p className="text-xs opacity-70">{isPrivate ? "Only you can see your list." : "Anyone with your link can see your list."}</p>
        </div>

        <div className="flex w-full flex-col gap-2">
          <p className="text-sm">Share your list</p>
          <div className="flex w-full items-center gap-2">
            {/* min-w-0 so a long link shrinks the field instead of pushing the
                button off the card. */}
            <div className="min-w-0 flex-1">
              <Input
                type="text"
                id="shareLink"
                value={shareUrl}
                readOnly
                // Select on focus so the link is copyable by hand wherever the
                // clipboard API is unavailable or refused.
                onFocus={(event) => event.currentTarget.select()}
              />
            </div>
            <MotionButton
              onClick={handleCopyLink}
              disabled={isPrivate || !shareUrl}
              icon={<LinkIcon className="h-4 w-4" />}
              title={isPrivate ? "Make your profile public to share it" : "Copy your profile link"}
            >
              Copy
            </MotionButton>
          </div>
          {/* Copying is blocked rather than warned about: a private profile
              answers 403 to everyone else, so a shared link would look broken
              to the friend and give the owner no clue why. */}
          {isPrivate && <p className="text-xs opacity-70">Make your profile public to share this link.</p>}
        </div>

        <MotionButton size="default" variant="error" onClick={() => {}} flex>
          Delete Profile
        </MotionButton>
      </MotionContainer>
    </Page>
  )
}

export default Profile
