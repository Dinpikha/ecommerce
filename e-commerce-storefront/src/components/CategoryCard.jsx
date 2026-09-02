import { Link } from 'react-router-dom'
import { formatCategoryLabel } from '../utils/categories'

export default function CategoryCard({ slug, imageUrl, count }) {
  return (
    <Link
      to={`/products?category=${encodeURIComponent(slug)}`}
      className="group overflow-hidden rounded-3xl border border-border/70 bg-card transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={formatCategoryLabel(slug)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[.18em] text-muted-foreground">
            {formatCategoryLabel(slug)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="font-serif text-2xl">{formatCategoryLabel(slug)}</p>
          {count != null && <p className="mt-1 text-sm text-white/80">{count} products</p>}
        </div>
      </div>
    </Link>
  )
}
