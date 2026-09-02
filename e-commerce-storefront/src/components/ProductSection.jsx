import { Link } from 'react-router-dom'
import ProductGrid from './ProductGrid'

export default function ProductSection({
  eyebrow,
  title,
  products,
  viewAllTo,
  user,
  wishlistIds,
  onAdd,
  onWish,
  compact = true,
}) {
  if (!products.length) return null

  return (
    <section className={`mx-auto max-w-7xl px-5 lg:px-8 ${compact ? 'py-10' : 'py-14'}`}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-coral">{eyebrow}</p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl">{title}</h2>
        </div>
        {viewAllTo && (
          <Link to={viewAllTo} className="shrink-0 text-sm font-semibold underline-offset-4 hover:underline">
            View all
          </Link>
        )}
      </div>
      <ProductGrid
        products={products}
        user={user}
        wishlistIds={wishlistIds}
        onAdd={onAdd}
        onWish={onWish}
        compact={compact}
      />
    </section>
  )
}
