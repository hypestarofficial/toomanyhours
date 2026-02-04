import { toast } from "sonner"

type HandleErrorParams = {
  error: unknown
  userMessage?: string
  componentName?: string
}

export const handleError = ({ userMessage = "An unknown error occurred", error, componentName }: HandleErrorParams) => {
  let message = userMessage

  // Check if it's an actual Error object
  if (error instanceof Error) {
    message = error.message
  }
  // Check if it's just a string (this is what your API returns)
  else if (typeof error === "string") {
    message = error
  }

  if (componentName) {
    toast.error(userMessage)
    console.error(`${componentName}: ${message}`)
  } else {
    toast.error(userMessage)
    console.error(message)
  }
}
