import { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'
import { wishlistService } from '../services/wishlistService'
import { useAuth } from '../context/AuthContext'
import { useCartActions } from '../hooks/useCartActions'
import { useWishlistActions } from '../hooks/useWishlistActions'

export default function WishlistPage() {
  const { user, wishlistIds } = useAuth()
  const { addToCart } = useCartActions()
  const { toggleWishlist } = useWishlistActions()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    wishlistService
      .list()
      .then((data) => setItems(data.items || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
      <p className="text-xs uppercase tracking-[.18em] text-coral">Northstar account</p>
      <h1 className="mt-2 font-serif text-5xl">Wishlist</h1>

      <div className="mt-10 rounded-3xl bg-card p-7">
        {loading && <p className="text-muted-foreground">Loading wishlist...</p>}
        {!loading && items.length === 0 && (
          <p className="text-muted-foreground">Your wishlist is empty.</p>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              product={item.product}
              user={user}
              inWishlist={wishlistIds.has(item.product.id)}
              onAdd={addToCart}
              onWish={toggleWishlist}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
