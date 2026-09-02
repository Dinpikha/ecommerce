import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { CheckCircle2, Download } from 'lucide-react'
import { orderService } from '../services/orderService'
import { useAuth } from '../context/AuthContext'
import { getOrCreateCustomerId } from '../utils/customerId'
import { formatAddress, formatDate, formatPaymentMethod, money } from '../utils/format'

function paymentStatusLabel(order) {
  if (order.payment_status === 'PAID') return 'Paid'
  if (order.order_status === 'CONFIRMED') return 'Order Placed'
  return order.payment_status || order.order_status || 'Order Placed'
}

export default function OrderSuccessPage() {
  const { id } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const [order, setOrder] = useState(location.state?.order ?? null)
  const [loading, setLoading] = useState(!location.state?.order)
  const [error, setError] = useState('')
  const email = location.state?.email || user?.email || ''

  const customerId = useMemo(() => (order ? getOrCreateCustomerId(order.id) : ''), [order])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    orderService
      .get(id)
      .then((data) => {
        if (active) setOrder(data)
      })
      .catch((err) => {
        console.error('Failed to load order:', err?.response?.data || err)
        if (active) {
          setOrder(null)
          setError('Order not found.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  const handleDownloadReceipt = async () => {
    if (!order) return
    const { generateOrderReceiptPdf } = await import('../utils/generateReceiptPdf')
    generateOrderReceiptPdf({ order, email, customerId })
  }

  if (loading) {
    return <main className="p-20 text-center text-muted-foreground">Loading order...</main>
  }

  if (error || !order) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12 text-center lg:px-8">
        <p className="text-destructive">{error || 'Order not found.'}</p>
        <Link to="/orders" className="mt-6 inline-block underline">
          View my orders
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
      <p className="text-xs uppercase tracking-[.18em] text-coral">Northstar account</p>
      <div className="mt-2 flex items-start gap-4">
        <CheckCircle2 className="mt-2 size-10 shrink-0 text-coral" aria-hidden />
        <div>
          <h1 className="font-serif text-5xl">Order placed successfully</h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for your purchase. Your order #{order.id} has been confirmed.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDownloadReceipt}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground"
        >
          <Download size={16} />
          Download receipt
        </button>
        <Link to={`/orders/${order.id}/receipt`} className="rounded-full border border-border px-5 py-3">
          View receipt
        </Link>
        <Link to="/products" className="rounded-full border border-border px-5 py-3">
          Continue shopping
        </Link>
        <Link to="/orders" className="rounded-full border border-border px-5 py-3">
          View my orders
        </Link>
      </div>

      <div className="mt-10 space-y-6">
        <section className="rounded-3xl bg-card p-7">
          <h2 className="font-serif text-2xl">Order summary</h2>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[.14em] text-muted-foreground">Order ID</dt>
              <dd className="mt-1 font-semibold">#{order.id}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[.14em] text-muted-foreground">Customer ID</dt>
              <dd className="mt-1 font-semibold">{customerId}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[.14em] text-muted-foreground">
                Transaction reference
              </dt>
              <dd className="mt-1 font-semibold">{order.transaction_ref}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[.14em] text-muted-foreground">Order date</dt>
              <dd className="mt-1">{formatDate(order.created_at)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[.14em] text-muted-foreground">Order status</dt>
              <dd className="mt-1">
                <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
                  {order.order_status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[.14em] text-muted-foreground">Payment status</dt>
              <dd className="mt-1">
                <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
                  {paymentStatusLabel(order)}
                </span>
              </dd>
            </div>
          </dl>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl bg-card p-7">
            <h2 className="font-serif text-2xl">Customer</h2>
            <p className="mt-4 font-semibold">{order.customer_name}</p>
            {email && <p className="mt-1 text-sm text-muted-foreground">{email}</p>}
            <p className="mt-1 text-sm text-muted-foreground">{order.phone}</p>
          </section>

          <section className="rounded-3xl bg-card p-7">
            <h2 className="font-serif text-2xl">Shipping address</h2>
            <p className="mt-4 text-sm leading-relaxed">{formatAddress(order)}</p>
          </section>
        </div>

        <section className="rounded-3xl bg-card p-7">
          <h2 className="font-serif text-2xl">Payment</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[.14em] text-muted-foreground">Payment method</dt>
              <dd className="mt-1">{formatPaymentMethod(order.payment_method)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[.14em] text-muted-foreground">Payment status</dt>
              <dd className="mt-1">{paymentStatusLabel(order)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-3xl bg-card p-7">
          <h2 className="font-serif text-2xl">Items ordered</h2>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-[.14em] text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Product</th>
                  <th className="pb-3 pr-4 font-medium">Qty</th>
                  <th className="pb-3 pr-4 font-medium">Unit price</th>
                  <th className="pb-3 text-right font-medium">Line total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-border/70">
                    <td className="py-4 pr-4 font-semibold">
                      {item.product_name}
                      {item.variant_color && (
                        <span className="mt-1 block text-xs font-normal text-muted-foreground">
                          Color: {item.variant_color}
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-4">{item.quantity}</td>
                    <td className="py-4 pr-4">{money(item.unit_price)}</td>
                    <td className="py-4 text-right font-semibold">{money(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{money(order.subtotal)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Tax</span>
              <span>{money(order.tax)}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-2 text-lg font-semibold">
              <span>Total</span>
              <span>{money(order.total)}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
