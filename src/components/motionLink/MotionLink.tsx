import { Link as RouterLink } from "react-router"
import type { LinkProps } from "react-router"
import MotionText from "../motionText/MotionText"

const MotionLink: React.FC<LinkProps> = ({ children, to, className, ...props }) => (
  <RouterLink to={to} {...props}>
    <MotionText className={className}>{children}</MotionText>
  </RouterLink>
)

export default MotionLink
