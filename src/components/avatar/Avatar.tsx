import { UserCircleIcon } from "@heroicons/react/24/solid"
import { Image } from "@heroui/image"

type AvatarProps = {
  image?: string | null
  username?: string
  email?: string
}

const Avatar: React.FC<AvatarProps> = ({ image, username, email }) => (
  <div className="flex items-center gap-4">
    <div className="bg-secondaryBg flex h-20 w-20 items-center justify-center overflow-hidden rounded-full">
      {image ? <Image src={image} alt={username} className="h-20 w-20 object-cover" /> : <UserCircleIcon className="h-20 w-20" />}
    </div>
    {(username || email) && (
      <div className="flex flex-col gap-1">
        {username && <span className="text-2xl font-bold">{username}</span>}
        {email && <span className="text-primary text-sm">{email}</span>}
      </div>
    )}
  </div>
)

export default Avatar
