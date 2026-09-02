import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Heart, Star } from 'lucide-react'
import ProductImage from '../components/ProductImage'
import { productService } from '../services/productService'
import { useAuth } from '../context/AuthContext'
import { useCartActions } from '../hooks/useCartActions'
import { useWishlistActions } from '../hooks/useWishlistActions'
import { money } from '../utils/format'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, wishlistIds } = useAuth()
  const { addToCart } = useCartActions()
  const { toggleWishlist } = useWishlistActions()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    productService
      .get(id)
      .then(setProduct)
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <main className="p-20 text-center">Loading...</main>
  if (error || !product) return <main className="p-20 text-center">{error || 'Product not found.'}</main>

  const inWishlist = wishlistIds.has(product.id)

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductImage src={product.image_url} alt={product.name} />
        <div className="lg:py-6">
          <p className="text-xs uppercase tracking-[.18em] text-coral">Northstar / {product.category}</p>
          <h1 className="mt-3 font-serif text-5xl">{product.name}</h1>
          {product.rating != null && (
            <p className="mt-4 flex items-center gap-2">
              <Star className="fill-coral text-coral" size={16} /> {product.rating}
            </p>
          )}
          <p className="mt-8 text-2xl font-semibold">{money(product.price)}</p>
          <p className="mt-2 text-sm text-muted-foreground">Stock: {product.stock}</p>
          <p className="mt-6 leading-7 text-muted-foreground">{product.description}</p>
          <div className="mt-10 flex gap-3">
            <button
              disabled={!user || product.stock === 0}
              onClick={() => {
                if (!user) {
                  navigate('/login')
                  return
                }
                addToCart(product)
              }}
              className="flex-1 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {product.stock === 0 ? 'Out of stock' : 'Add to bag'}
            </button>
            <button
              disabled={!user}
              onClick={() => {
                if (!user) {
                  navigate('/login')
                  return
                }
                toggleWishlist(product)
              }}
              className={`grid size-12 place-items-center rounded-full border border-border ${inWishlist ? 'text-coral' : ''}`}
            >
              <Heart size={18} className={inWishlist ? 'fill-coral' : ''} />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
