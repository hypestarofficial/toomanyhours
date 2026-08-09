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
 *
 * One line per thing a person would notice, and nothing else. No mechanics
 * ("the button is disabled while your profile is private"), no meta ("the
 * version now shows in the top bar"), no internals. Those are true and they
 * are not why anyone opens this page — and every line that is not worth
 * reading makes the lines that are worth reading less likely to be read.
 *
 * A release with nothing a person would notice gets no entry at all. Version
 * numbers here are therefore allowed to skip; padding them out with "various
 * improvements" would be filler, and the point of this page is that it is not.
 */
export const changelog: ChangelogEntry[] = [
  {
    version: "0.9.0",
    date: "2026-08-10",
    changes: ["Add a game in two steps, and rate and review it as you add it.", "Rating a game is no longer required."],
  },
  {
    version: "0.8.0",
    date: "2026-08-07",
    changes: ["See what's new in each update."],
  },
  {
    version: "0.7.0",
    date: "2026-08-07",
    changes: ["Pick a game tag knowing straight away whether it's free."],
  },
  {
    version: "0.6.0",
    date: "2026-08-07",
    changes: ["Remove a game from your list."],
  },
  {
    version: "0.5.0",
    date: "2026-08-07",
    changes: ["Copy a link to your list and send it to someone."],
  },
  {
    version: "0.4.0",
    date: "2026-08-07",
    changes: ["Your list has its own web address, readable by anyone you share it with."],
  },
]
