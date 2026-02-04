import { cn } from "../../utils/cn"

type BadgeProps = {
  children: React.ReactNode
  variant?: "dark" | "light"
}

const Badge: React.FC<BadgeProps> = ({ children, variant = "light" }) => {
  const variantMap = {
    light: "bg-highlight text-primary",
    dark: "bg-secondaryBg text-primary",
  }

  return <span className={cn("rounded px-2 py-0.5 text-xs font-semibold whitespace-nowrap", variantMap[variant])}>{children}</span>
}
export default Badge
