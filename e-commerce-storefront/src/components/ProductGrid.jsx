import ProductCard from './ProductCard'

export default function ProductGrid({ products, user, wishlistIds, onAdd, onWish, compact = false }) {
  if (!products.length) {
    return <p className="py-16 text-center text-muted-foreground">No products found.</p>
  }

  return (
    <div
      className={
        compact
          ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
          : 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
      }
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          user={user}
          inWishlist={wishlistIds.has(product.id)}
          onAdd={onAdd}
          onWish={onWish}
          compact={compact}
        />
      ))}
    </div>
  )
}
