import React from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  reviewCount?: number
  jobCount?: number
  size?: 'sm' | 'md'
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  reviewCount,
  jobCount,
  size = 'sm'
}) => {
  const iconSize = size === 'sm' ? 14 : 18

  // Calculate full, half, and empty stars
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.4 && rating % 1 <= 0.8
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Visual Stars */}
      <div className="flex items-center gap-0.5 select-none">
        {Array.from({ length: 5 }).map((_, index) => {
          let fillClass = 'text-border' // default empty
          let style = {}

          if (index < fullStars) {
            fillClass = 'text-amber fill-amber'
          } else if (index === fullStars && hasHalfStar) {
            // Half star representation using CSS styling
            return (
              <span key={index} className="relative inline-block text-border">
                <Star size={iconSize} className="text-border fill-border" />
                <span 
                  className="absolute top-0 left-0 overflow-hidden" 
                  style={{ width: '50%' }}
                >
                  <Star size={iconSize} className="text-amber fill-amber" />
                </span>
              </span>
            )
          }

          return (
            <Star
              key={index}
              size={iconSize}
              className={fillClass}
            />
          )
        })}
      </div>

      {/* Text labels */}
      <span className="font-mono text-[12px] text-body font-semibold">
        {rating.toFixed(1)} ★
      </span>

      {reviewCount !== undefined && (
        <span className="font-mono text-[12px] text-slate">
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}

      {jobCount !== undefined && (
        <>
          <span className="font-mono text-[12px] text-slate select-none">·</span>
          <span className="font-mono text-[12px] text-slate">
            {jobCount} {jobCount === 1 ? 'job' : 'jobs'}
          </span>
        </>
      )}
    </div>
  )
}
export default StarRating
