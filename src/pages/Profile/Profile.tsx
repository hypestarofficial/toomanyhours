import Avatar from "../../components/avatar/Avatar"
import MotionButton from "../../components/motionButton/MotionButton"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import Page from "../../components/page/Page"
import useAuthStore from "../../store/useAuthStore"

const Profile: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <Page>
      <MotionContainer className="flex flex-col items-center gap-10 p-10">
        <Avatar image={null} username={user?.username} email={user?.email} />
        <MotionButton size="default" variant="error" onClick={() => {}} flex>
          Delete Profile
        </MotionButton>
      </MotionContainer>
    </Page>
  )
}

export default Profile
