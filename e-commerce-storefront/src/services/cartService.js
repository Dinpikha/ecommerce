import api from './api'

export const cartService = {
  list: () => api.get('/cart').then((r) => r.data),
  add: (productId, quantity = 1) =>
    api.post('/cart/items', { product_id: productId, quantity }).then((r) => r.data),
  update: (itemId, quantity) =>
    api.patch(`/cart/items/${itemId}`, { quantity }).then((r) => r.data),
  remove: (itemId) => api.delete(`/cart/items/${itemId}`).then((r) => r.data),
}
