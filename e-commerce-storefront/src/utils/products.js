export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

export function sortProducts(products, sort) {
  const copy = [...products]

  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => Number(a.price) - Number(b.price))
    case 'price-desc':
      return copy.sort((a, b) => Number(b.price) - Number(a.price))
    case 'rating':
      return copy.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    default:
      return copy.sort((a, b) => b.id - a.id)
  }
}
