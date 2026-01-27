import { colors } from "../../utils/colors"

export const motionButtonConfig = {
  default: {
    initial: {
      backgroundColor: colors.secondaryBg,
      color: "#ffffff",
    },
    whileHover: {
      backgroundColor: "#ffffff",
      color: colors.secondaryBg,
    },
  },
  text: {
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
