import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import CategoryCard from '../components/CategoryCard'
import ProductSection from '../components/ProductSection'
import { useAuth } from '../context/AuthContext'
import { useCategories } from '../hooks/useCategories'
import { useCartActions } from '../hooks/useCartActions'
import { useWishlistActions } from '../hooks/useWishlistActions'
import { groupProductsByCategory } from '../utils/categories'
import { sortProducts } from '../utils/products'

export default function HomePage() {
  const { user, wishlistIds } = useAuth()
  const { addToCart } = useCartActions()
  const { toggleWishlist } = useWishlistActions()
  const { products, loading } = useCategories()

  const categoryGroups = useMemo(() => groupProductsByCategory(products), [products])
  const featuredProducts = useMemo(() => products.slice(0, 4), [products])
  const topRatedProducts = useMemo(() => sortProducts(products, 'rating').slice(0, 4), [products])
  const recommendedProducts = useMemo(() => sortProducts(products, 'featured').slice(0, 4), [products])
  const popularCategories = categoryGroups.slice(0, 8)

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-10 pt-8 lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:pt-12">
        <div className="flex min-h-[460px] flex-col justify-between rounded-3xl bg-cobalt px-7 py-10 text-primary-foreground sm:px-12 sm:py-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.22em] opacity-70">
              Northstar / curated store
            </p>
            <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[.95] tracking-tight sm:text-7xl">
              Shop with clarity.
            </h1>
            <p className="mt-6 max-w-md leading-7 opacity-75">
              Discover beauty, tech, home essentials, and more — organized by category so you can
              find what you need faster.
            </p>
          </div>
          <Link
            to="/products"
            className="mt-12 flex w-fit items-center gap-3 rounded-full bg-coral px-6 py-3 text-sm font-semibold"
          >
            Shop now <ArrowRight size={17} />
          </Link>
        </div>

        <div className="flex min-h-[460px] flex-col justify-end rounded-3xl bg-muted p-7 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-muted-foreground">
            A quieter way to shop
          </p>
          <p className="mt-2 font-serif text-4xl">Browse by category.</p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
            Start with what matters to you — from fragrances and fashion to gadgets and groceries.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-coral">Browse</p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">Shop by category</h2>
          </div>
          <Link to="/products" className="text-sm font-semibold underline-offset-4 hover:underline">
            View all products
          </Link>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading categories...</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryGroups.map((category) => (
              <CategoryCard
                key={category.slug}
                slug={category.slug}
                imageUrl={category.imageUrl}
                count={category.count}
              />
            ))}
          </div>
        )}
      </section>

      {!loading && popularCategories.length > 0 && (
        <section className="border-y border-border/70 bg-muted/35">
          <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-coral">Trending</p>
            <h2 className="mt-2 font-serif text-3xl">Popular categories</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {popularCategories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/products?category=${encodeURIComponent(category.slug)}`}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition hover:border-coral hover:bg-background"
                >
                  {category.label}
                  <span className="ml-2 text-muted-foreground">({category.count})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProductSection
        eyebrow="Featured"
        title="Featured products"
        products={featuredProducts}
        viewAllTo="/products"
        user={user}
        wishlistIds={wishlistIds}
        onAdd={addToCart}
        onWish={toggleWishlist}
      />

      <div className="bg-muted/20">
        <ProductSection
          eyebrow="Top rated"
          title="Loved by shoppers"
          products={topRatedProducts}
          viewAllTo="/products?sort=rating"
          user={user}
          wishlistIds={wishlistIds}
          onAdd={addToCart}
          onWish={toggleWishlist}
        />
      </div>

      <ProductSection
        eyebrow="New in"
        title="Recommended for you"
        products={recommendedProducts}
        viewAllTo="/products"
        user={user}
        wishlistIds={wishlistIds}
        onAdd={addToCart}
        onWish={toggleWishlist}
      />
    </main>
  )
}
