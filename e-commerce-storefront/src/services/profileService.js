import api from './api'

// Backend currently has no profile update endpoint.
// When PATCH /auth/me (or similar) is added, wire it here.
export const profileService = {
  update: async (_payload) => {
    throw new Error('Profile update endpoint not implemented on backend yet')
  },
  // Placeholder for future: () => api.patch('/auth/me', payload).then((r) => r.data)
}
