export interface Genre {
  id: number
  genre: string
}

export interface Game {
  id: number
  title: string
  image: string
  releaseDate: string
  genres: Genre[]
}
