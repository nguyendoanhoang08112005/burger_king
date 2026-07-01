import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { useUiStore } from '../store/uiStore'
import i18n from '../i18n'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

// Automatically inject bearer auth token and language header
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const lang = i18n?.language || localStorage.getItem('hk_language') || 'vi'
    config.headers['Accept-Language'] = lang
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Auto-logout invalid sessions and surface the specific locked-account reason.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 423 && error.response?.data?.code === 'ACCOUNT_LOCKED') {
      if (useAuthStore.getState().isAuthenticated) {
        useAuthStore.getState().setLogout()
        useUiStore.getState().showToast(error.response.data.message, 'error')
      }
    } else if (error.response?.status === 401) {
      useAuthStore.getState().setLogout()
    } else if (error.response?.status === 503 && error.response?.data?.maintenance) {
      useUiStore.getState().setMaintenanceMessage(error.response.data.message)
    }
    return Promise.reject(error)
  }
)

export default apiClient
