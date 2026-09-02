import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productService } from '../services/productService'
import { useAuth } from '../context/AuthContext'
import { useCartActions } from '../hooks/useCartActions'
import { useWishlistActions } from '../hooks/useWishlistActions'

export default function HomePage() {
  const { user, wishlistIds } = useAuth()
  const { addToCart } = useCartActions()
  const { toggleWishlist } = useWishlistActions()
  const [products, setProducts] = useState([])

  useEffect(() => {
    productService.list({ limit: 8 }).then((data) => setProducts(data.products || []))
  }, [])

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-14 pt-8 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:pt-12">
        <div className="flex flex-col justify-between rounded-3xl bg-cobalt px-7 py-10 text-primary-foreground sm:px-12 sm:py-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.22em] opacity-70">
              Northstar / collection
            </p>
            <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[.95] tracking-tight sm:text-7xl">
              Objects with a point of view.
            </h1>
            <p className="mt-6 max-w-md leading-7 opacity-75">
              A considered collection for the way you move through the world.
            </p>
          </div>
          <Link
            to="/products"
            className="mt-12 flex w-fit items-center gap-3 rounded-full bg-coral px-5 py-3 text-sm font-semibold"
          >
            Shop the collection <ArrowRight size={17} />
          </Link>
        </div>
        <div className="flex min-h-[420px] flex-col justify-end rounded-3xl bg-muted p-7">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-muted-foreground">
            A quieter way to shop
          </p>
          <p className="mt-2 font-serif text-4xl">Made for long days.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-coral">The edit</p>
            <h2 className="mt-2 font-serif text-3xl">Best sellers, better together.</h2>
          </div>
          <Link to="/products" className="text-sm font-semibold">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => (
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
      </section>
    </main>
  )
}
