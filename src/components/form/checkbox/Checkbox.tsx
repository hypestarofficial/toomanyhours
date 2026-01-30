import { motion } from "motion/react"
import { colors } from "../../../utils/colors"
import { CheckIcon } from "@heroicons/react/24/outline"

type CheckboxProps = {
  label: string
  checked: boolean
  onChange: () => void
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => (
  <motion.label whileHover={{ color: colors.primary }} className="flex cursor-pointer items-center gap-2 select-none">
    <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
    <motion.div
      animate={{
        backgroundColor: checked ? colors.primary : colors.secondaryBg,
        scale: checked ? [1, 1.2, 1] : 1,
      }}
      transition={{ duration: 0.2 }}
      className="flex h-4 w-4 items-center justify-center rounded-md"
    >
      {checked && (
        <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckIcon className="text-secondaryBg h-5 w-5 stroke-2" />
        </motion.span>
      )}
    </motion.div>
    <span>{label}</span>
  </motion.label>
)

export default Checkbox
