import { useState } from 'react'

export default function ProductImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`flex aspect-[.82] items-center justify-center rounded-2xl bg-muted text-xs uppercase tracking-[.2em] text-muted-foreground ${className}`}
      >
        No image
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt || 'Product'}
      onError={() => setFailed(true)}
      className={`aspect-[.82] w-full rounded-2xl object-cover ${className}`}
    />
  )
}
