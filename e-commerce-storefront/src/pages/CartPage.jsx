import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductImage from '../components/ProductImage'
import { useAuth } from '../context/AuthContext'
import { useCartActions } from '../hooks/useCartActions'
import { money } from '../utils/format'

export default function CartPage() {
  const { cart, refreshCart } = useAuth()
  const { updateQuantity, removeItem } = useCartActions()
  const items = cart?.items || []

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
      <p className="text-xs uppercase tracking-[.18em] text-coral">Northstar account</p>
      <h1 className="mt-2 font-serif text-5xl">Your bag</h1>

      <div className="mt-10 rounded-3xl bg-card p-7">
        {items.length === 0 ? (
          <p className="text-muted-foreground">Your bag is empty.</p>
        ) : (
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="grid gap-4 border-b border-border pb-6 sm:grid-cols-[120px_1fr_auto]">
                <ProductImage src={item.product.image_url} alt={item.product.name} className="!aspect-square" />
                <div>
                  <h3 className="font-semibold">{item.product.name}</h3>
                  {item.variant_color && (
                    <p className="mt-1 text-xs text-muted-foreground">Color: {item.variant_color}</p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">{money(item.product.price)} each</p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      className="grid size-8 place-items-center rounded-full border border-border"
                      onClick={() => updateQuantity(item, Math.max(1, item.quantity - 1))}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="grid size-8 place-items-center rounded-full border border-border disabled:opacity-50"
                      disabled={item.quantity >= item.product.stock}
                      onClick={() => updateQuantity(item, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className="ml-4 text-sm text-destructive"
                      onClick={() => removeItem(item)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="font-semibold">{money(item.line_total)}</p>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">{cart.total_items} items</p>
              <p className="text-lg font-semibold">Subtotal: {money(cart.subtotal)}</p>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <Link
            to="/checkout"
            className="mt-6 inline-block rounded-full bg-primary px-5 py-3 text-primary-foreground"
          >
            Proceed to checkout
          </Link>
        )}
      </div>
    </main>
  )
}
