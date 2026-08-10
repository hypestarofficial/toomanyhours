type GameSummaryProps = {
  summary?: string
}

/**
 * IGDB's description of a game, in a box of fixed height.
 *
 * Its job is orientation, not documentation: it answers "what even is this
 * game?" for a visitor reading somebody else's list, or for an owner looking
 * at something they added months ago.
 *
 * A fixed-height scrolling box rather than a clamp with a Show more toggle.
 * The toggle had to guess whether the text was long enough to need one —
 * knowing whether a clamp actually elided anything needs the rendered height,
 * so it keyed off a character count and was sometimes wrong. Scrolling needs
 * no such guess and leaves this component with no state at all.
 *
 * A fixed `h-32` — 8rem on Tailwind's scale — rather than a `max-h`: the card
 * should be one height for every game, so opening two in a row does not resize
 * the modal under the cursor. The cost is empty space under a one-line
 * summary, paid knowingly.
 *
 * Deliberately shaped like the review field beneath it — label, then a
 * secondaryBg box with the same radius and padding. The two sit adjacent and
 * hold the same kind of thing, one written by IGDB and one by you, so looking
 * alike is the honest rendering.
 *
 * A game with no summary renders nothing at all, label included. An absent
 * paragraph is not a fact anybody needs told.
 */
const GameSummary: React.FC<GameSummaryProps> = ({ summary }) => {
  if (!summary) return null

  return (
    <div className="flex w-full flex-col gap-1">
      <span className="select-none">About</span>
      {/* pr-1 on the inner text keeps the scrollbar off the words.
          whitespace-pre-wrap keeps IGDB's paragraph breaks; several summaries
          have them and they collapse into one block without it. */}
      <div className="bg-secondaryBg h-32 w-full overflow-y-auto rounded-md px-2 py-1">
        <p className="pr-1 text-sm whitespace-pre-wrap">{summary}</p>
      </div>
    </div>
  )
}

export default GameSummary
