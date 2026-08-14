import { useState } from "react"
import { toast } from "sonner"
import AvatarField from "./AvatarField"
import Input from "../../components/form/input/Input"
import Select from "../../components/form/select/Select"
import MotionButton from "../../components/motionButton/MotionButton"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import Page from "../../components/page/Page"
import useAuthStore from "../../store/useAuthStore"
import { usePatchMeMutation } from "../../api/endpoints/useQuery"
import { handleError } from "../../utils/errors"
import UsernameStatus from "../../components/form/UsernameStatus"
import TextArea from "../../components/form/textArea/TextArea"
import SettingsSection from "./SettingsSection"
import type { Visibility } from "../../types/users"
import { cn } from "../../utils/cn"
import { BIO_MAX_LENGTH, bioLength } from "./bio"
import { changedFields, hasChanges, saveBlockedReason } from "./settingsForm"
import type { SavedSettings } from "./settingsForm"

const visibilityOptions: { label: string; value: Visibility }[] = [
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
]

const USERNAME_MAX_LENGTH = 16

/**
 * Account settings: one panel, one rhythm, one Save.
 *
 * **The old page saved each field on its own**, which put three different
 * controls on screen doing the same job — a full-width Save under the game tag,
 * a small right-aligned one under the bio, and nothing at all under visibility,
 * which applied the moment the dropdown closed. Reading it, there was no way to
 * tell which fields were saved and which were pending.
 *
 * One Save costs one thing worth stating: a rejected game tag now blocks the
 * bio in the same request, because it is one request. That is the trade for a
 * page where "have I saved this?" has a single answer, and the fields that can
 * be judged before sending — length, shape, the bio limit — are judged here
 * with the reason shown, so the common mistakes never reach the API.
 *
 * The photo is the exception and stays immediate: an upload has its own
 * progress, its own failure, and nothing to batch it with.
 */
const Profile: React.FC = () => {
  const { user } = useAuthStore()
  const patchMe = usePatchMeMutation()

  const [username, setUsername] = useState(user?.username ?? "")
  const [bio, setBio] = useState(user?.bio ?? "")
  const [visibility, setVisibility] = useState<Visibility>(user?.visibility ?? "public")

  const saved: SavedSettings = {
    username: user?.username ?? "",
    bio: user?.bio ?? null,
    visibility: user?.visibility ?? "public",
  }
  const form = { username, bio, visibility }

  const dirty = hasChanges(form, saved)
  const blocked = saveBlockedReason(form, saved)

  // Counted the server's way. `.length` would disagree the moment somebody uses
  // an emoji and refuse text the API accepts.
  const bioCount = bioLength(bio)
  const bioTooLong = bioCount > BIO_MAX_LENGTH

  const handleSave = () => {
    const patch = changedFields(form, saved)

    patchMe.mutate(patch, {
      onSuccess: () => toast.success("Settings saved"),
      onError: (error) => handleError({ error, userMessage: "Could not save your settings", componentName: "Profile" }),
    })
  }

  return (
    <Page align="start">
      <MotionContainer className="flex w-full max-w-xl flex-col gap-6 py-10">
        {/* A bordered panel rather than a filled one: the inputs are already
            secondaryBg, so a card in the same colour would swallow them. */}
        <div className="flex w-full flex-col rounded-xl border border-white/10">
          {/* No border-t, being first — the panel's own edge is the divider. */}
          <div className="px-6 py-6">
            <AvatarField />
          </div>

          <SettingsSection
            title="Game tag"
            htmlFor="username"
            description="Your name on the site, and the address of your list."
            footer={
              <>
                <UsernameStatus value={username} currentUsername={user?.username} />
                {/* Pushed right on its own, so the slot stays put whether or not
                    the status line to its left is showing anything. */}
                <span className="ml-auto opacity-60">
                  {username.length} / {USERNAME_MAX_LENGTH}
                </span>
              </>
            }
          >
            <Input
              type="text"
              id="username"
              sideLabel={false}
              maxLength={USERNAME_MAX_LENGTH}
              value={username}
              onChange={(event) => setUsername(event.currentTarget.value.toLowerCase())}
            />
          </SettingsSection>

          <SettingsSection
            title="Bio"
            htmlFor="bio"
            description="A sentence or two, shown at the top of your list."
            footer={
              <span className={cn("ml-auto", bioTooLong ? "text-error font-semibold" : "opacity-60")}>
                {bioCount} / {BIO_MAX_LENGTH}
              </span>
            }
          >
            {/* Deliberately no maxLength. Pasting 600 characters into a hard-
                capped box silently drops the end and the writer never finds
                out — tolerable for a 16-character game tag, not for a paragraph
                somebody wrote somewhere else. */}
            {/* Six rows, not four: at four, a bio anywhere near the 500
                character limit scrolls inside its own box, and a box that
                scrolls under the cursor steals the page's wheel and shows a
                half-cut line at the top. Six fits most of a full-length bio. */}
            <TextArea
              id="bio"
              sideLabel={false}
              rows={6}
              placeholder="A sentence or two about what you play."
              value={bio}
              onChange={(event) => setBio(event.currentTarget.value)}
            />
          </SettingsSection>

          <SettingsSection
            title="Profile visibility"
            description={visibility === "private" ? "Only you can see your list." : "Anyone with your link can see your list."}
          >
            {/* Select builds its own control rather than a labelled input, so
                this section's heading is a plain h2 and not a label. */}
            <Select options={visibilityOptions} value={visibility} onChange={(value) => setVisibility(value as Visibility)} />
          </SettingsSection>

          <div className="flex items-center justify-end gap-4 border-t border-white/10 px-6 py-4">
            {/* The reason sits beside the button it disables. A disabled Save
                with no explanation was the old page's worst habit. */}
            {blocked && <p className="text-error text-xs">{blocked}</p>}
            <MotionButton disabled={!dirty || !!blocked || patchMe.isPending} onClick={handleSave}>
              {patchMe.isPending ? "Saving…" : "Save changes"}
            </MotionButton>
          </div>
        </div>
      </MotionContainer>
    </Page>
  )
}

export default Profile
