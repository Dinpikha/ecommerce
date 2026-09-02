import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import ProductImage from './ProductImage'
import { formatCategoryLabel } from '../utils/categories'
import { money, stockStatus } from '../utils/format'

export default function ProductCard({ product, user, inWishlist, onAdd, onWish, compact = false }) {
  const navigate = useNavigate()
  const stock = stockStatus(product.stock)

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }
    onAdd(product)
  }

  const handleWish = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }
    onWish(product)
  }

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden border border-border/70 bg-card transition duration-200 hover:-translate-y-1 hover:shadow-md ${
        compact ? 'rounded-2xl' : 'rounded-3xl'
      }`}
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative overflow-hidden bg-muted">
          <ProductImage
            src={product.image_url}
            alt={product.name}
            className={`rounded-none transition duration-300 group-hover:scale-[1.03] ${
              compact ? 'aspect-[5/4]' : 'aspect-square'
            }`}
          />
          <button
            type="button"
            aria-label={`Wishlist ${product.name}`}
            onClick={handleWish}
            className={`absolute right-2 top-2 grid place-items-center rounded-full bg-background/95 shadow-sm transition hover:scale-105 ${
              compact ? 'size-8' : 'size-9'
            } ${inWishlist ? 'text-coral' : ''}`}
          >
            <Heart size={compact ? 14 : 16} className={inWishlist ? 'fill-coral' : ''} />
          </button>
        </div>
      </Link>

      <div className={`flex flex-1 flex-col ${compact ? 'p-3' : 'p-4'}`}>
        <Link to={`/products/${product.id}`} className="block flex-1">
          <p
            className={`font-semibold uppercase tracking-[.16em] text-coral ${
              compact ? 'text-[10px]' : 'text-[11px]'
            }`}
          >
            {formatCategoryLabel(product.category)}
          </p>
          <h3
            className={`mt-1.5 line-clamp-2 font-semibold leading-5 ${
              compact ? 'text-xs' : 'text-sm'
            }`}
          >
            {product.name}
          </h3>
          {product.rating != null && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Star size={12} className="fill-coral text-coral" />
              <span>{Number(product.rating).toFixed(1)}</span>
            </p>
          )}
          <p className={`mt-2 font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
            {money(product.price)}
          </p>
          {!compact && <p className={`mt-1 text-xs ${stock.tone}`}>{stock.label}</p>}
        </Link>

        <button
          type="button"
          disabled={product.stock === 0}
          onClick={handleAdd}
          className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
            compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'
          }`}
        >
          <ShoppingBag size={compact ? 13 : 15} />
          {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </article>
  )
}
