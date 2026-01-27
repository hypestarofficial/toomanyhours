import { toast } from "sonner"

export const handleError = (error: unknown, componentName?: string) => {
  let message = "An unknown error occurred"

  // Check if it's an actual Error object
  if (error instanceof Error) {
    message = error.message
  }
  // Check if it's just a string (this is what your API returns)
  else if (typeof error === "string") {
    message = error
  }

  if (componentName) {
    toast.error(componentName, { description: message })
    console.error(`${componentName}: ${message}`)
  } else {
    toast.error(message)
    console.error(message)
  }
}
