export type Visibility = "public" | "private"

export interface User {
  id: number
  username: string
  email: string
  visibility: Visibility
  created_at: string
  updated_at: string
}
