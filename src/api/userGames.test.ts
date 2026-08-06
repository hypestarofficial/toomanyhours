import { describe, expect, it, vi } from "vitest"
import { QueryClient } from "@tanstack/react-query"
import { moveEntryMutationOptions } from "./userGames"
import type { UserGame } from "./generated/models"

const entry = (id: number, gameId: number, category: string): UserGame =>
  ({ id, gameId, category, rating: 8, review: "Great.", createdAt: "", updatedAt: "" }) as UserGame

describe("optimistic move", () => {
  it("moves the entry in the cache before the request resolves", async () => {
    const client = new QueryClient()
    const options = moveEntryMutationOptions(client)
    client.setQueryData(options.listKey, [entry(1, 570, "want_to_play")])

    await options.onMutate({ gameId: 570, data: { category: "finished" } })

    expect(client.getQueryData<UserGame[]>(options.listKey)?.[0].category).toBe("finished")
  })

  it("keeps the rating when moving, because the server does too", async () => {
    const client = new QueryClient()
    const options = moveEntryMutationOptions(client)
    client.setQueryData(options.listKey, [entry(1, 570, "want_to_play")])

    await options.onMutate({ gameId: 570, data: { category: "finished" } })

    expect(client.getQueryData<UserGame[]>(options.listKey)?.[0].rating).toBe(8)
  })

  it("leaves other entries alone", async () => {
    const client = new QueryClient()
    const options = moveEntryMutationOptions(client)
    client.setQueryData(options.listKey, [entry(1, 570, "want_to_play"), entry(2, 730, "finished")])

    await options.onMutate({ gameId: 570, data: { category: "finished" } })

    expect(client.getQueryData<UserGame[]>(options.listKey)?.[1].category).toBe("finished")
    expect(client.getQueryData<UserGame[]>(options.listKey)?.[1].id).toBe(2)
  })

  // The one that matters. When this stops working the UI shows a move that
  // never happened, and nothing disagrees until the page is reloaded.
  it("restores the previous cache when the request fails", async () => {
    const client = new QueryClient()
    const options = moveEntryMutationOptions(client)
    client.setQueryData(options.listKey, [entry(1, 570, "want_to_play")])

    const context = await options.onMutate({ gameId: 570, data: { category: "finished" } })
    options.onError(new Error("boom"), { gameId: 570, data: { category: "finished" } }, context)

    expect(client.getQueryData<UserGame[]>(options.listKey)?.[0].category).toBe("want_to_play")
  })

  it("cancels in-flight list queries so a late response cannot overwrite the move", async () => {
    const client = new QueryClient()
    const cancel = vi.spyOn(client, "cancelQueries").mockResolvedValue()
    const options = moveEntryMutationOptions(client)
    client.setQueryData(options.listKey, [entry(1, 570, "want_to_play")])

    await options.onMutate({ gameId: 570, data: { category: "finished" } })

    expect(cancel).toHaveBeenCalledWith({ queryKey: options.listKey })
  })
})
