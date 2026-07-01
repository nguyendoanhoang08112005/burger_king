import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Info, Loader2, Upload } from 'lucide-react'
import apiClient from '../api/axios'

// ─── URL helpers ───────────────────────────────────────────────────────────────

export const apiOrigin = (apiClient.defaults.baseURL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')

export const assetUrl = value => {
  if (!value) return ''
  if (/^(https?:)?\/\//.test(value) || value.startsWith('data:') || value.startsWith('blob:')) return value
  if (value.startsWith('/') && !value.startsWith('/storage') && !value.startsWith('/uploads')) return value
  return `${apiOrigin}${value.startsWith('/') ? value : `/${value}`}`
}

export const logoSizeValue = (value, fallback) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? `${numeric}px` : fallback
}

// ─── Flag helpers ─────────────────────────────────────────────────────────────

export const getCountryCode = localeCode => {
  const map = {
    vi: 'vn',
    en: 'us',
    zh: 'cn',
    ja: 'jp',
    ko: 'kr',
    fr: 'fr',
    de: 'de',
    es: 'es',
    ar: 'sa',
    be: 'by',
    th: 'th',
  }
  return map[(localeCode || '').toLowerCase()] || (localeCode || '').toLowerCase()
}

export const renderFlag = (localeCode, className = 'inline-block h-3.5 w-5 rounded-sm object-cover shadow-sm') => {
  const country = getCountryCode(localeCode)
  return (
    <img
      src={`https://flagcdn.com/${country}.svg`}
      alt={localeCode}
      className={className}
      onError={e => {
        e.target.style.display = 'none'
      }}
    />
  )
}

// ─── Text / slug helpers ───────────────────────────────────────────────────────

export const fieldInputClass =
  'w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100'

export const slugify = value =>
  (value || '')
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

// ─── Order helpers ─────────────────────────────────────────────────────────────

export const statusTabs = [
  { key: '' },
  { key: 'pending' },
  { key: 'confirmed' },
  { key: 'preparing' },
  { key: 'delivering' },
  { key: 'completed' },
  { key: 'cancelled' },
]

export const statusClasses = {
  pending:   'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300',
  preparing: 'bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300',
  delivering:'bg-purple-100 text-purple-700 dark:bg-purple-400/15 dark:text-purple-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300',
}

export const orderStatusFlow = ['pending', 'confirmed', 'preparing', 'delivering', 'completed']

export const getAllowedOrderStatuses = status => {
  const transitions = {
    pending:   ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['delivering', 'cancelled'],
    delivering:['completed'],
    completed: [],
    cancelled: [],
  }
  return transitions[status] || []
}

export const orderStatusProgress = status => {
  if (status === 'cancelled') return -1
  return orderStatusFlow.indexOf(status)
}

// ─── Badge / menu helpers ──────────────────────────────────────────────────────

export const formatBadgeCount = value => {
  const count = Number.parseInt(Number(value || 0), 10)
  if (!Number.isFinite(count) || count <= 0) return null
  return count > 99 ? '99+' : String(count)
}

export const adminPermissionModules = [
  'dashboard', 'reports', 'orders', 'products', 'categories', 'combos', 'toppings',
  'coupons', 'payments', 'users', 'reviews', 'loyalty', 'complaints', 'posts', 'post-categories', 'post-tags', 'banners',
  'branches', 'settings', 'languages', 'notifications', 'contacts',
]

export const canAccessAdminModule = (user, module) =>
  user?.role === 'admin' || user?.permissions?.includes(`access.${module}`)

export const adminPathModule = path => {
  const segment = path.split('/').filter(Boolean)[1] || 'dashboard'
  return segment === 'translations' ? 'languages' : segment
}

export const bannerPositionOptions = [
  { value: 'blog_hero', labelKey: 'banner_position_blog_hero' },
  { value: 'popup',     labelKey: 'banner_position_popup' },
  { value: 'sidebar',   labelKey: 'banner_position_sidebar' },
]

export const CURRENCY_OPTIONS = [
  { value: 'VND', symbol: '₫',  label: 'VND - Vietnam Dong (VND)' },
  { value: 'USD', symbol: '$',  label: 'USD - US Dollar (USD)' },
  { value: 'EUR', symbol: '€',  label: 'EUR - Euro (EUR)' },
  { value: 'CNY', symbol: '¥',  label: 'CNY - Chinese Yuan (CNY)' },
  { value: 'KRW', symbol: '₩',  label: 'KRW - Korean Won (KRW)' },
  { value: 'JPY', symbol: '¥',  label: 'JPY - Japanese Yen (JPY)' },
  { value: 'GBP', symbol: '£',  label: 'GBP - British Pound (GBP)' },
  { value: 'SGD', symbol: 'S$', label: 'SGD - Singapore Dollar (SGD)' },
  { value: 'THB', symbol: 'THB',label: 'THB - Thai Baht (THB)' },
]

export const menuGroups = [
  {
    labelKey: 'group_overview',
    items: [
      { labelKey: 'dashboard', path: '/admin' },
      { labelKey: 'reports',   path: '/admin/reports' },
    ],
  },
  {
    labelKey: 'group_menu',
    items: [
      { labelKey: 'products',   path: '/admin/products' },
      { labelKey: 'categories', path: '/admin/categories' },
      { labelKey: 'combos',     path: '/admin/combos' },
      { labelKey: 'toppings',   path: '/admin/toppings' },
    ],
  },
  {
    labelKey: 'group_sales',
    items: [
      { labelKey: 'orders',     path: '/admin/orders',     badgeKey: 'pendingOrders' },
      { labelKey: 'complaints', path: '/admin/complaints', badgeKey: 'pendingComplaints' },
      { labelKey: 'coupons',    path: '/admin/coupons' },
      { labelKey: 'payments',   path: '/admin/payments' },
    ],
  },
  {
    labelKey: 'group_customers',
    items: [
      { labelKey: 'users',   path: '/admin/users' },
      { labelKey: 'reviews', path: '/admin/reviews' },
      { labelKey: 'contacts', path: '/admin/contacts' },
      { labelKey: 'loyalty', path: '/admin/loyalty' },
    ],
  },
  {
    labelKey: 'group_content',
    items: [
      { labelKey: 'posts',           path: '/admin/posts' },
      { labelKey: 'post-categories', path: '/admin/post-categories' },
      { labelKey: 'post-tags',       path: '/admin/post-tags' },
      { labelKey: 'banners',         path: '/admin/banners' },
      { labelKey: 'branches',        path: '/admin/branches' },
    ],
  },
  {
    labelKey: 'group_system',
    items: [
      { labelKey: 'settings',      path: '/admin/settings' },
      { labelKey: 'languages',     path: '/admin/translations/locales' },
      { labelKey: 'notifications', path: '/admin/notifications', badgeKey: 'notificationsUnread' },
    ],
  },
]

// ─── API response helpers ──────────────────────────────────────────────────────

export function unwrap(response) {
  const body = response.data
  return body?.success ? body.data : body
}

export function getMeta(response) {
  const body = response.data
  if (body?.meta) return body.meta
  if (body?.current_page) {
    return {
      current_page: body.current_page,
      last_page:    body.last_page,
      total:        body.total,
      per_page:     body.per_page,
    }
  }
  return null
}

export const unwrapNotifications = payload =>
  Array.isArray(payload) ? payload : payload?.data || []

export const notificationData = item => {
  if (!item?.data) return {}
  if (typeof item.data === 'string') {
    try { return JSON.parse(item.data) } catch { return {} }
  }
  return item.data
}

export const notificationTitle = item => {
  const data = notificationData(item)
  const rawTitle = item?.title || data.title || data.message || item?.message || ''
  
  if (rawTitle === 'Khiếu nại mới') {
    return i18next.t('adminPanel.new_complaint', 'Khiếu nại mới')
  }
  if (rawTitle === 'Đánh giá mới') {
    return i18next.t('adminPanel.new_review', 'Đánh giá mới')
  }
  if (rawTitle === 'Đơn hàng mới') {
    return i18next.t('adminPanel.new_order', 'Đơn hàng mới')
  }
  if (rawTitle === 'Liên hệ mới') {
    return i18next.t('adminPanel.new_contact', 'Liên hệ mới')
  }
  if (rawTitle === 'Đăng ký nhận tin') {
    return i18next.t('adminPanel.new_newsletter', 'Đăng ký nhận tin')
  }
  
  return rawTitle
}

export const notificationBody = item => {
  const data = notificationData(item)
  const rawBody = data.body || data.content || ''
  
  const complaintRegex = /^Đơn hàng (HK-[A-Z0-9]+|HBK-[A-Z0-9]+) có khiếu nại mới về \[(.+)\]\. Người thực hiện: (.+)\.$/i
  const complaintMatch = rawBody.match(complaintRegex)
  if (complaintMatch) {
    const code = complaintMatch[1]
    const type = complaintMatch[2]
    const customer = complaintMatch[3]
    
    const typeMap = {
      'Thiếu món': i18next.t('adminPanel.issue_missing', 'Thiếu món'),
      'Giao sai món': i18next.t('adminPanel.issue_wrong', 'Giao sai món'),
      'Chất lượng kém': i18next.t('adminPanel.issue_bad_quality', 'Chất lượng kém'),
      'Giao hàng trễ': i18next.t('adminPanel.issue_late_delivery', 'Giao hàng trễ'),
      'Thái độ shipper': i18next.t('adminPanel.issue_shipper_attitude', 'Thái độ shipper'),
      'Vấn đề khác': i18next.t('adminPanel.issue_other', 'Vấn đề khác'),
    }
    const translatedType = typeMap[type] || type
    return i18next.t('adminPanel.notification_new_complaint_body', 'Đơn hàng {{code}} có khiếu nại mới về [{{type}}]. Người thực hiện: {{customer}}.', { code, type: translatedType, customer })
  }
  
  const reviewRegex = /^(.+) vừa đánh giá đơn (HK-[A-Z0-9]+|HBK-[A-Z0-9]+) (\d+) sao\.$/i
  const reviewMatch = rawBody.match(reviewRegex)
  if (reviewMatch) {
    const customer = reviewMatch[1]
    const code = reviewMatch[2]
    const rating = reviewMatch[3]
    return i18next.t('adminPanel.notification_new_review_body', '{{customer}} vừa đánh giá đơn {{code}} {{rating}} sao.', { customer, code, rating })
  }

  const orderRegex = /^(.+) vừa đặt đơn (HK-[A-Z0-9]+|HBK-[A-Z0-9]+), tổng tiền (.+) đ\.$/i
  const orderMatch = rawBody.match(orderRegex)
  if (orderMatch) {
    const customer = orderMatch[1]
    const code = orderMatch[2]
    const total = orderMatch[3]
    return i18next.t('adminPanel.notification_new_order_body', '{{customer}} vừa đặt đơn {{code}}, tổng tiền {{total}} đ.', { customer, code, total })
  }

  const contactRegex = /^Khách hàng (.+) vừa gửi yêu cầu liên hệ hỗ trợ\.$/i
  const contactMatch = rawBody.match(contactRegex)
  if (contactMatch) {
    const customer = contactMatch[1]
    return i18next.t('adminPanel.notification_new_contact_body', 'Khách hàng {{customer}} vừa gửi yêu cầu liên hệ hỗ trợ.', { customer })
  }

  const newsletterRegex = /^Email (.+) vừa đăng ký nhận bản tin\.$/i
  const newsletterMatch = rawBody.match(newsletterRegex)
  if (newsletterMatch) {
    const email = newsletterMatch[1]
    return i18next.t('adminPanel.notification_new_newsletter_body', 'Email {{email}} vừa đăng ký nhận bản tin.', { email })
  }

  return rawBody
}

// ─── Audio ─────────────────────────────────────────────────────────────────────

export const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return

    const audioCtx = new AudioContext()
    const playTone = (freq, startTime, duration) => {
      const osc      = audioCtx.createOscillator()
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
    playTone(523.25, now,       0.4) // C5
    playTone(783.99, now + 0.1, 0.5) // G5
  } catch (e) {
    console.error('Failed to play audio notification', e)
  }
}

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export function useAdminText() {
  const { t } = useTranslation()

  return useCallback(
    (key, defaultValueOrOptions, options = {}) => {
      let opts = {}
      if (typeof defaultValueOrOptions === 'string') {
        opts = { defaultValue: defaultValueOrOptions, ...options }
      } else {
        opts = { defaultValue: key, ...defaultValueOrOptions }
      }
      return t(`adminPanel.${key}`, opts)
    },
    [t]
  )
}

