// Game and Genre now come from the generated client, so there is one
// definition rather than a hand-maintained copy that can drift from the API.
//
// This is not cosmetic: the previous local Game declared `genres` and
// `genreIds` as required, but the API omits `genres` when a game has none and
// never returns `genreIds` at all (the Go field is `gorm:"-"`, transport only).
// The generated types mark both optional, which is what the server does.
export type { Game, Genre } from "../api/generated/models"
