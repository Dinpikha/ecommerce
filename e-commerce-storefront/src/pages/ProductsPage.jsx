import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import ProductGrid from '../components/ProductGrid'
import { useAuth } from '../context/AuthContext'
import { useCategories } from '../hooks/useCategories'
import { useCartActions } from '../hooks/useCartActions'
import { useWishlistActions } from '../hooks/useWishlistActions'
import { productService } from '../services/productService'
import { formatCategoryLabel } from '../utils/categories'
import { SORT_OPTIONS, sortProducts } from '../utils/products'

const PAGE_SIZE = 12

export default function ProductsPage() {
  const { user, wishlistIds } = useAuth()
  const { addToCart } = useCartActions()
  const { toggleWishlist } = useWishlistActions()
  const { categories } = useCategories()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'featured'

  useEffect(() => {
    setLoading(true)
    setError('')
    setVisibleCount(PAGE_SIZE)

    const params = { limit: 100 }
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

  const sortedProducts = useMemo(() => sortProducts(products, sort), [products, sort])
  const visibleProducts = sortedProducts.slice(0, visibleCount)
  const hasMore = visibleCount < sortedProducts.length

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) next.delete(key)
      else next.set(key, value)
    })
    setSearchParams(next)
  }

  const clearFilters = () => {
    const next = new URLSearchParams()
    if (sort !== 'featured') next.set('sort', sort)
    setSearchParams(next)
  }

  const activeFilterCount = [search, category].filter(Boolean).length

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-coral">Shop</p>
        <h1 className="mt-2 font-serif text-5xl">All products</h1>
        <p className="mt-4 text-muted-foreground">
          Browse the full collection, filter by category, and find your next favorite.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <form
          className="flex max-w-xl flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5"
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            updateParams({ search: String(formData.get('search') || '').trim() })
          }}
        >
          <Search size={16} className="text-muted-foreground" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Search products"
            className="w-full bg-transparent text-sm outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm lg:hidden"
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-coral text-[10px] text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>

          <label className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">Sort</span>
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="bg-transparent outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {(search || category) && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {category && (
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm">
              {formatCategoryLabel(category)}
              <button type="button" onClick={() => updateParams({ category: '' })} aria-label="Clear category">
                <X size={14} />
              </button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm">
              Search: {search}
              <button type="button" onClick={() => updateParams({ search: '' })} aria-label="Clear search">
                <X size={14} />
              </button>
            </span>
          )}
          <button type="button" onClick={clearFilters} className="text-sm underline-offset-4 hover:underline">
            Clear all
          </button>
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block`}>
          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl">Categories</h2>
              {category && (
                <button
                  type="button"
                  onClick={() => updateParams({ category: '' })}
                  className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="mt-4 space-y-1">
              <Link
                to={(() => {
                  const params = new URLSearchParams()
                  if (search) params.set('search', search)
                  if (sort !== 'featured') params.set('sort', sort)
                  const query = params.toString()
                  return query ? `/products?${query}` : '/products'
                })()}
                onClick={() => setMobileFiltersOpen(false)}
                className={`block rounded-xl px-3 py-2 text-sm transition hover:bg-muted ${
                  !category ? 'bg-muted font-semibold' : ''
                }`}
              >
                All products
              </Link>
              {categories.map((slug) => (
                <Link
                  key={slug}
                  to={`/products?category=${encodeURIComponent(slug)}${search ? `&search=${encodeURIComponent(search)}` : ''}${sort !== 'featured' ? `&sort=${sort}` : ''}`}
                  onClick={() => setMobileFiltersOpen(false)}
                  className={`block rounded-xl px-3 py-2 text-sm transition hover:bg-muted ${
                    category === slug ? 'bg-muted font-semibold' : ''
                  }`}
                >
                  {formatCategoryLabel(slug)}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <section>
          {loading && <p className="text-muted-foreground">Loading products...</p>}
          {error && <p className="text-destructive">{error}</p>}

          {!loading && !error && (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Showing {visibleProducts.length} of {sortedProducts.length}
                  {total > sortedProducts.length ? ` (${total} total in store)` : ''} products
                </p>
              </div>

              <ProductGrid
                products={visibleProducts}
                user={user}
                wishlistIds={wishlistIds}
                onAdd={addToCart}
                onWish={toggleWishlist}
              />

              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    className="rounded-full border border-border px-6 py-3 text-sm font-semibold transition hover:bg-muted"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}
