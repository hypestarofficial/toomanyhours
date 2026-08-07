import { useEffect, useState } from "react"

/**
 * Returns value once it has stopped changing for delay milliseconds.
 *
 * Not polish. IGDB allows four requests a second and the server's throttle
 * queues rather than rejecting, so an undebounced search box does not fail
 * loudly — it makes results arrive over a second behind the keystrokes, and
 * out of order. Debouncing is what keeps the request count near one per query
 * rather than one per character.
 */
export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    // Clearing on every change is the whole mechanism: a keystroke inside the
    // window cancels the pending update rather than queueing a second one.
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
