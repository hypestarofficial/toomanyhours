import { cn } from "../../utils/cn"

type PageProps = {
  children: React.ReactNode
  className?: string
  flex?: "row" | "col"
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
  align?: "start" | "center" | "end" | "between" | "around" | "evenly"
  relative?: boolean
}

const justifyMap = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
}
const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  between: "items-between",
  around: "items-around",
  evenly: "items-evenly",
}

const Page: React.FC<PageProps> = ({ children, className, flex = "row", justify = "center", align = "center", relative = true }) => {
  const flexDirection = flex === "row" ? "flex-row" : "flex-col"
  const justifyClass = justifyMap[justify]
  const alignClass = alignMap[align]

  return (
    <div className={cn("relative flex h-full", flexDirection, justifyClass, alignClass, relative && "relative", className)}>{children}</div>
  )
}

export default Page
