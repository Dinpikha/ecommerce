import { Minus, Plus } from 'lucide-react'

export default function QuantitySelector({ quantity, max, onChange, disabled = false }) {
  const decrease = () => onChange(Math.max(1, quantity - 1))
  const increase = () => onChange(Math.min(max, quantity + 1))

  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || quantity <= 1}
        onClick={decrease}
        className="grid size-9 place-items-center rounded-full border border-border disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Minus size={15} />
      </button>
      <span className="min-w-6 text-center text-sm font-semibold">{quantity}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || quantity >= max}
        onClick={increase}
        className="grid size-9 place-items-center rounded-full border border-border disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus size={15} />
      </button>
    </div>
  )
}
