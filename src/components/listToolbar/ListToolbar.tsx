import Input from "../form/input/Input"
import MultiSelect from "../form/multiSelect/MultiSelect"
import LayoutToggle from "./LayoutToggle"
import ShareListButton from "./ShareListButton"
import SortControl from "./SortControl"
import type { SORT_DIRECTION, SORT_FIELD } from "../../pages/MyList/sort"
import type { LIST_LAYOUT } from "../../store/useUserSettingsAuth"

type ListToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  genreOptions: { label: string; value: number }[]
  genres: number[]
  onGenresChange: (value: number[]) => void
  sortField: SORT_FIELD
  sortDirection: SORT_DIRECTION
  onSortChange: (field: SORT_FIELD, direction: SORT_DIRECTION) => void
  layout: LIST_LAYOUT
  onLayoutChange: (layout: LIST_LAYOUT) => void
  /** The link the share button copies. */
  shareUrl: string
  shareDisabled?: boolean
  shareDisabledReason?: string
  /** The two pages search different lists, so they say so differently. */
  searchPlaceholder?: string
  /** Distinguishes the two inputs, since both pages exist in one bundle. */
  searchId?: string
}

/**
 * The controls above a list: search, genre filter, sort, layout, share.
 *
 * **It reads no store.** Every value arrives as a prop and every change leaves
 * as a callback, because the two pages using it keep this state in different
 * places: MyList persists layout and sort, while the public profile holds all
 * of it in useState and forgets it on leave. A `variant` flag in here choosing
 * between them would bury that difference inside the component, where neither
 * caller could see it.
 */
const ListToolbar: React.FC<ListToolbarProps> = ({
  search,
  onSearchChange,
  genreOptions,
  genres,
  onGenresChange,
  sortField,
  sortDirection,
  onSortChange,
  layout,
  onLayoutChange,
  shareUrl,
  shareDisabled,
  shareDisabledReason,
  searchPlaceholder = "Search your list...",
  searchId = "listSearch",
}) => {
  return (
    // Two rows, not one. Packed into a single line, the sort arrow, the two
    // layout icons and the share icon sat side by side as four adjacent icon
    // buttons and none of them read as belonging to anything. Search takes the
    // full width above; below it, what narrows the list sits left and what
    // changes how it is read or shared sits right.
    <div className="mb-4 flex w-full flex-col gap-2">
      <Input
        type="text"
        id={searchId}
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sideLabel={false}
        clearable
      />
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Wide enough for what it has to hold: three badges capped at
              max-w-24 plus a +N counter come to roughly 380px once the chevron
              and padding are counted. Full width below `sm`, where it has the
              row to itself anyway. */}
          <div className="w-full sm:w-96">
            <MultiSelect options={genreOptions} value={genres} onChange={onGenresChange} placeholder="Filter by genres" />
          </div>
          <SortControl field={sortField} direction={sortDirection} onChange={onSortChange} />
        </div>
        <div className="flex items-center gap-2">
          <LayoutToggle layout={layout} onChange={onLayoutChange} />
          <ShareListButton url={shareUrl} disabled={shareDisabled} disabledReason={shareDisabledReason} />
        </div>
      </div>
    </div>
  )
}

export default ListToolbar
