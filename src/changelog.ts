export type ChangelogEntry = {
  /** Matches a package.json version exactly — no `v` prefix. */
  version: string
  /** ISO date, the day it landed on main. */
  date: string
  /** What changed, in the language someone using the app would use. */
  changes: string[]
}

/**
 * Newest first. Add an entry in the same branch as the version bump it
 * describes, so the two land together rather than in a tidying commit nobody
 * can date.
 *
 * Written for someone using the app. "Remove a game from your list", not
 * "useRemoveEntry invalidates the list key" — the commit history already says
 * the second thing, and says it better.
 */
export const changelog: ChangelogEntry[] = [
  {
    version: "0.8.0",
    date: "2026-08-07",
    changes: ["This page. Click the version number in the top bar to see what changed in each release."],
  },
  {
    version: "0.7.0",
    date: "2026-08-07",
    changes: [
      "Game tags are lowercase everywhere — you can no longer type a capital into one.",
      "Registering or renaming now tells you straight away whether a tag is free, taken, or reserved.",
    ],
  },
  {
    version: "0.6.0",
    date: "2026-08-07",
    changes: [
      "Remove a game from your list. Open it and choose Remove — you will be asked to confirm, since your rating and review go with it.",
    ],
  },
  {
    version: "0.5.0",
    date: "2026-08-07",
    changes: [
      "Share your list. The link button in the list toolbar copies the address of your public profile.",
      "It stays disabled while your profile is private, because the link would not work for anyone you sent it to.",
    ],
  },
  {
    version: "0.4.0",
    date: "2026-08-07",
    changes: [
      "Public profiles. Anyone with the link can read your list at /u/your-tag, as long as your profile is public.",
      "The app's version now shows in the top bar.",
    ],
  },
]
