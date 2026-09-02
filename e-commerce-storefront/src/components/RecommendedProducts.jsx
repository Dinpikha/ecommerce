import { Link } from 'react-router-dom'
import ProductImage from './ProductImage'
import { money } from '../utils/format'

export default function RecommendedProducts({ products }) {
  if (!products.length) return null

  return (
    <section className="mt-16">
      <p className="text-xs uppercase tracking-[.18em] text-coral">Recommended</p>
      <h2 className="mt-2 font-serif text-3xl">You may also like</h2>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {products.map((item) => (
          <Link
            key={item.id}
            to={`/products/${item.id}`}
            className="group overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:-translate-y-1 hover:shadow-md"
          >
            <ProductImage
              src={item.image_url}
              alt={item.name}
              className="aspect-[5/4] rounded-none transition duration-300 group-hover:scale-[1.03]"
            />
            <div className="p-3">
              <h3 className="line-clamp-2 text-sm font-semibold leading-5">{item.name}</h3>
              <p className="mt-2 text-sm font-semibold">{money(item.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
