import { BarsArrowDownIcon, BarsArrowUpIcon } from "@heroicons/react/24/outline"
import Select from "../form/select/Select"
import MotionButton from "../motionButton/MotionButton"
import MotionTooltip from "../motionTooltip/MotionTooltip"
import { NATURAL_DIRECTION, SORT_DIRECTION, SORT_FIELD, SORT_LABEL } from "../../list/sort"

const options = Object.values(SORT_FIELD).map((field) => ({ label: SORT_LABEL[field], value: field }))

type SortControlProps = {
  field: SORT_FIELD
  direction: SORT_DIRECTION
  onChange: (field: SORT_FIELD, direction: SORT_DIRECTION) => void
}

/**
 * How the list is ordered: a dropdown for the field, a button for the
 * direction.
 *
 * Takes its state rather than reading the store, because the two pages that use
 * it keep that state in different places — MyList persists it, the public
 * profile forgets it on leave. A flag in here choosing between them would hide
 * the difference where neither caller can see it.
 */
const SortControl: React.FC<SortControlProps> = ({ field, direction, onChange }) => {
  const isAscending = direction === SORT_DIRECTION.ASC

  // Picking a field resets the direction to that field's natural one. Carrying
  // it over means an ascending chosen for Name silently becomes
  // worst-games-first on Rating, which reads as a bug.
  const pickField = (value: string | number) => {
    const picked = value as SORT_FIELD
    onChange(picked, NATURAL_DIRECTION[picked])
  }

  const flipDirection = () => onChange(field, isAscending ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC)

  return (
    <div className="flex items-center gap-1">
      <div className="w-40">
        <Select options={options} value={field} onChange={pickField} placeholder="Sort by" />
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
