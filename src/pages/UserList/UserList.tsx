import { useParams } from "react-router"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import Page from "../../components/page/Page"
import Empty from "../../components/empty/Empty"
import { useGetUserByIdQuery } from "../../api/endpoints/useQuery"
import Loader from "../../components/loader/Loader"
import Avatar from "../../components/avatar/Avatar"

/**
 * Another user's list.
 *
 * The three sections here used to render the entire game catalog, three times,
 * as though it were this person's list — invented data that looked real. Now
 * that lists are actually stored, showing that would be worse than showing
 * nothing.
 *
 * There is deliberately no endpoint for it yet: reading someone else's list
 * means honouring `users.visibility`, and a public read path is phase 4
 * (`/u/<username>`). Until then this page says so.
 */
const UserList: React.FC = () => {
  const { id } = useParams()
  const { data: user, isLoading } = useGetUserByIdQuery({ id: parseInt(id!) })

  if (isLoading) {
    return <Loader fullPage />
  }

  if (!user) {
    return <Empty message="User list not found" fullPage />
  }

  return (
    <Page align="start">
      <MotionContainer className="flex w-full flex-col gap-5 pb-10">
        <div className="flex items-end justify-between gap-2">
          <Avatar image={null} username={user?.username} email={user?.email} />
        </div>
        <Empty message="Shared lists are coming with public profiles" fullPage />
      </MotionContainer>
    </Page>
  )
}

export default UserList
