export type ChangelogEntry = {
  /** Matches a package.json version exactly — no `v` prefix. */
  version: string
  /** ISO date, the day it landed on main. */
  date: string
  /** What changed, in the language someone using the app would use. */
  changes: string[]
}

/**
 * Newest first.
 *
 * **Releases are batched.** Work lands on main without a version, and a release
 * happens when enough has accumulated to be worth telling somebody about. The
 * old rule — one bump per merged feature cycle — produced a version a day and a
 * page of entries nobody would read end to end, which is the opposite of what
 * this file is for. The bump and its entry land together in a release commit of
 * their own, since the work they describe merged some time earlier.
 *
 * **The history restarted at 1.0.0 on 2026-08-13.** Everything before it is in
 * git and nowhere else, deliberately: those entries described a version scheme
 * that moved for its own sake. Notes elsewhere in the repo still say things like
 * "shipped in 1.6.0" — those refer to the old numbering and are kept because
 * they record what shipped together, not because the number resolves to
 * anything on this page.
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
    version: "1.0.0",
    date: "2026-08-13",
    changes: [
      "TooManyHours keeps track of the games you play and turns that into a page you can share. Add anything from IGDB's catalogue to one of three lists — finished, currently playing, or want to play — and drag a game between them as things change. Rate what you have finished out of ten in half stars and write as long a review as you like; DLC and expansions sit under the game they belong to. Your list lives at /u/your-name with your photo and bio at the top, shared with anyone you send the link to or kept private to just you. Search it, filter by genre, sort by rating, name or when you added it, and read it as covers or as rows.",
    ],
  },
]
