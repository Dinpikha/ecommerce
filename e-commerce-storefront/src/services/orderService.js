import api from './api'

export const orderService = {
  checkout: (payload) => api.post('/orders/checkout', payload).then((r) => r.data),
  list: () => api.get('/orders').then((r) => r.data),
  get: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  receipt: (id) => api.get(`/orders/${id}/receipt`).then((r) => r.data),
}
