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
          <p className="text-xs opacity-70">
            {user?.visibility === "private" ? "Only you can see your list." : "Anyone with your link can see your list."}
          </p>
        </div>

        <MotionButton size="default" variant="error" onClick={() => {}} flex>
          Delete Profile
        </MotionButton>
      </MotionContainer>
    </Page>
  )
}

export default Profile
