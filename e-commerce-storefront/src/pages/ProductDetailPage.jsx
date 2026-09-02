import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Heart } from 'lucide-react'
import ColorSelector from '../components/ColorSelector'
import ProductImage from '../components/ProductImage'
import ProductReviews from '../components/ProductReviews'
import QuantitySelector from '../components/QuantitySelector'
import RecommendedProducts from '../components/RecommendedProducts'
import StarRating from '../components/StarRating'
import { productService } from '../services/productService'
import { useAuth } from '../context/AuthContext'
import { useCartActions } from '../hooks/useCartActions'
import { useWishlistActions } from '../hooks/useWishlistActions'
import { formatCategoryLabel } from '../utils/categories'
import { getAverageRating, getProductReviews } from '../utils/productReviews'
import { getProductColors } from '../utils/productVariations'
import { money, stockStatus } from '../utils/format'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, wishlistIds } = useAuth()
  const { addToCart } = useCartActions()
  const { toggleWishlist } = useWishlistActions()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState('')

  useEffect(() => {
    let active = true

    async function loadProduct() {
      setLoading(true)
      setError('')
      setQuantity(1)

      try {
        const data = await productService.get(id)
        if (!active) return

        setProduct(data)
        const productColors = getProductColors(data)
        setSelectedColor(productColors[0] || '')

        const related = await productService.list({ category: data.category, limit: 8 })
        if (!active) return

        const items = (related.products || [])
          .filter((item) => String(item.id) !== String(id))
          .slice(0, 4)
        setRelatedProducts(items)
      } catch {
        if (active) setError('Product not found.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProduct()
    return () => {
      active = false
    }
  }, [id])

  const reviews = useMemo(() => (product ? getProductReviews(product) : []), [product])
  const averageRating = useMemo(
    () => (product ? getAverageRating(product, reviews) : null),
    [product, reviews],
  )
  const colors = useMemo(() => (product ? getProductColors(product) : []), [product])
  const stock = product ? stockStatus(product.stock) : null

  if (loading) return <main className="p-20 text-center">Loading...</main>
  if (error || !product) return <main className="p-20 text-center">{error || 'Product not found.'}</main>

  const inWishlist = wishlistIds.has(product.id)

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login')
      return
    }
    addToCart(product, quantity, selectedColor || '')
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductImage src={product.image_url} alt={product.name} />
        <div className="lg:py-6">
          <p className="text-xs uppercase tracking-[.18em] text-coral">
            Northstar / {formatCategoryLabel(product.category)}
          </p>
          <h1 className="mt-3 font-serif text-5xl">{product.name}</h1>
          {averageRating != null && (
            <div className="mt-4">
              <StarRating rating={averageRating} />
            </div>
          )}
          <p className="mt-8 text-2xl font-semibold">{money(product.price)}</p>
          <p className={`mt-2 text-sm ${stock.tone}`}>{stock.label}</p>
          <p className="mt-6 leading-7 text-muted-foreground">{product.description}</p>

          {colors.length > 0 && (
            <div className="mt-8">
              <ColorSelector colors={colors} selected={selectedColor} onSelect={setSelectedColor} />
            </div>
          )}

          <div className="mt-8">
            <p className="mb-3 text-sm font-medium">Quantity</p>
            <QuantitySelector
              quantity={quantity}
              max={product.stock}
              disabled={product.stock === 0}
              onChange={setQuantity}
            />
          </div>

          <div className="mt-10 flex gap-3">
            <button
              disabled={!user || product.stock === 0}
              onClick={handleAddToCart}
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

      <ProductReviews reviews={reviews} averageRating={averageRating} />
      <RecommendedProducts products={relatedProducts} />
    </main>
  )
}
