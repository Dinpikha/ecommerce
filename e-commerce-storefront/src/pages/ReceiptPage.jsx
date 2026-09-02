import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Printer, Sparkles } from 'lucide-react'
import { orderService } from '../services/orderService'
import { formatAddress, formatDate, formatPaymentMethod, money } from '../utils/format'

export default function ReceiptPage() {
  const { id } = useParams()
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    orderService
      .receipt(id)
      .then(setReceipt)
      .catch(() => setError('Receipt not found.'))
      .finally(() => setLoading(false))
  }, [id])

  const handlePrint = () => window.print()

  if (loading) {
    return <main className="p-20 text-center text-muted-foreground">Loading receipt...</main>
  }

  if (error || !receipt) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12 text-center lg:px-8">
        <p className="text-destructive">{error || 'Receipt not found.'}</p>
        <Link to="/orders" className="mt-6 inline-block underline">
          View my orders
        </Link>
      </main>
    )
  }

  return (
    <main className="receipt-page mx-auto max-w-4xl px-5 py-12 lg:px-8">
      <div className="receipt-toolbar mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[.18em] text-coral">Northstar account</p>
          <h1 className="mt-2 font-serif text-5xl">Receipt</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground"
          >
            <Printer size={16} />
            Print / Save as PDF
          </button>
          <Link to={`/orders/${receipt.order_id}`} className="rounded-full border border-border px-5 py-3">
            Back to order
          </Link>
          <Link to="/products" className="rounded-full border border-border px-5 py-3">
            Continue shopping
          </Link>
        </div>
      </div>

      <article className="receipt-document rounded-3xl border border-border bg-card p-8 shadow-sm lg:p-10">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="font-serif text-2xl font-semibold">northstar</p>
              <p className="text-sm text-muted-foreground">Official purchase receipt</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">Receipt #{receipt.order_id}</p>
            <p className="mt-1 text-muted-foreground">{formatDate(receipt.order_date)}</p>
            <p className="mt-1">Ref: {receipt.transaction_ref}</p>
          </div>
        </header>

        <section className="mt-8 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-xs uppercase tracking-[.14em] text-muted-foreground">Customer</h2>
            <p className="mt-2 font-semibold">{receipt.customer_name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{receipt.phone}</p>
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-[.14em] text-muted-foreground">Shipping address</h2>
            <p className="mt-2 text-sm leading-relaxed">{formatAddress(receipt)}</p>
          </div>
        </section>

        <section className="mt-8 grid gap-4 rounded-2xl bg-muted/50 p-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[.14em] text-muted-foreground">Payment method</p>
            <p className="mt-1 font-medium">{formatPaymentMethod(receipt.payment_method)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[.14em] text-muted-foreground">Payment status</p>
            <p className="mt-1 font-medium">{receipt.payment_status}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[.14em] text-muted-foreground">Order status</p>
            <p className="mt-1 font-medium">{receipt.order_status}</p>
          </div>
        </section>

        <div className="mt-8 overflow-x-auto">
          <table className="receipt-table w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-[.14em] text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Item</th>
                <th className="pb-3 pr-4 font-medium">Qty</th>
                <th className="pb-3 pr-4 font-medium">Unit price</th>
                <th className="pb-3 text-right font-medium">Line total</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item) => (
                <tr key={item.id} className="border-b border-border/70">
                  <td className="py-4 pr-4 font-medium">{item.product_name}</td>
                  <td className="py-4 pr-4">{item.quantity}</td>
                  <td className="py-4 pr-4">{money(item.unit_price)}</td>
                  <td className="py-4 text-right font-medium">{money(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{money(receipt.subtotal)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Tax</span>
              <span>{money(receipt.tax)}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-2 text-lg font-semibold">
              <span>Total</span>
              <span>{money(receipt.total)}</span>
            </div>
          </div>
        </div>

        <footer className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>Thank you for shopping with northstar.</p>
          <p className="mt-1">We appreciate your business and hope you enjoy your purchase.</p>
        </footer>
      </article>
    </main>
  )
}
