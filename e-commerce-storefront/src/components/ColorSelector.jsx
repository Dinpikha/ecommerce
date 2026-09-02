import { getColorHex } from '../utils/productVariations'

export default function ColorSelector({ colors, selected, onSelect }) {
  if (!colors.length) return null

  return (
    <div>
      <p className="text-sm font-medium">Color</p>
      <p className="mt-1 text-xs text-muted-foreground">{selected}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {colors.map((color) => {
          const active = color === selected
          return (
            <button
              key={color}
              type="button"
              aria-label={`Select ${color}`}
              onClick={() => onSelect(color)}
              className={`rounded-full border p-1 transition ${
                active ? 'border-coral ring-2 ring-coral/30' : 'border-border'
              }`}
            >
              <span
                className="block size-7 rounded-full border border-border/60"
                style={{ backgroundColor: getColorHex(color) }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
