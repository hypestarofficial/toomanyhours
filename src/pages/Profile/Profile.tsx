import MotionButton from "../../components/motionButton/MotionButton"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import Page from "../../components/page/Page"
import useAuthStore from "../../store/useAuthStore"
import { UserCircleIcon } from "@heroicons/react/24/solid"

const Profile: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <Page>
      <MotionContainer className="flex flex-col items-center gap-10 p-10">
        <div className="flex items-center gap-4">
          <div className="bg-secondaryBg flex h-20 w-20 items-center justify-center rounded-full">
            <UserCircleIcon className="h-20 w-20" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold">{user?.username}</span>
            <span className="text-primary text-sm">{user?.email}</span>
          </div>
        </div>
        <MotionButton size="default" variant="error" onClick={() => {}} flex>
          Delete Profile
        </MotionButton>
      </MotionContainer>
    </Page>
  )
}

export default Profile
