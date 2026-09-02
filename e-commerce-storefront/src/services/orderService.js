import api from './api'

export const orderService = {
  checkout: async (payload) => {
    const response = await api.post('/orders/checkout', payload)
    if ((response.status === 200 || response.status === 201) && response.data?.id) {
      return response.data
    }
    throw new Error('Checkout completed but the server returned an unexpected response.')
  },
  list: () => api.get('/orders').then((r) => r.data),
  get: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  receipt: (id) => api.get(`/orders/${id}/receipt`).then((r) => r.data),
}
