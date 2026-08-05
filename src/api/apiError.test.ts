import { describe, expect, it } from "vitest"
import { ApiError } from "./apiError"

describe("ApiError", () => {
  it("carries the HTTP status", () => {
    const error = new ApiError(401, "Unauthorized")
    expect(error.status).toBe(401)
  })

  it("is a real Error, so instanceof and .message keep working", () => {
    const error = new ApiError(500, "Boom")
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe("Boom")
  })

  it("keeps the parsed body for callers that want the API's message", () => {
    const error = new ApiError(409, "HTTP 409: taken", { error: true, message: "taken" })
    expect(error.body).toEqual({ error: true, message: "taken" })
  })
})
