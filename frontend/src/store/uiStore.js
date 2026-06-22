import { create } from 'zustand'

export const useUiStore = create((set, get) => ({
  cartDrawerOpen: false,
  mobileNavOpen: false,
  toast: null, // { message, type: 'success' | 'error' | 'info' }
  publicSettings: {},
  maintenanceMessage: null,

  setCartDrawerOpen: (isOpen) => set({ cartDrawerOpen: isOpen }),
  setMobileNavOpen: (isOpen) => set({ mobileNavOpen: isOpen }),
  setPublicSettings: (settings) => set({ publicSettings: settings || {} }),
  setPublicSetting: (key, value) => set(state => ({
    publicSettings: { ...state.publicSettings, [key]: value },
  })),
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
