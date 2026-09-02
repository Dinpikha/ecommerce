export function formatCategoryLabel(slug) {
  if (!slug) return ''
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function extractCategories(products = []) {
  return [...new Set(products.map((product) => product.category).filter(Boolean))].sort()
}

export function groupProductsByCategory(products = []) {
  const counts = new Map()
  const previews = new Map()

  for (const product of products) {
    if (!product.category) continue
    counts.set(product.category, (counts.get(product.category) || 0) + 1)
    if (!previews.has(product.category) && product.image_url) {
      previews.set(product.category, product.image_url)
    }
  }

  return [...counts.entries()]
    .map(([slug, count]) => ({
      slug,
      label: formatCategoryLabel(slug),
      count,
      imageUrl: previews.get(slug) || null,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}
