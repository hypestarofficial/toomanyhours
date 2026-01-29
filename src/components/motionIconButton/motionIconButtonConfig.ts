import { colors } from "../../utils/colors"

export const motionIconButtonConfig = {
  default: {
    initial: {
      backgroundColor: "transparent",
      color: "#ffffff",
    },
    whileHover: {
      backgroundColor: "transparent",
      color: colors.primary,
    },
  },
  disabled: {
    initial: {
      backgroundColor: colors.secondaryBg,
      color: "#ffffff",
    },
  },
}
