type GameSummaryProps = {
  summary?: string
}

/**
 * IGDB's description of a game.
 *
 * Its job is orientation, not documentation: it answers "what even is this
 * game?" for a visitor reading somebody else's list, or for an owner looking
 * at something they added months ago.
 *
 * **Plain prose, not a filled box.** It used to be a `bg-secondaryBg` container
 * of fixed height, shaped to match the review field beneath it — but a grey box
 * reads as an input, and a fixed height cropped the last line in half, which
 * looks like a rendering bug rather than an invitation to scroll. The filled
 * container now belongs to the review, which is the field somebody actually
 * typed into; this is reference text and reads as reference text.
 *
 * `max-h-40` with scrolling remains as a backstop rather than a design: IGDB
 * summaries are usually a short paragraph, but a few run long enough to push
 * the buttons off a phone screen. It costs nothing on the summaries that fit.
 *
 * A game with no summary renders nothing at all, label included. An absent
 * paragraph is not a fact anybody needs told.
 */
const GameSummary: React.FC<GameSummaryProps> = ({ summary }) => {
  if (!summary) return null

  return (
    <div className="flex w-full flex-col gap-1">
      {/* pr-1 keeps the scrollbar off the words on the long ones.
          whitespace-pre-wrap keeps IGDB's paragraph breaks; several summaries
          have them and they collapse into one block without it. */}
      <p className="max-h-40 overflow-y-auto pr-1 text-sm leading-relaxed whitespace-pre-wrap opacity-80">{summary}</p>
    </div>
  )
}

export default GameSummary
