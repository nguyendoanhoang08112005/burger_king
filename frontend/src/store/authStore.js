import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('hk_user')) || null,
  token: localStorage.getItem('hk_token') || null,
  isAuthenticated: !!localStorage.getItem('hk_token'),

  setLogin: (user, token) => {
    localStorage.setItem('hk_user', JSON.stringify(user))
    localStorage.setItem('hk_token', token)
    set({ user, token, isAuthenticated: true })
  },

  setLogout: () => {
    localStorage.removeItem('hk_user')
    localStorage.removeItem('hk_token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  updateUser: (updatedUser) => {
    const user = { ...JSON.parse(localStorage.getItem('hk_user') || '{}'), ...updatedUser }
    localStorage.setItem('hk_user', JSON.stringify(user))
    set({ user })
  }
}))
