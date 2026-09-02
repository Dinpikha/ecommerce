const COLOR_HEX = {
  Black: '#1a1a1a',
  White: '#f5f5f5',
  Navy: '#1e3a5f',
  Blue: '#3b6ea8',
  Rose: '#d9777f',
  Ivory: '#f3efe6',
  Charcoal: '#4a4a4a',
  Olive: '#6b705c',
  Red: '#b42318',
  Green: '#3f6f4f',
  Gold: '#c9a227',
  Silver: '#b8bcc2',
  Pink: '#e8a0b8',
  Brown: '#7a5230',
  Beige: '#d8c8b0',
}

const CATEGORY_COLORS = {
  beauty: ['Rose', 'Ivory', 'Black'],
  fragrances: ['Gold', 'Black', 'Silver'],
  furniture: ['Brown', 'Beige', 'Charcoal'],
  groceries: null,
  'home-decoration': ['Ivory', 'Gold', 'Green'],
  'kitchen-accessories': ['Black', 'Silver', 'Red'],
  laptops: ['Silver', 'Charcoal', 'Black'],
  'mens-shirts': ['White', 'Blue', 'Charcoal', 'Olive'],
  'mens-shoes': ['Black', 'Brown', 'White'],
  'mobile-accessories': ['Black', 'Blue', 'Red'],
  smartphones: ['Black', 'Silver', 'Blue'],
  'sports-accessories': ['Black', 'Red', 'Green'],
  sunglasses: ['Black', 'Brown', 'Gold'],
  tablets: ['Silver', 'Charcoal', 'Black'],
  tops: ['White', 'Pink', 'Blue', 'Black'],
  vehicle: ['Black', 'Silver', 'Red'],
  'womens-bags': ['Black', 'Brown', 'Beige'],
  'womens-dresses': ['Black', 'Navy', 'Rose', 'Ivory'],
  'womens-jewellery': ['Gold', 'Silver', 'Rose'],
  'womens-shoes': ['Black', 'Beige', 'Red'],
  watches: ['Silver', 'Gold', 'Black'],
}

export function getProductColors(product) {
  if (!product) return []

  if (Array.isArray(product.colors) && product.colors.length > 1) {
    return product.colors
  }

  const categoryColors = CATEGORY_COLORS[product.category]
  if (!categoryColors || categoryColors.length < 2) return []

  return categoryColors
}

export function getColorHex(colorName) {
  return COLOR_HEX[colorName] || '#d4d4d4'
}
