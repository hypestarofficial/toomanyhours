import Modal from "../../components/modal/Modal"
import Badge from "../../components/badge/Badge"
import { Image } from "@heroui/image"
import { ChatBubbleBottomCenterTextIcon, StarIcon } from "@heroicons/react/24/solid"
import placeholderImage from "../../assets/images/placeholder.webp"
import type { UserGame } from "../../api/generated/models"
import { LIST_TYPE_BADGE, LIST_TYPE_LABEL } from "../../helpers/enums"
import { addOnsOf, stripParentTitle } from "../MyList/gameCard/dlcRows"
import GameSummary from "../../components/gameSummary/GameSummary"
import ReviewSection from "../../components/reviewSection/ReviewSection"
import ReviewText from "../../components/reviewSection/ReviewText"

type ProfileGameCardProps = {
  entry: UserGame | null
  /**
   * The whole profile, so the add-ons belonging to this game can be shown
   * beneath it. They are in here already — visibleEntries hides them from the
   * list, and this puts them back under the game they belong to.
   */
  entries: UserGame[]
  onClose: () => void
}

// Deliberately not GameCard, which is three modes of a form wired to
// useUpdateEntry. A prop to disable all of that would be bigger than this
// component, and would leave a mutation hook one boolean away from firing on
// somebody else's list.
//
// This is why the phase exists: VISION.md says the unit of value is a list
// worth reading, and a review nobody can read is not one.
const ProfileGameCard: React.FC<ProfileGameCardProps> = ({ entry, entries, onClose }) => {
  // Not the IGDB listing MyList's card uses. A visitor wants what this person
  // played, not everything that exists — and could not ask IGDB anyway, since
  // /games/:igdbId/dlcs sits behind AuthRequired and a visitor has no token.
  const addOns = addOnsOf(entry, entries)

  return (
    <Modal isOpen={!!entry} onClose={onClose}>
      <div className="flex w-full flex-col gap-6 p-6 md:w-[48rem]">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          {entry?.game?.image && (
            <Image
              src={entry.game.image}
              alt={entry.game.title}
              className="w-full max-w-48 self-center rounded-md object-cover md:w-48 md:shrink-0 md:self-start"
            />
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {/* Genres lead. They are the fastest thing to read and they set
                expectations for the title underneath, which is the opposite of
                the old order where they trailed the review. */}
            {entry?.game?.genres && entry.game.genres.length > 0 && (
              <div className="flex w-full flex-wrap items-center gap-1">
                {entry.game.genres.map((genre) => (
                  <Badge variant="dark" key={genre.id}>
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-lg font-semibold">{entry?.game?.title}</h4>
              {/* Not `dark`, which is what the genres wear. A status is a
                  different kind of fact and now looks like one. */}
              {entry?.category && <Badge variant={LIST_TYPE_BADGE[entry.category]}>{LIST_TYPE_LABEL[entry.category]}</Badge>}
            </div>

            {/* Its own row under the title rather than trailing the status
                badge: crowded onto the title line it competed with the name,
                and the name is what you are looking for. */}
            {entry?.rating != null && (
              <span className="text-primary flex items-center gap-1 text-sm font-semibold">
                {entry.rating}/10
                <StarIcon className="h-4 w-4" />
              </span>
            )}

            {/* The reason this feature exists: a visitor is the person most
                likely not to know the game. */}
            <GameSummary summary={entry?.game?.summary} />

            {/* Shaped like the review *field* on your own card — label above a
                filled box — because that is what it is: the thing this person
                wrote. GameSummary above deliberately is not, so IGDB's text and
                somebody's own words no longer look like the same kind of thing.

                whitespace-pre-wrap keeps the paragraph breaks somebody typed;
                without it a multi-paragraph review collapses into one block. */}
            <ReviewSection>
              <ReviewText review={entry?.review} title={entry?.game?.title} rating={entry?.rating} />
            </ReviewSection>
          </div>
        </div>

        {/* Only when this person actually has some. A visitor is not owed a
            catalogue of what exists, and an empty heading on most cards would
            be noise on somebody else's list. */}
        {addOns.length > 0 && (
          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full items-center justify-between gap-2">
              <h4 className="text-sm font-semibold select-none">DLC &amp; expansions</h4>
              <span className="text-sm opacity-60 select-none">{addOns.length}</span>
            </div>
            <div className="flex max-h-64 w-full flex-col gap-1 overflow-y-auto pr-1">
              {addOns.map((addOn) => (
                <div key={addOn.id} className="flex items-center gap-3 rounded-md p-1.5">
                  <Image
                    src={addOn.game?.image || placeholderImage}
                    alt={addOn.game?.title}
                    className="pointer-events-none h-11 w-8 shrink-0 rounded object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="line-clamp-2 text-sm leading-tight">
                      {stripParentTitle(addOn.game?.title ?? "", entry?.game?.title)}
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      {/* The badge here too, not muted text. Status is the
                          thing being scanned for in this list, and grey text
                          is what you skip over. */}
                      {addOn.category && <Badge variant={LIST_TYPE_BADGE[addOn.category]}>{LIST_TYPE_LABEL[addOn.category]}</Badge>}
                      {addOn.rating != null && (
                        <span className="text-primary flex items-center gap-0.5 text-xs font-semibold">
                          <StarIcon className="h-3 w-3" />
                          {addOn.rating}
                        </span>
                      )}
                      {addOn.review && (
                        <span title="Written review" aria-label="Written review" className="flex items-center">
                          <ChatBubbleBottomCenterTextIcon className="text-primary h-3 w-3" />
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ProfileGameCard