// ─── UI Components ─────────────────────────────────────────────────────────────

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-4">
          {Array.from({ length: cols }).map((_, col) => (
            <div key={col} className="h-9 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function EmptyTableRow({ colSpan, message }) {
  const tAdmin = useAdminText()
  return (
    <tr>
      <td colSpan={colSpan} className="py-10 text-center text-sm text-gray-400">
        {message || tAdmin('no_data')}
      </td>
    </tr>
  )
}

export function EmptyState({ message, className = 'h-[220px]' }) {
  return (
    <div className={`${className} flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-[#161825]/60 text-center px-4`}>
      <Info size={22} className="text-gray-300" />
      <p className="text-sm font-medium text-gray-400">{message}</p>
    </div>
  )
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => start + i).filter(p => p <= totalPages)

  return (
    <div className="flex items-center gap-1">
      <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)} className="p-2 rounded-lg disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <ChevronLeft size={16} />
      </button>
      {pages.map(p => (
        <button
          key={p} type="button" onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-[#D62300] text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
          {p}
        </button>
      ))}
      <button type="button" disabled={page === totalPages} onClick={() => onChange(page + 1)} className="p-2 rounded-lg disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }) {
  const tAdmin = useAdminText()
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div onMouseDown={e => e.stopPropagation()} className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-300 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#161825] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
            {tAdmin('cancel')}
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {tAdmin('confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminPageShell({ title, eyebrow, action, onAction, children }) {
  const tAdmin = useAdminText()
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400 font-medium">{eyebrow || tAdmin('admin_home')}</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        </div>
        {action && (
          <button type="button" onClick={onAction} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#D62300] hover:bg-[#b51e00] text-white rounded-lg text-sm font-semibold transition-colors">
            {action}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

export function ToggleCell({ checked, onToggle }) {
  return (
    <button type="button" onClick={onToggle} className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${checked ? 'bg-green-500' : 'bg-gray-300'}`}>
      <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

export function SettingInput({ label, type = 'text', value, onChange, placeholder, suffix, hint, disabled, allowClipboard = false }) {
  const blockClipboard = type === 'password' && !allowClipboard

  return (
    <label className="block text-left">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">{label}</span>
      <div className="relative mt-2">
        <input
          type={type}
          value={value ?? ''}
          placeholder={placeholder}
          disabled={disabled}
          onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          className={`${fieldInputClass} ${suffix ? 'pr-12' : ''} ${disabled ? 'bg-gray-100 dark:bg-[#161825]/50 text-gray-500 cursor-not-allowed opacity-70' : ''}`}
          onCopy={blockClipboard  ? e => e.preventDefault() : undefined}
          onCut={blockClipboard   ? e => e.preventDefault() : undefined}
          onPaste={blockClipboard ? e => e.preventDefault() : undefined}
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
      <textarea
        rows={rows}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={`${fieldInputClass} mt-2 resize-y`}
      />
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
        onChange={e => onChange?.(e.target.value)}
        className={`${fieldInputClass} mt-2 ${disabled ? 'bg-gray-100 dark:bg-[#161825]/50 text-gray-500 cursor-not-allowed opacity-70' : ''}`}
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
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
  const fileInput      = useRef(null)
  const tAdmin         = useAdminText()
  const [uploading, setUploading] = useState(false)
  const hasSizeControls = typeof onWidthChange === 'function' && typeof onHeightChange === 'function'
  const isFavicon      = ['favicon', 'admin_favicon'].includes(uploadType)
  const previewWidth   = logoSizeValue(width,  isFavicon ? '56px'  : '260px')
  const previewHeight  = logoSizeValue(height, isFavicon ? '56px'  : '64px')

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
      onChange(assetUrl(data?.data?.url || data?.url))
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
      <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={tAdmin('image_url_placeholder')} className={fieldInputClass} />
      <p className="text-xs text-gray-400">{tAdmin('image_format_hint')}</p>
      {hasSizeControls && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SettingInput label={tAdmin('image_width')}  type="number" suffix="px" value={width}  onChange={onWidthChange} />
          <SettingInput label={tAdmin('image_height')} type="number" suffix="px" value={height} onChange={onHeightChange} />
        </div>
      )}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files[0]) }}
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
            src={assetUrl(value)} alt=""
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
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={e => handleUpload(e.target.files[0])} />
    </div>
  )
}
