import { create } from 'zustand'

const getStoredSettings = () => {
  try {
    const stored = localStorage.getItem('public_settings')
    return stored ? JSON.parse(stored) : {}
  } catch (e) {
    return {}
  }
}

export const useUiStore = create((set, get) => ({
  cartDrawerOpen: false,
  mobileNavOpen: false,
  toast: null, // { message, type: 'success' | 'error' | 'info' }
  publicSettings: getStoredSettings(),
  publicSettingsLoaded: Object.keys(getStoredSettings()).length > 0,
  maintenanceMessage: null,

  setCartDrawerOpen: (isOpen) => set({ cartDrawerOpen: isOpen }),
  setMobileNavOpen: (isOpen) => set({ mobileNavOpen: isOpen }),
  setPublicSettings: (settings) => {
    try {
      localStorage.setItem('public_settings', JSON.stringify(settings || {}))
    } catch (e) {}
    set({ publicSettings: settings || {}, publicSettingsLoaded: true })
  },
  setPublicSetting: (key, value) => set(state => {
    const nextSettings = { ...state.publicSettings, [key]: value }
    try {
      localStorage.setItem('public_settings', JSON.stringify(nextSettings))
    } catch (e) {}
    return { publicSettings: nextSettings }
  }),
  setMaintenanceMessage: (msg) => set({ maintenanceMessage: msg }),
  
  showToast: (message, type = 'success') => {
    // Clear old timer if active
    const oldToast = get().toast
    if (oldToast?.timerId) {
      clearTimeout(oldToast.timerId)
    }

    const timerId = setTimeout(() => {
      get().hideToast()
    }, 3500)

    set({ toast: { message, type, timerId } })
  },

  hideToast: () => {
    const toast = get().toast
    if (toast?.timerId) {
      clearTimeout(toast.timerId)
    }
    set({ toast: null })
  }
}))
