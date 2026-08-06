import { routes } from "./routes"

/**
 * The absolute link a user shares to show off their list.
 *
 * Built from the *running* origin rather than an env var, so it is right in
 * dev, right over the LAN and right in production with nothing to configure —
 * the page the user is looking at is by definition where their profile lives.
 *
 * The path comes from `routes.publicProfile` rather than a second literal:
 * changing the route in one place and forgetting the other would produce a
 * link that looks plausible and 404s.
 */
export const profileShareUrl = (origin: string, username: string): string => {
  // Lowercased because usernames are stored normalized and the API lowercases
  // on lookup — case would work, but a shared link should be canonical.
  const name = username.trim().toLowerCase()
  if (!name) return ""

  return `${origin.replace(/\/+$/, "")}${routes.publicProfile.replace(":username", encodeURIComponent(name))}`
}
