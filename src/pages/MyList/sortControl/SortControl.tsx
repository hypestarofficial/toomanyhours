import { BarsArrowDownIcon, BarsArrowUpIcon } from "@heroicons/react/24/outline"
import Select from "../../../components/form/select/Select"
import MotionButton from "../../../components/motionButton/MotionButton"
import MotionTooltip from "../../../components/motionTooltip/MotionTooltip"
import useUserSettingsAuthStore from "../../../store/useUserSettingsAuth"
import { NATURAL_DIRECTION, SORT_DIRECTION, SORT_FIELD, SORT_LABEL } from "../sort"

const options = Object.values(SORT_FIELD).map((field) => ({ label: SORT_LABEL[field], value: field }))

/**
 * How the list is ordered: a dropdown for the field, a button for the
 * direction.
 *
 * Holds no state of its own — the store is the single source of truth, because
 * the choice is persisted and MyList reads the same two values to sort.
 */
const SortControl: React.FC = () => {
  const { sortField, sortDirection, setSort } = useUserSettingsAuthStore()

  const isAscending = sortDirection === SORT_DIRECTION.ASC

  // Picking a field resets the direction to that field's natural one. Carrying
  // it over means an ascending chosen for Name silently becomes
  // worst-games-first on Rating, which reads as a bug.
  const pickField = (value: string | number) => {
    const field = value as SORT_FIELD
    setSort(field, NATURAL_DIRECTION[field])
  }

  const flipDirection = () => setSort(sortField, isAscending ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC)

  return (
    <div className="flex items-center gap-1">
      <div className="w-40">
        <Select options={options} value={sortField} onChange={pickField} placeholder="Sort by" />
      </div>
      {/* No `title` prop, unlike LayoutToggle: MotionTooltip replaces the title
          attribute, and having both shows the browser's slow, OS-styled
          tooltip alongside the app's. */}
      <MotionTooltip content={isAscending ? "Ascending" : "Descending"}>
        <MotionButton
          size="square"
          onClick={flipDirection}
          ariaLabel={isAscending ? "Sort ascending" : "Sort descending"}
          icon={isAscending ? <BarsArrowUpIcon className="h-5 w-5" /> : <BarsArrowDownIcon className="h-5 w-5" />}
        >
          {/* children is required by MotionButtonProps, so {null} satisfies it
              without rendering anything. */}
          {null}
        </MotionButton>
      </MotionTooltip>
    </div>
  )
}

export default SortControl
