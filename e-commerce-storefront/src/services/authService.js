import api, { TOKEN_KEY } from './api'

export const authService = {
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  saveToken: (token) => sessionStorage.setItem(TOKEN_KEY, token),
  getToken: () => sessionStorage.getItem(TOKEN_KEY),
  logout: () => sessionStorage.removeItem(TOKEN_KEY),
}
