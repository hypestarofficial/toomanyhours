import Page from "../../components/page/Page"
import GameContainer from "../../components/myList/GameContainer"
import styles from "./Admin.module.css"
import Loader from "../../components/loader/Loader"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import { useGetAdminGames } from "../../api/generated/admin/admin"
import { useGetGenres } from "../../api/generated/genres/genres"
import MultiSelect from "../../components/form/multiSelect/MultiSelect"
import Empty from "../../components/empty/Empty"
import useUserSettingsAuthStore from "../../store/useUserSettingsAuth"
import useAuthStore from "../../store/useAuthStore"

// Read-only since games became IGDB-native. A game without an igdb_id cannot
// exist, so the create and edit endpoints were removed rather than left to
// fail; the add/edit modal went with them. This whole page disappears in the
// cycle that puts IGDB search into the Add Game flow.
const Admin: React.FC = () => {
  const { filterGenres, setFilterGenres } = useUserSettingsAuthStore()
  const { jwtToken } = useAuthStore()

  // `enabled` is not optional: the mutator reads the token at request time, so
  // without this the queries fire before one exists and 401 on every boot.
  // genreIds is a comma-separated string, not an array — the API splits it.
  const { data: games, isLoading: isLoadingGames } = useGetAdminGames(
    { genreIds: filterGenres.join(",") },
    { query: { enabled: !!jwtToken } },
  )
  const { data: genres } = useGetGenres({ query: { enabled: !!jwtToken } })

  const multiSelectOptions = genres?.map((genre) => ({ label: genre.name, value: genre.id })) ?? []

  return (
    <Page align="start">
      <MotionContainer className="flex w-full flex-col gap-5">
        <div className="flex items-center justify-end gap-2">
          <MultiSelect options={multiSelectOptions} value={filterGenres} onChange={setFilterGenres} placeholder="Filter by genres" />
        </div>
        <MotionContainer className="flex h-full w-full flex-col gap-2">
          {games && games.length > 0 ? (
            <div className={styles.gamesList}>
              {games.map((game, index) => (
                <GameContainer key={game.id} title={game.title} image={game.image} index={index} />
              ))}
            </div>
          ) : isLoadingGames ? (
            <Loader fullPage />
          ) : (
            <Empty message="No games found" bold />
          )}
        </MotionContainer>
      </MotionContainer>
    </Page>
  )
}

export default Admin
