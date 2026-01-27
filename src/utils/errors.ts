import { toast } from "sonner"

export const handleError = (error: unknown, componentName?: string) => {
  if (error instanceof Error) {
    if (componentName) {
      toast.error(componentName, { description: error.message })
      console.error(`${componentName}: ${error.message}`)
    } else {
      toast.error(error.message)
      console.error(error.message)
    }
  }
}
