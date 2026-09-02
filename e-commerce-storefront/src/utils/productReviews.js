const REVIEWERS = [
  'Aisha Khan',
  'James Miller',
  'Priya Sharma',
  'Daniel Brooks',
  'Mei Chen',
  'Sofia Alvarez',
]

const REVIEW_SNIPPETS = [
  'Exactly what I was looking for. Great quality and fast delivery.',
  'Beautiful finish and feels premium in person. Would buy again.',
  'Solid value for the price. Packaging was neat and secure.',
  'Fits perfectly into my daily routine. Very happy with this purchase.',
  'Looks even better than the photos. Highly recommend.',
]

function daysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

function generateDemoReviews(product) {
  const baseRating = Number(product.rating || 4.2)
  const count = 3 + (product.id % 2)

  return Array.from({ length: count }, (_, index) => {
    const rating = Math.min(5, Math.max(3.5, baseRating + (index % 2 === 0 ? 0.3 : -0.2)))
    return {
      id: `${product.id}-${index}`,
      reviewerName: REVIEWERS[(product.id + index) % REVIEWERS.length],
      rating: Number(rating.toFixed(1)),
      text: REVIEW_SNIPPETS[(product.id + index) % REVIEW_SNIPPETS.length],
      date: daysAgo(4 + index * 9),
    }
  })
}

export function getProductReviews(product) {
  if (!product) return []
  if (Array.isArray(product.reviews) && product.reviews.length) {
    return product.reviews
  }
  return generateDemoReviews(product)
}

export function getAverageRating(product, reviews) {
  if (reviews.length) {
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0)
    return Number((total / reviews.length).toFixed(1))
  }
  if (product?.rating != null) return Number(Number(product.rating).toFixed(1))
  return null
}
