// Both request paths throw this instead of a bare Error, because withAuthRetry
// needs the status code to tell a 401 from any other failure. Encoding the
// status into an Error's message would mean parsing text to make a
// control-flow decision.
//
// Deliberately importless, so session.ts, mutator.ts and httpRequest can all
// use it without creating an import cycle.
export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}
