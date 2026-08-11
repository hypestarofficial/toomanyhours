import { cn } from "../../utils/cn"

type BadgeProps = {
  children: React.ReactNode
  variant?: "dark" | "light" | "success" | "warning" | "neutral"
  /**
   * For bounding a badge whose text comes from somewhere else. `whitespace-nowrap`
   * below means a badge is always as wide as its content, which is right on a
   * card and wrong inside a fixed-width control — see MultiSelect.
   */
  className?: string
}

const Badge: React.FC<BadgeProps> = ({ children, variant = "light", className }) => {
  // The first two are amber text on a dark ground, which is what a genre or a
  // release type looks like. The last three are a filled colour with white
  // text, and are for a list status — a different kind of fact, so it should
  // not look like another tag sitting beside the genres.
  const variantMap = {
    light: "bg-highlight text-primary",
    dark: "bg-secondaryBg text-primary",
    success: "bg-success text-white",
    warning: "bg-warning text-white",
    neutral: "bg-highlight text-white",
  }

  return (
    <span className={cn("rounded px-2 py-0.5 text-xs font-semibold whitespace-nowrap", variantMap[variant], className)}>{children}</span>
  )
}
export default Badge
