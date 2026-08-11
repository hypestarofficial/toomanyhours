import { Squares2X2Icon, QueueListIcon } from "@heroicons/react/24/outline"
import MotionButton from "../motionButton/MotionButton"
import { LIST_LAYOUT } from "../../store/useUserSettingsAuth"

type LayoutToggleProps = {
  layout: LIST_LAYOUT
  onChange: (layout: LIST_LAYOUT) => void
}

/**
 * Cards or rows. Takes its state for the same reason SortControl does: MyList
 * persists this and the public profile does not.
 */
const LayoutToggle: React.FC<LayoutToggleProps> = ({ layout, onChange }) => {
  return (
    <div className="flex items-center gap-1">
      {/* children is required by MotionButtonProps, so {null} satisfies it
          without rendering anything — the gap-2 that `icon` adds has nothing
          to separate. */}
      <MotionButton
        size="square"
        variant={layout === LIST_LAYOUT.CARDS ? "active" : "default"}
        onClick={() => onChange(LIST_LAYOUT.CARDS)}
        ariaLabel="Card layout"
        title="Card layout"
        icon={<Squares2X2Icon className="h-5 w-5" />}
      >
        {null}
      </MotionButton>
      <MotionButton
        size="square"
        variant={layout === LIST_LAYOUT.ROWS ? "active" : "default"}
        onClick={() => onChange(LIST_LAYOUT.ROWS)}
        ariaLabel="List layout"
        title="List layout"
        icon={<QueueListIcon className="h-5 w-5" />}
      >
        {null}
      </MotionButton>
    </div>
  )
}

export default LayoutToggle
