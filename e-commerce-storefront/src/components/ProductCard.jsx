import { Link, useNavigate } from 'react-router-dom'
import { Heart, Plus } from 'lucide-react'
import ProductImage from './ProductImage'
import { money } from '../utils/format'

export default function ProductCard({ product, user, inWishlist, onAdd, onWish }) {
  const navigate = useNavigate()

  const handleAdd = (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    onAdd(product)
  }

  const handleWish = (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    onWish(product)
  }

  return (
    <article className="group">
      <Link to={`/products/${product.id}`}>
        <div className="relative">
          <ProductImage src={product.image_url} alt={product.name} />
          <button
            disabled={product.stock === 0}
            onClick={handleAdd}
            className="absolute bottom-3 left-3 grid size-9 place-items-center rounded-full bg-background shadow-sm opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
          </button>
          <button
            aria-label={`Wishlist ${product.name}`}
            onClick={handleWish}
            className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-background/90 ${inWishlist ? 'text-coral' : ''}`}
          >
            <Heart size={16} className={inWishlist ? 'fill-coral' : ''} />
          </button>
        </div>
        <div className="flex justify-between gap-2 pt-3">
          <div>
            <h3 className="text-sm font-semibold">{product.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{product.category}</p>
          </div>
          <p className="text-sm font-semibold">{money(product.price)}</p>
        </div>
      </Link>
    </article>
  )
}
