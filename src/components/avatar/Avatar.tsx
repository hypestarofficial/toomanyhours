import { UserCircleIcon } from "@heroicons/react/24/solid"
import { Image } from "@heroui/image"
import { cn } from "../../utils/cn"

type AvatarProps = {
  image?: string | null
  username?: string
  email?: string
  /** `lg` is the settings page, which hangs controls off the circle's corners. */
  size?: "md" | "lg"
  /**
   * Rendered inside the circle's positioning context, for controls that sit on
   * the photo itself. Here rather than in the caller because the circle is what
   * they are positioned against, and this component owns it.
   */
  overlay?: React.ReactNode
}

const Avatar: React.FC<AvatarProps> = ({ image, username, email, size = "md", overlay }) => {
  const box = size === "lg" ? "h-28 w-28" : "h-20 w-20"

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <div className={cn("bg-secondaryBg flex items-center justify-center overflow-hidden rounded-full", box)}>
          {image ? <Image src={image} alt={username} className={cn("object-cover", box)} /> : <UserCircleIcon className={box} />}
        </div>
        {overlay}
      </div>
      {(username || email) && (
        <div className="flex flex-col gap-1">
          {username && <span className="text-2xl font-bold">{username}</span>}
          {email && <span className="text-primary text-sm">{email}</span>}
        </div>
      )}
    </div>
  )
}

export default Avatar
