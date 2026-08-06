import { useState } from "react"
import { motion } from "motion/react"
import type { Variants } from "motion/react"
import { StarIcon as StarSolid } from "@heroicons/react/24/solid"
import { StarIcon as StarOutline } from "@heroicons/react/24/outline"

interface StarRatingProps {
  onChange: (value: number) => void
  maxStars?: number
  disabled?: boolean
  value?: number
}

const starVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.15, transition: { duration: 0.1 } },
  tap: { scale: 0.95 },
}

const StarRating = ({ maxStars = 5, disabled = false, value = 0, onChange }: StarRatingProps) => {
  const [hover, setHover] = useState(0)

  // Ten stars at h-10 plus padding is about 480px, which overflows the modal on
  // a phone (min-w-md is 448px, max-w is 90%). At h-7 the row lands near 360px
  // and fits at the modal's minimum width on any screen.
  const starSize = "h-7 w-7"
  const activeValue = hover || value

  return (
    <div className={`flex items-center ${disabled ? "cursor-default" : "cursor-pointer"}`}>
      {[...Array(maxStars)].map((_, index) => {
        const starIndex = index + 1
        const fillAmount = activeValue >= starIndex ? 1 : activeValue >= starIndex - 0.5 ? 0.5 : 0

        return (
          <motion.div
            key={index}
            variants={!disabled ? starVariants : {}}
            initial="initial"
            whileHover={!disabled ? "hover" : ""}
            whileTap={!disabled ? "tap" : ""}
            className="relative p-1"
          >
            <StarOutline className={`${starSize} text-white`} />

            {fillAmount > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 overflow-hidden p-1"
                style={{
                  clipPath: fillAmount === 0.5 ? "inset(0 50% 0 0)" : "inset(0 0 0 0)",
                }}
              >
                <StarSolid className={`${starSize} ${disabled ? "text-black" : "text-primary"}`} />
              </motion.div>
            )}

            {!disabled && (
              <div className="absolute inset-0 flex">
                <div
                  className="z-10 h-full w-1/2"
                  onMouseEnter={() => setHover(starIndex - 0.5)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => onChange(starIndex - 0.5)}
                />
                <div
                  className="z-10 h-full w-1/2"
                  onMouseEnter={() => setHover(starIndex)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => onChange(starIndex)}
                />
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

export default StarRating
