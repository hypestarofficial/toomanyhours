export type Visibility = "public" | "private"

export interface User {
  id: number
  username: string
  email: string
  visibility: Visibility
  /** At most 500 characters, or null. Plain text — never rendered as HTML. */
  bio: string | null
  created_at: string
  updated_at: string
}
