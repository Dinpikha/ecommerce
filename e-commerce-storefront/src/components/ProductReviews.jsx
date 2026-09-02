import StarRating from './StarRating'
import { formatDate } from '../utils/format'

export default function ProductReviews({ reviews, averageRating }) {
  if (!reviews.length) return null

  return (
    <section className="mt-16 rounded-3xl border border-border/70 bg-card p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[.18em] text-coral">Reviews</p>
          <h2 className="mt-2 font-serif text-3xl">Customer reviews</h2>
        </div>
        {averageRating != null && (
          <div className="text-right">
            <StarRating rating={averageRating} size={18} />
            <p className="mt-1 text-xs text-muted-foreground">{reviews.length} reviews</p>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-6">
        {reviews.map((review) => (
          <article key={review.id} className="border-b border-border/70 pb-6 last:border-b-0 last:pb-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">{review.reviewerName}</p>
              <p className="text-xs text-muted-foreground">{formatDate(review.date)}</p>
            </div>
            <div className="mt-2">
              <StarRating rating={review.rating} size={14} showValue={false} />
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{review.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
