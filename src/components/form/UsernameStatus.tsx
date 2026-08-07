import { useCheckUsername } from "../../api/generated/usernames/usernames"
import { useDebouncedValue } from "../../hooks/useDebouncedValue"

const DEBOUNCE_MS = 350
const MIN_LENGTH = 3
const MAX_LENGTH = 16

// Mirrors internal/validate: length 3-16 and a-z0-9_. Checked here only to
// decide whether asking the server is worth a request — validate remains the
// authority, and this deliberately does not report *why* a name is malformed.
const looksCheckable = (name: string) => name.length >= MIN_LENGTH && name.length <= MAX_LENGTH && /^[a-z0-9_]+$/.test(name)

const MESSAGES: Record<string, string> = {
  taken: "Already taken",
  reserved: "Reserved",
  invalid: "Not a valid game tag",
  not_allowed: "Not allowed",
}

type UsernameStatusProps = {
  value: string
  /** The name already saved, when renaming. Yours reads as taken; say nothing. */
  currentUsername?: string
}

/**
 * Advisory only. Two people can claim a name between this answer and a submit,
 * so the API's 409 stays the authority and nothing here disables a button.
 */
const UsernameStatus: React.FC<UsernameStatusProps> = ({ value, currentUsername }) => {
  const debounced = useDebouncedValue(value, DEBOUNCE_MS)
  const unchanged = currentUsername !== undefined && debounced === currentUsername
  const shouldCheck = looksCheckable(debounced) && !unchanged

  const { data, isFetching } = useCheckUsername(debounced, {
    // No request for a half-typed name, and none for your own name: the
    // endpoint is anonymous and cannot know who is asking, so the caller is
    // what has to decide this.
    query: { enabled: shouldCheck },
  })

  if (!shouldCheck) return null
  if (isFetching) return <p className="text-xs opacity-70">Checking…</p>

  if (data?.available) return <p className="text-success text-xs">Available</p>
  if (data) return <p className="text-error text-xs">{MESSAGES[data.reason] ?? "Not available"}</p>

  return null
}

export default UsernameStatus
