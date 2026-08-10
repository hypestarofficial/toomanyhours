import { useState } from "react"
import { cn } from "../../utils/cn"

/**
 * Longer than this and the paragraph gets a toggle.
 *
 * A character count rather than a measurement: knowing whether three clamped
 * lines actually elided anything needs the rendered height, and a ref plus a
 * resize observer is a great deal of machinery to decide whether to draw one
 * small button. Roughly three lines at this width, and being wrong shows a
 * toggle that expands to the same text — harmless.
 */
const CLAMP_CHARS = 180

type GameSummaryProps = {
  summary?: string
}

/**
 * IGDB's description of a game, short.
 *
 * Its job is orientation, not documentation: it answers "what even is this
 * game?" for a visitor reading somebody else's list, or for an owner looking
 * at something they added months ago. That is why it clamps — an unclamped
 * summary runs several paragraphs and pushes everything else below the fold,
 * which helps nobody.
 *
 * A game with no summary renders nothing at all. An absent paragraph is not a
 * fact anybody needs told.
 */
const GameSummary: React.FC<GameSummaryProps> = ({ summary }) => {
  const [expanded, setExpanded] = useState(false)

  if (!summary) return null

  return (
    <div className="flex w-full flex-col gap-1">
      {/* whitespace-pre-wrap keeps IGDB's paragraph breaks; several summaries
          have them and they collapse into one block without it. */}
      <p className={cn("text-sm whitespace-pre-wrap opacity-80", !expanded && "line-clamp-3")}>{summary}</p>
      {summary.length > CLAMP_CHARS && (
        <button type="button" onClick={() => setExpanded(!expanded)} className="text-primary self-start text-xs font-semibold">
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  )
}

export default GameSummary
