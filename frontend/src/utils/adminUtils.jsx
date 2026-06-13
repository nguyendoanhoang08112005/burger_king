import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Loader2, Upload } from 'lucide-react'
import apiClient from '../api/axios'

export const apiOrigin = (apiClient.defaults.baseURL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')

export const assetUrl = value => {
  if (!value) return ''
  if (/^(https?:)?\/\//.test(value) || value.startsWith('data:') || value.startsWith('blob:')) return value
  return `${apiOrigin}${value.startsWith('/') ? value : `/${value}`}`
}

export const logoSizeValue = (value, fallback) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? `${numeric}px` : fallback
}

export const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const audioCtx = new AudioContext()

    const playTone = (freq, startTime, duration) => {
      const osc = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, startTime)

      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

      osc.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      osc.start(startTime)
      osc.stop(startTime + duration)
    }

    const now = audioCtx.currentTime
    playTone(523.25, now, 0.4) // C5
    playTone(783.99, now + 0.1, 0.5) // G5
  } catch (e) {
    console.error('Failed to play audio notification', e)
  }
}

export function useAdminText() {
  const { t } = useTranslation()

  return useCallback(
    (key, values = {}) => t(`adminPanel.${key}`, { ...values, defaultValue: key }),
    [t]
  )
}

export const fieldInputClass = 'w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100'

export const slugify = value => (value || '')
  .toString()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '')

export const skuify = (prefix, value) => {
  const base = slugify(value).toUpperCase()
  return base ? `${prefix}-${base}` : ''
}

export function SettingInput({ label, type = 'text', value, onChange, placeholder, suffix, hint, disabled }) {
  return (
    <label className="block text-left">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">{label}</span>
      <div className="relative mt-2">
        <input
          type={type}
          value={value ?? ''}
          placeholder={placeholder}
          disabled={disabled}
          onChange={event => onChange(type === 'number' ? Number(event.target.value) : event.target.value)}
          className={`${fieldInputClass} ${suffix ? 'pr-12' : ''} ${disabled ? 'bg-gray-100 dark:bg-[#161825]/50 text-gray-500 cursor-not-allowed opacity-70' : ''}`}
        />
        {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">{suffix}</span>}
      </div>
      {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
    </label>
  )
}

export function SettingTextarea({ label, value, onChange, rows = 3, placeholder }) {
  return (
    <label className="block text-left">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">{label}</span>
      <textarea rows={rows} value={value ?? ''} placeholder={placeholder} onChange={event => onChange(event.target.value)} className={`${fieldInputClass} mt-2 resize-y`} />
    </label>
  )
}

export function SettingSelect({ label, value, onChange, options, hint, disabled }) {
  return (
    <label className="block text-left">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">{label}</span>
      <select
        value={value ?? ''}
        disabled={disabled}
        onChange={event => onChange?.(event.target.value)}
        className={`${fieldInputClass} mt-2 ${disabled ? 'bg-gray-100 dark:bg-[#161825]/50 text-gray-500 cursor-not-allowed opacity-70' : ''}`}
      >
        {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {hint && <span className="mt-1 block text-xs text-gray-400 dark:text-gray-500">{hint}</span>}
    </label>
  )
}

export function SettingToggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-left">
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button type="button" onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )
}

export function AdminImageInput({ label, value, onChange, uploadType, width, height, onWidthChange, onHeightChange }) {
  const fileInput = useRef(null)
  const tAdmin = useAdminText()
  const [uploading, setUploading] = useState(false)
  const hasSizeControls = typeof onWidthChange === 'function' && typeof onHeightChange === 'function'
  const previewWidth = logoSizeValue(width, uploadType === 'favicon' ? '56px' : '260px')
  const previewHeight = logoSizeValue(height, uploadType === 'favicon' ? '56px' : '64px')

  const handleUpload = async file => {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      if (uploadType) formData.append('type', uploadType)

      const endpoint = uploadType ? '/admin/settings/upload' : '/admin/upload'
      const { data } = await apiClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = data?.data?.url || data?.url
      onChange(assetUrl(url))
      toast.success(tAdmin('upload_success'))
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('upload_error'))
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  return (
    <div className="flex h-full flex-col space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-[#1E2130]">
      <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">{label || tAdmin('image')}</h3>
      <input
        value={value || ''}
        onChange={event => onChange(event.target.value)}
        placeholder={tAdmin('image_url_placeholder')}
        className={fieldInputClass}
      />
      <p className="text-xs text-gray-400">{tAdmin('image_format_hint')}</p>
      {hasSizeControls && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SettingInput
            label={tAdmin('image_width')}
            type="number"
            suffix="px"
            value={width}
            onChange={onWidthChange}
          />
          <SettingInput
            label={tAdmin('image_height')}
            type="number"
            suffix="px"
            value={height}
            onChange={onHeightChange}
          />
        </div>
      )}
      <div
        onDragOver={event => event.preventDefault()}
        onDrop={event => {
          event.preventDefault()
          handleUpload(event.dataTransfer.files[0])
        }}
        onClick={() => fileInput.current?.click()}
        className="flex h-[260px] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition-all hover:border-red-400 hover:bg-red-50/50 dark:border-gray-700 dark:hover:bg-red-500/10 cursor-pointer"
      >
        {uploading ? (
          <div>
            <Loader2 className="mx-auto text-gray-400 mb-3 animate-spin" size={36} />
            <p className="text-sm text-gray-500">{tAdmin('uploading')}</p>
          </div>
        ) : value ? (
          <img
            src={assetUrl(value)}
            alt=""
            style={hasSizeControls ? { width: previewWidth, height: previewHeight } : undefined}
            className="mx-auto max-h-full max-w-full rounded-lg object-contain"
          />
        ) : (
          <div>
            <Upload className="mx-auto text-gray-400 mb-3" size={40} />
            <p className="text-sm text-gray-500">{tAdmin('drag_image')}</p>
          </div>
        )}
      </div>
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={event => handleUpload(event.target.files[0])} />
    </div>
  )
}


