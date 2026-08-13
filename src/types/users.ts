export type Visibility = "public" | "private"

export interface User {
  id: number
  username: string
  email: string
  visibility: Visibility
  /** At most 500 characters, or null. Plain text — never rendered as HTML. */
  bio: string | null
  /**
   * A `data:image/jpeg;base64,...` URI, or null.
   *
   * Inline rather than a URL because an `<img>` cannot send a bearer token, and
   * `/profiles/:username/avatar` answers 403 for a private profile — its owner
   * included.
   */
  avatar: string | null
  created_at: string
  updated_at: string
}
