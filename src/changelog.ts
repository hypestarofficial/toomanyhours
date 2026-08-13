export type ChangelogEntry = {
  /** Matches a package.json version exactly — no `v` prefix. */
  version: string
  /** ISO date, the day it landed on main. */
  date: string
  /**
   * A sentence or two of prose above the list, for a release that needs framing
   * rather than itemising — 1.0.0 being the case it exists for. Optional, and
   * most releases should not have one: a changelog is a list, and an entry that
   * opens with a paragraph every time is a blog.
   *
   * It is separate from `changes` rather than being its first item because the
   * page prefixes each change with a dash. A paragraph behind a list marker
   * reads as an oversized bullet, which is exactly how it looked.
   */
  intro?: string
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
    intro:
      "TooManyHours keeps track of the games you play, and turns that into a page you can send to someone. It is built for a few friends rather than for everyone, so it does one thing properly: your list, and somewhere to share it.",
    changes: [
      "Keep three lists — finished, currently playing and want to play — and drag a game from one to another as things change.",
      "Add games from IGDB, with the cover, genres and release date filled in for you.",
      "Rate a finished game out of ten in half stars, and write as long a review as you want.",
      "Find a game's DLC and expansions on its card, and keep those in your lists too.",
      "Share your list at /u/your-name, or make your profile private and keep it to yourself.",
      "Put a photo and a short bio at the top of your list.",
      "Search it, filter by genre, sort by rating, name or when you added it, and read it as covers or as rows.",
    ],
  },
]
