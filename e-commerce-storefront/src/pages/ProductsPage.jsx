import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productService } from '../services/productService'
import { useAuth } from '../context/AuthContext'
import { useCartActions } from '../hooks/useCartActions'
import { useWishlistActions } from '../hooks/useWishlistActions'

export default function ProductsPage() {
  const { user, wishlistIds } = useAuth()
  const { addToCart } = useCartActions()
  const { toggleWishlist } = useWishlistActions()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''

  useEffect(() => {
    setLoading(true)
    setError('')
    const params = { limit: 40 }
    if (search) params.search = search
    if (category) params.category = category

    productService
      .list(params)
      .then((data) => {
        setProducts(data.products || [])
        setTotal(data.total || 0)
      })
      .catch(() => setError('Could not load products.'))
      .finally(() => setLoading(false))
  }, [search, category])

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-coral">Collection</p>
      <h1 className="mt-2 font-serif text-5xl">Find your everyday.</h1>

      <form
        className="mt-8 flex max-w-md items-center gap-2 rounded-full border border-border bg-card px-4 py-2"
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          const next = new URLSearchParams(searchParams)
          const q = String(formData.get('search') || '').trim()
          if (q) next.set('search', q)
          else next.delete('search')
          setSearchParams(next)
        }}
      >
        <Search size={16} />
        <input
          name="search"
          defaultValue={search}
          placeholder="Search products"
          className="w-full bg-transparent text-sm outline-none"
        />
      </form>

      {category && (
        <p className="mt-4 text-sm text-muted-foreground">
          Category: <span className="font-semibold">{category}</span>
        </p>
      )}

      {loading && <p className="mt-10 text-muted-foreground">Loading products...</p>}
      {error && <p className="mt-10 text-destructive">{error}</p>}

      {!loading && !error && (
        <>
          <p className="mt-6 text-sm text-muted-foreground">{total} products</p>
          <div className="mt-10 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                user={user}
                inWishlist={wishlistIds.has(product.id)}
                onAdd={addToCart}
                onWish={toggleWishlist}
              />
            ))}
          </div>
        </>
      )}
    </main>
  )
}
