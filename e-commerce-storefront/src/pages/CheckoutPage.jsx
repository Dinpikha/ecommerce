import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderService } from '../services/orderService'
import { formatApiError } from '../utils/apiErrors'
import {
  isCheckoutFormValid,
  trimCheckoutForm,
  validateCheckoutForm,
} from '../utils/checkoutValidation'
import { money } from '../utils/format'

const PAYMENT_METHODS = [
  { label: 'Card', value: 'CARD' },
  { label: 'UPI', value: 'UPI' },
  { label: 'Net Banking', value: 'NETBANKING' },
  { label: 'Wallet', value: 'WALLET' },
]

const SHIPPING_FIELDS = [
  { name: 'customer_name', label: 'Full name', placeholder: 'Full name', type: 'text' },
  { name: 'email', label: 'Email', placeholder: 'Email address', type: 'email' },
  { name: 'phone', label: 'Phone', placeholder: 'Phone number', type: 'tel' },
  { name: 'address_line', label: 'Address', placeholder: 'Street address', type: 'text' },
  { name: 'city', label: 'City', placeholder: 'City', type: 'text', grid: 'city' },
  { name: 'state', label: 'State', placeholder: 'State', type: 'text', grid: 'state' },
  { name: 'pincode', label: 'Postal code', placeholder: 'Postal code', type: 'text', grid: 'pincode' },
]

function Field({ field, value, error, touched, onChange, onBlur }) {
  return (
    <div className={field.grid ? '' : 'w-full'}>
      <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium">
        {field.label}
      </label>
      <input
        id={field.name}
        name={field.name}
        type={field.type}
        value={value}
        onChange={(e) => onChange(field.name, e.target.value)}
        onBlur={() => onBlur(field.name)}
        placeholder={field.placeholder}
        className={`w-full rounded-xl border bg-background px-4 py-3 ${
          touched && error ? 'border-destructive' : 'border-border'
        }`}
      />
      {touched && error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user, cart, refreshCart } = useAuth()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({})
  const [form, setForm] = useState({
    customer_name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address_line: '',
    city: '',
    state: '',
    pincode: '',
    payment_method: 'CARD',
  })

  const errors = useMemo(() => validateCheckoutForm(form), [form])
  const shippingValid = useMemo(() => {
    const shippingErrors = validateCheckoutForm(form)
    return isCheckoutFormValid(shippingErrors)
  }, [form])

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const markTouched = (name) => setTouched((prev) => ({ ...prev, [name]: true }))

  const touchAllShippingFields = () => {
    const next = {}
    SHIPPING_FIELDS.forEach((field) => {
      next[field.name] = true
    })
    setTouched((prev) => ({ ...prev, ...next }))
  }

  const continueToPayment = () => {
    touchAllShippingFields()
    if (!shippingValid) return
    setStep(2)
  }

  const submitOrder = async () => {
    touchAllShippingFields()
    const trimmed = trimCheckoutForm(form)
    const validationErrors = validateCheckoutForm(trimmed)
    if (!isCheckoutFormValid(validationErrors)) return

    setError('')
    setLoading(true)

    const checkoutPayload = {
      customer_name: trimmed.customer_name,
      phone: trimmed.phone,
      address_line: trimmed.address_line,
      city: trimmed.city,
      state: trimmed.state,
      pincode: trimmed.pincode,
      payment_method: trimmed.payment_method,
    }

    try {
      const order = await orderService.checkout(checkoutPayload)

      try {
        await refreshCart()
      } catch (cartError) {
        console.error('Cart refresh failed after successful checkout:', cartError)
      }

      navigate(`/orders/${order.id}/success`, {
        state: { order, email: trimmed.email },
      })
    } catch (err) {
      console.error('Checkout failed:', err?.response?.data || err)
      setError(formatApiError(err, 'We could not place your order. Please try again.'))
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

            {SHIPPING_FIELDS.filter((field) => !field.grid).map((field) => (
              <Field
                key={field.name}
                field={field}
                value={form[field.name]}
                error={errors[field.name]}
                touched={touched[field.name]}
                onChange={updateField}
                onBlur={markTouched}
              />
            ))}

            <div className="grid gap-4 sm:grid-cols-3">
              {SHIPPING_FIELDS.filter((field) => field.grid).map((field) => (
                <Field
                  key={field.name}
                  field={field}
                  value={form[field.name]}
                  error={errors[field.name]}
                  touched={touched[field.name]}
                  onChange={updateField}
                  onBlur={markTouched}
                />
              ))}
            </div>

            <button
              type="button"
              disabled={!shippingValid}
              className="rounded-full bg-primary px-5 py-3 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              onClick={continueToPayment}
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
              <button
                type="button"
                className="rounded-full border border-border px-5 py-3"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                disabled={loading || !shippingValid}
                className="rounded-full bg-primary px-5 py-3 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
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
