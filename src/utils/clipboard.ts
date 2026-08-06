/**
 * Copy text to the clipboard, reporting whether it worked.
 *
 * `navigator.clipboard` only exists in a secure context — https, or localhost.
 * This project's dev server binds to all interfaces on purpose, so testing from
 * a phone means `http://192.168.x.x:3100`, where the modern API is simply
 * undefined and an unguarded call throws. The deprecated `execCommand` path
 * still works there, which is the only reason it is here.
 *
 * Callers must handle `false`: a browser can refuse both paths, and a copy
 * button that silently does nothing is worse than one that says it failed.
 */
export const copyText = async (text: string): Promise<boolean> => {
  if (!text) return false

  if (window.isSecureContext && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Permission denied or the document is not focused. Fall through rather
      // than give up — the legacy path needs neither.
    }
  }

  try {
    const field = document.createElement("textarea")
    field.value = text
    field.setAttribute("readonly", "")
    // Off-screen rather than hidden: `display: none` and `visibility: hidden`
    // are not selectable, so the copy would quietly do nothing. `fixed` also
    // keeps iOS from scrolling to it.
    field.style.position = "fixed"
    field.style.top = "-9999px"
    field.style.opacity = "0"
    document.body.appendChild(field)
    field.select()
    const copied = document.execCommand("copy")
    document.body.removeChild(field)
    return copied
  } catch {
    return false
  }
}
