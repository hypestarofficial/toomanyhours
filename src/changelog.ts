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
    version: "1.6.0",
    date: "2026-08-12",
    changes: [
      "Write a short bio, so people opening your list know whose taste they are reading.",
      "Reviews can be far longer — up to 8,000 characters — and the editor counts as you write.",
      "A long review no longer overflows its card: Read more opens the whole thing.",
    ],
  },
  {
    version: "1.5.0",
    date: "2026-08-10",
    changes: ["Shared lists can now be searched, filtered and sorted, so a long one is worth opening."],
  },
  {
    version: "1.4.1",
    date: "2026-08-10",
    changes: [
      "Picking several genres no longer stretches the filter out of shape.",
      "Notifications are legible again — they were rendering pale on the dark background.",
    ],
  },
  {
    version: "1.4.0",
    date: "2026-08-10",
    changes: ["Sort your list by rating, name or when you added it — in either direction, and it remembers your choice."],
  },
  {
    version: "1.3.0",
    date: "2026-08-10",
    changes: [
      "Every game now carries a short description, so a list makes sense even for games you've never heard of.",
      "DLC names no longer repeat the game they belong to.",
      "Clear a rating you have already given.",
    ],
  },
  {
    version: "1.2.0",
    date: "2026-08-10",
    changes: [
      "Game covers show what you scored it, whether you wrote about it, and how much DLC you have.",
      "Hover the DLC mark to see everything you own for that game and where each one sits.",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-08-10",
    changes: ["Manage a DLC in one place: where it goes, what you scored it, what you thought — and remove it."],
  },
  {
    version: "1.0.0",
    date: "2026-08-10",
    changes: [
      "DLC and expansions now live on their game's card instead of filling up your list.",
      "Add, rate and review a game's DLC without leaving that game.",
      "See at a glance which games you've written about.",
    ],
  },
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
