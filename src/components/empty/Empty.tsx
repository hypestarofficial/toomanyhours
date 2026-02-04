import { cn } from "../../utils/cn"
import MotionContainer from "../motionContainer/MotionContainer"

type EmptyProps = {
  message: string
  className?: string
  bold?: boolean
  fullPage?: boolean
}

const Empty: React.FC<EmptyProps> = ({ message, className, bold = false, fullPage = false }) => (
  <MotionContainer className={cn(className, fullPage && "flex h-full w-full items-center justify-center")}>
    <span className={cn("text-text", bold && "font-bold")}>{message}</span>
  </MotionContainer>
)

export default Empty
