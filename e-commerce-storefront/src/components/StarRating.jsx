import { Star } from 'lucide-react'

export default function StarRating({ rating, size = 16, showValue = true }) {
  if (rating == null) return null

  const value = Number(rating)
  const fullStars = Math.floor(value)
  const hasHalf = value - fullStars >= 0.5

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, index) => {
          const filled = index < fullStars || (index === fullStars && hasHalf)
          return (
            <Star
              key={index}
              size={size}
              className={filled ? 'fill-coral text-coral' : 'text-border'}
            />
          )
        })}
      </div>
      {showValue && <span className="text-sm text-muted-foreground">{value.toFixed(1)}</span>}
    </div>
  )
}