export const notificationData = item => {
  if (!item?.data) return {}
  if (typeof item.data === 'string') {
    try { return JSON.parse(item.data) } catch { return {} }
  }
  return item.data
}

export const notificationTitle = item => {
  const data = notificationData(item)
  return item?.title || data.title || data.message || item?.message || ''
}

export const notificationBody = item => {
  const data = notificationData(item)
  return data.body || data.content || ''
}

export const unwrapNotifications = payload => (Array.isArray(payload) ? payload : payload?.data || [])

export const formatBadgeCount = value => {
  const count = Number.parseInt(Number(value || 0), 10)
  if (!Number.isFinite(count) || count <= 0) return null
  return count > 99 ? '99+' : String(count)
}

export const adminPermissionModules = [
  'dashboard', 'reports', 'orders', 'products', 'categories', 'combos', 'toppings',
  'coupons', 'payments', 'users', 'reviews', 'loyalty', 'complaints', 'posts', 'banners',
  'branches', 'settings', 'languages', 'notifications',
]

export const canAccessAdminModule = (user, module) =>
  user?.role === 'admin' || user?.permissions?.includes(`access.${module}`)

export const adminPathModule = path => {
  const segment = path.split('/').filter(Boolean)[1] || 'dashboard'
  return segment === 'translations' ? 'languages' : segment
}

export const bannerPositionOptions = [
  { value: 'hero', labelKey: 'banner_position_home_hero' },
  { value: 'blog_hero', labelKey: 'banner_position_blog_hero' },
  { value: 'popup', labelKey: 'banner_position_popup' },
  { value: 'sidebar', labelKey: 'banner_position_sidebar' },
]

export const CURRENCY_OPTIONS = [
  { value: 'VND', symbol: '₫', label: 'VND - Vietnam Dong (VND)' },
  { value: 'USD', symbol: '$', label: 'USD - US Dollar (USD)' },
  { value: 'EUR', symbol: '€', label: 'EUR - Euro (EUR)' },
  { value: 'CNY', symbol: '¥', label: 'CNY - Chinese Yuan (CNY)' },
  { value: 'KRW', symbol: '₩', label: 'KRW - Korean Won (KRW)' },
  { value: 'JPY', symbol: '¥', label: 'JPY - Japanese Yen (JPY)' },
  { value: 'GBP', symbol: '£', label: 'GBP - British Pound (GBP)' },
  { value: 'SGD', symbol: 'S$', label: 'SGD - Singapore Dollar (SGD)' },
  { value: 'THB', symbol: 'THB', label: 'THB - Thai Baht (THB)' },
]

