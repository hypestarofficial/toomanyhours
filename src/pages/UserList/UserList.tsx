import { useParams } from "react-router"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import Page from "../../components/page/Page"
import Empty from "../../components/empty/Empty"
import { useGamesQuery, useGetUserByIdQuery } from "../../api/endpoints/useQuery"
import { useGetGenres } from "../../api/generated/genres/genres"
import Loader from "../../components/loader/Loader"
import Avatar from "../../components/avatar/Avatar"
import ListSection from "../MyList/listSection/ListSection"
import useUserSettingsAuthStore from "../../store/useUserSettingsAuth"
import GameCard from "../MyList/gameCard/GameCard"
import { useState } from "react"
import type { Game } from "../../types/games"
import MultiSelect from "../../components/form/multiSelect/MultiSelect"

const UserList: React.FC = () => {
  const { id } = useParams()
  const { defaultListConfig, setDefaultListConfig, filterGenres, setFilterGenres } = useUserSettingsAuthStore()
  const { data: user, isLoading: isLoadingUser } = useGetUserByIdQuery({ id: parseInt(id!) })
  const { data: games, isLoading: isLoadingGames } = useGamesQuery({ genreIDs: filterGenres })
  const { data: genres } = useGetGenres()

  const multiSelectOptions = genres?.map((genre) => ({ label: genre.genre, value: genre.id })) ?? []

  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  if (isLoadingUser) {
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
          <div className="flex gap-2">
            <MultiSelect options={multiSelectOptions} value={filterGenres} onChange={setFilterGenres} placeholder="Filter by genres" />
          </div>
        </div>
        <MotionContainer className="flex w-full flex-col gap-2 pb-10">
          <ListSection
            title="finished"
            games={games}
            onSelectItem={setSelectedGame}
            defaultOpen={defaultListConfig.finished}
            setDefaultOpen={(open) => setDefaultListConfig({ ...defaultListConfig, finished: open })}
            isLoading={isLoadingGames}
          />
          <ListSection
            title="currently playing"
            games={games}
            onSelectItem={setSelectedGame}
            defaultOpen={defaultListConfig.currentlyPlaying}
            setDefaultOpen={(open) => setDefaultListConfig({ ...defaultListConfig, currentlyPlaying: open })}
            isLoading={isLoadingGames}
          />
          <ListSection
            title="want to play"
            games={games}
            onSelectItem={setSelectedGame}
            defaultOpen={defaultListConfig.wantToPlay}
            setDefaultOpen={(open) => setDefaultListConfig({ ...defaultListConfig, wantToPlay: open })}
            isLoading={isLoadingGames}
          />
        </MotionContainer>
      </MotionContainer>

      <GameCard game={selectedGame} onClose={() => setSelectedGame(null)} />
    </Page>
  )
}

export default UserList
