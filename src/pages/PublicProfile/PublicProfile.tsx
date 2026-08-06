import { useState } from "react"
import { useParams } from "react-router"
import Page from "../../components/page/Page"
import Loader from "../../components/loader/Loader"
import Empty from "../../components/empty/Empty"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import Avatar from "../../components/avatar/Avatar"
import ListSection from "../MyList/listSection/ListSection"
import ProfileGameCard from "./ProfileGameCard"
import { LIST_TYPE } from "../../helpers/enums"
import { LIST_LAYOUT } from "../../store/useUserSettingsAuth"
import type { UserGame } from "../../api/generated/models"
import { useGetProfile } from "../../api/generated/profiles/profiles"
import { ApiError } from "../../api/apiError"

const PublicProfile: React.FC = () => {
  const { username } = useParams()
  const [selectedEntry, setSelectedEntry] = useState<UserGame | null>(null)
  // Section open state is local, not the persisted store: this is someone
  // else's list and should not disturb how yours is arranged.
  const [open, setOpen] = useState({ finished: true, currentlyPlaying: true, wantToPlay: true })

  // No `enabled: !!jwtToken`, unlike every other query in this app. The whole
  // point is that a visitor with no account sees this.
  const { data: profile, isLoading, error } = useGetProfile(username ?? "")

  if (isLoading) {
    return <Loader fullPage />
  }

  if (error || !profile) {
    // 403 and 404 say different things and a visitor deserves to know which:
    // one means the list exists and is not for them, the other that the link
    // is wrong.
    const isPrivate = error instanceof ApiError && error.status === 403
    return (
      <Page align="start">
        <Empty message={isPrivate ? "This profile is private" : "No such profile"} fullPage bold />
      </Page>
    )
  }

  const byCategory = (category: LIST_TYPE) => profile.entries.filter((entry) => entry.category === category)

  return (
    <Page align="start">
      <MotionContainer className="flex w-full flex-col gap-5 pb-10">
        <Avatar image={null} username={profile.username} />

        <ListSection
          title="finished"
          category={LIST_TYPE.FINISHED}
          entries={byCategory(LIST_TYPE.FINISHED)}
          onSelectItem={setSelectedEntry}
          open={open.finished}
          onOpenChange={(next) => setOpen({ ...open, finished: next })}
          layout={LIST_LAYOUT.CARDS}
          readOnly
        />
        <ListSection
          title="currently playing"
          category={LIST_TYPE.CURRENTLY_PLAYING}
          entries={byCategory(LIST_TYPE.CURRENTLY_PLAYING)}
          onSelectItem={setSelectedEntry}
          open={open.currentlyPlaying}
          onOpenChange={(next) => setOpen({ ...open, currentlyPlaying: next })}
          layout={LIST_LAYOUT.CARDS}
          readOnly
        />
        <ListSection
          title="want to play"
          category={LIST_TYPE.WANT_TO_PLAY}
          entries={byCategory(LIST_TYPE.WANT_TO_PLAY)}
          onSelectItem={setSelectedEntry}
          open={open.wantToPlay}
          onOpenChange={(next) => setOpen({ ...open, wantToPlay: next })}
          layout={LIST_LAYOUT.CARDS}
          readOnly
        />
      </MotionContainer>

      <ProfileGameCard entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
    </Page>
  )
}

export default PublicProfile
