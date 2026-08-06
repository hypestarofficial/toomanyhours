import Modal from "../../components/modal/Modal"
import Badge from "../../components/badge/Badge"
import { Image } from "@heroui/image"
import { StarIcon } from "@heroicons/react/24/solid"
import type { UserGame } from "../../api/generated/models"
import { LIST_TYPE_LABEL } from "../../helpers/enums"

type ProfileGameCardProps = {
  entry: UserGame | null
  onClose: () => void
}

// Deliberately not GameCard, which is three modes of a form wired to
// useUpdateEntry. A prop to disable all of that would be bigger than this
// component, and would leave a mutation hook one boolean away from firing on
// somebody else's list.
//
// This is why the phase exists: VISION.md says the unit of value is a list
// worth reading, and a review nobody can read is not one.
const ProfileGameCard: React.FC<ProfileGameCardProps> = ({ entry, onClose }) => (
  <Modal isOpen={!!entry} onClose={onClose}>
    <div className="flex w-full flex-col items-center gap-4 p-6">
      {entry?.game?.image && <Image src={entry.game.image} alt={entry.game.title} className="rounded-md" />}

      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold">{entry?.game?.title}</h4>
          {entry?.category && <Badge variant="dark">{LIST_TYPE_LABEL[entry.category]}</Badge>}
        </div>

        {entry?.rating != null && (
          <span className="text-primary flex items-center gap-1 text-sm font-semibold">
            {entry.rating}/10
            <StarIcon className="h-4 w-4" />
          </span>
        )}

        {entry?.game?.genres && entry.game.genres.length > 0 && (
          <div className="flex w-full flex-wrap items-center gap-1">
            {entry.game.genres.map((genre) => (
              <Badge variant="dark" key={genre.id}>
                {genre.name}
              </Badge>
            ))}
          </div>
        )}

        {/* whitespace-pre-wrap keeps the paragraph breaks somebody typed;
            without it a multi-paragraph review collapses into one block. */}
        {entry?.review ? <p className="text-sm whitespace-pre-wrap">{entry.review}</p> : <p className="text-sm opacity-60">No review.</p>}
      </div>
    </div>
  </Modal>
)

export default ProfileGameCard
