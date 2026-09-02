import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderService } from '../services/orderService'
import { money } from '../utils/format'

const PAYMENT_METHODS = [
  { label: 'Card', value: 'CARD' },
  { label: 'UPI', value: 'UPI' },
  { label: 'Net Banking', value: 'NETBANKING' },
  { label: 'Wallet', value: 'WALLET' },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user, cart, refreshCart } = useAuth()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    customer_name: user?.name || '',
    phone: '',
    address_line: '',
    city: '',
    state: '',
    pincode: '',
    payment_method: 'CARD',
  })

  const updateField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }))

  const submitOrder = async () => {
    setError('')
    setLoading(true)
    try {
      const order = await orderService.checkout(form)
      const orderId = order.id
      await refreshCart()
      navigate(`/orders/${orderId}/success`, { state: { order } })
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Checkout failed.')
    } finally {
      setLoading(false)
    }
  }

  if (!cart?.items?.length) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
        <h1 className="font-serif text-5xl">Checkout</h1>
        <p className="mt-6 text-muted-foreground">Your cart is empty.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
      <p className="text-xs uppercase tracking-[.18em] text-coral">Northstar account</p>
      <h1 className="mt-2 font-serif text-5xl">Checkout</h1>

      <div className="mt-10 rounded-3xl bg-card p-7">
        <p className="text-sm text-muted-foreground">Subtotal: {money(cart.subtotal)}</p>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        {step === 1 && (
          <div className="mt-6 space-y-4">
            <h2 className="font-serif text-2xl">Shipping details</h2>
            <input
              value={form.customer_name}
              onChange={(e) => updateField('customer_name', e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border border-border bg-background px-4 py-3"
            />
            <input
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="Phone"
              className="w-full rounded-xl border border-border bg-background px-4 py-3"
            />
            <input
              value={form.address_line}
              onChange={(e) => updateField('address_line', e.target.value)}
              placeholder="Address"
              className="w-full rounded-xl border border-border bg-background px-4 py-3"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="City"
                className="rounded-xl border border-border bg-background px-4 py-3"
              />
              <input
                value={form.state}
                onChange={(e) => updateField('state', e.target.value)}
                placeholder="State"
                className="rounded-xl border border-border bg-background px-4 py-3"
              />
              <input
                value={form.pincode}
                onChange={(e) => updateField('pincode', e.target.value)}
                placeholder="Pincode"
                className="rounded-xl border border-border bg-background px-4 py-3"
              />
            </div>
            <button
              className="rounded-full bg-primary px-5 py-3 text-primary-foreground"
              onClick={() => setStep(2)}
            >
              Continue to payment
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-4">
            <h2 className="font-serif text-2xl">Payment method (simulated)</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => updateField('payment_method', method.value)}
                  className={`rounded-xl border px-4 py-3 text-left ${
                    form.payment_method === method.value ? 'border-coral bg-muted' : 'border-border'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              No real payment details are collected. The backend records your chosen method only.
            </p>
            <div className="flex gap-3">
              <button className="rounded-full border border-border px-5 py-3" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                disabled={loading}
                className="rounded-full bg-primary px-5 py-3 text-primary-foreground disabled:opacity-50"
                onClick={submitOrder}
              >
                {loading ? 'Placing order...' : 'Place order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
