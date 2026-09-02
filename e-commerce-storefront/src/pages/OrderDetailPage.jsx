import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { orderService } from '../services/orderService'
import { formatDate, money } from '../utils/format'

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    orderService
      .get(id)
      .then(setOrder)
      .catch(() => setError('Order not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <main className="p-20 text-center">Loading...</main>
  if (error || !order) return <main className="p-20 text-center">{error}</main>

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
      <p className="text-xs uppercase tracking-[.18em] text-coral">Northstar account</p>
      <h1 className="mt-2 font-serif text-5xl">Order #{order.id}</h1>

      <div className="mt-10 rounded-3xl bg-card p-7">
        <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
        <p className="mt-2 text-sm">Reference: {order.transaction_ref}</p>
        <p className="mt-2 text-sm">Status: {order.order_status}</p>

        <div className="mt-6 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-4 border-b border-border pb-3">
              <div>
                <p className="font-semibold">{item.product_name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} x {money(item.unit_price)}
                </p>
              </div>
              <p className="font-semibold">{money(item.line_total)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-1 text-sm">
          <p>Subtotal: {money(order.subtotal)}</p>
          <p>Tax: {money(order.tax)}</p>
          <p className="text-lg font-semibold">Total: {money(order.total)}</p>
        </div>

        <Link to={`/orders/${order.id}/receipt`} className="mt-6 inline-block underline">
          View receipt
        </Link>
      </div>
    </main>
  )
}
