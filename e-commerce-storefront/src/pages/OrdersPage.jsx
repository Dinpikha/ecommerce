import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderService } from '../services/orderService'
import { formatDate, money } from '../utils/format'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    orderService
      .list()
      .then(setOrders)
      .catch(() => setError('Could not load orders.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
      <p className="text-xs uppercase tracking-[.18em] text-coral">Northstar account</p>
      <h1 className="mt-2 font-serif text-5xl">My orders</h1>

      <div className="mt-10 rounded-3xl bg-card p-7">
        {loading && <p className="text-muted-foreground">Loading orders...</p>}
        {error && <p className="text-destructive">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="text-muted-foreground">No orders yet.</p>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block rounded-2xl border border-border p-4 hover:bg-muted"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                  <p className="text-sm text-muted-foreground">{order.item_count} items</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{money(order.total)}</p>
                  <p className="text-sm text-muted-foreground">{order.order_status}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
