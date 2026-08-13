import { useState } from "react"
import { toast } from "sonner"
import AvatarField from "./AvatarField"
import Input from "../../components/form/input/Input"
import Select from "../../components/form/select/Select"
import MotionButton from "../../components/motionButton/MotionButton"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import Page from "../../components/page/Page"
import useAuthStore from "../../store/useAuthStore"
import { usePatchMeMutation } from "../../api/endpoints/useQuery"
import { handleError } from "../../utils/errors"
import UsernameStatus from "../../components/form/UsernameStatus"
import TextArea from "../../components/form/textArea/TextArea"
import type { Visibility } from "../../types/users"
import { cn } from "../../utils/cn"
import { BIO_MAX_LENGTH, bioLength } from "./bio"

const visibilityOptions: { label: string; value: Visibility }[] = [
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
]

const Profile: React.FC = () => {
  const { user } = useAuthStore()
  const [username, setUsername] = useState(user?.username ?? "")
  const [bio, setBio] = useState(user?.bio ?? "")
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

  // Counted the server's way. `.length` would disagree on emoji and block a
  // save the API would have accepted — see bio.ts.
  const bioCount = bioLength(bio)
  const bioTooLong = bioCount > BIO_MAX_LENGTH
  const bioChanged = bio.trim() !== (user?.bio ?? "")

  const handleSaveBio = () => {
    // "" is the clear sentinel. Trimming here matches validate.Bio server-side,
    // so the field keeps showing what was actually stored.
    patchMe.mutate(
      { bio: bio.trim() },
      {
        onSuccess: () => toast.success("Bio updated"),
        onError: (error) => handleError({ error, userMessage: "Could not update bio", componentName: "Profile" }),
      },
    )
  }

  const isPrivate = user?.visibility === "private"

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
        <AvatarField />

        <div className="flex w-full flex-col gap-2">
          <Input
            type="text"
            id="username"
            label="Game tag"
            maxLength={16}
            value={username}
            onChange={(event) => setUsername(event.currentTarget.value.toLowerCase())}
          />
          {/* currentUsername is what stops your own name reading as taken. */}
          <UsernameStatus value={username} currentUsername={user?.username} />
          <MotionButton flex disabled={!usernameChanged || patchMe.isPending} onClick={handleSaveUsername}>
            Save
          </MotionButton>
        </div>

        <div className="flex w-full flex-col gap-2">
          <TextArea
            id="bio"
            label="Bio"
            sideLabel={false}
            rows={4}
            placeholder="A sentence or two about what you play."
            value={bio}
            onChange={(event) => setBio(event.currentTarget.value)}
          />
          {/* Deliberately no maxLength on the field. Pasting 600 characters into
              a hard-capped textarea silently drops the end and the writer never
              finds out — tolerable for the 16-character game tag above, not for
              a paragraph somebody wrote somewhere else. */}
          <div className="flex items-center justify-between gap-2">
            <span className={cn("text-xs", bioTooLong ? "text-error font-semibold" : "opacity-70")}>
              {bioCount} / {BIO_MAX_LENGTH}
            </span>
            <MotionButton disabled={!bioChanged || bioTooLong || patchMe.isPending} onClick={handleSaveBio}>
              Save
            </MotionButton>
          </div>
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

        <MotionButton size="default" variant="error" onClick={() => {}} flex>
          Delete Profile
        </MotionButton>
      </MotionContainer>
    </Page>
  )
}

export default Profile
