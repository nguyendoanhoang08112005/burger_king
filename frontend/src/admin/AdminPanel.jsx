import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  BarChart2,
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Gift,
  Image,
  Info,
  MapPin,
  Layers,
  LayoutDashboard,
  Loader2,
  LogOut,
  Moon,
  Package,
  Pencil,
  Percent,
  Search,
  Save,
  Settings,
  ShoppingBag,
  Star,
  Store,
  Sun,
  Tags,
  Target,
  Trash2,
  Truck,
  Upload,
  Users,
  Utensils,
  Banknote,
  WalletCards,
  Palette,
  Globe,
  X,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import apiClient from '../api/axios'
import { useCrud } from '../hooks/useCrud'
import AdminTable from '../components/admin/AdminTable'
import AdminSearch from '../components/admin/AdminSearch'
import AdminPagination from '../components/admin/AdminPagination'
import StatusBadge from '../components/admin/StatusBadge'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useRefLang } from '../hooks/useRefLang'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store/authStore'
import { formatDate, formatVND } from '../utils/format'
import { initDarkMode, toggleDarkMode } from '../utils/darkMode'

const apiOrigin = (apiClient.defaults.baseURL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')

const assetUrl = value => {
  if (!value) return ''
  if (/^(https?:)?\/\//.test(value) || value.startsWith('data:') || value.startsWith('blob:')) return value
  return `${apiOrigin}${value.startsWith('/') ? value : `/${value}`}`
}

function useAdminText() {
  const { t } = useTranslation()

  return useCallback(
    (key, values = {}) => t(`adminPanel.${key}`, { ...values, defaultValue: key }),
    [t]
  )
}

const statusTabs = [
  { key: '' },
  { key: 'pending' },
  { key: 'confirmed' },
  { key: 'preparing' },
  { key: 'delivering' },
  { key: 'delivered' },
  { key: 'cancelled' },
]

const statusClasses = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300',
  preparing: 'bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300',
  delivering: 'bg-purple-100 text-purple-700 dark:bg-purple-400/15 dark:text-purple-300',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300',
}

const orderStatusFlow = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered']

const getAllowedOrderStatuses = status => {
  const transitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['delivering', 'cancelled'],
    delivering: ['delivered'],
    delivered: [],
    cancelled: [],
  }

  return transitions[status] || []
}

const orderStatusProgress = status => {
  if (status === 'cancelled') return -1
  return orderStatusFlow.indexOf(status)
}

const formatBadgeCount = value => {
  const count = Number.parseInt(Number(value || 0), 10)
  if (!Number.isFinite(count) || count <= 0) return null
  return count > 99 ? '99+' : String(count)
}

const menuGroups = [
  {
    labelKey: 'group_overview',
    items: [
      { icon: LayoutDashboard, labelKey: 'dashboard', path: '/admin' },
      { icon: BarChart2, labelKey: 'reports', path: '/admin/reports' },
    ],
  },
  {
    labelKey: 'group_menu',
    items: [
      { icon: Utensils, labelKey: 'products', path: '/admin/products' },
      { icon: Layers, labelKey: 'categories', path: '/admin/categories' },
      { icon: Gift, labelKey: 'combos', path: '/admin/combos' },
      { icon: Tags, labelKey: 'toppings', path: '/admin/toppings' },
    ],
  },
  {
    labelKey: 'group_sales',
    items: [
      { icon: Package, labelKey: 'orders', path: '/admin/orders', badgeKey: 'pendingOrders' },
      { icon: Percent, labelKey: 'coupons', path: '/admin/coupons' },
      { icon: CreditCard, labelKey: 'payments', path: '/admin/payments' },
    ],
  },
  {
    labelKey: 'group_customers',
    items: [
      { icon: Users, labelKey: 'users', path: '/admin/users' },
      { icon: Star, labelKey: 'reviews', path: '/admin/reviews' },
      { icon: Target, labelKey: 'loyalty', path: '/admin/loyalty' },
    ],
  },
  {
    labelKey: 'group_content',
    items: [
      { icon: FileText, labelKey: 'posts', path: '/admin/posts' },
      { icon: Image, labelKey: 'banners', path: '/admin/banners' },
      { icon: Building2, labelKey: 'branches', path: '/admin/branches' },
    ],
  },
  {
    labelKey: 'group_system',
    items: [
      { icon: Settings, labelKey: 'settings', path: '/admin/settings' },
      { icon: Globe, labelKey: 'languages', path: '/admin/translations/locales' },
      { icon: Bell, labelKey: 'notifications', path: '/admin/notifications', badgeKey: 'notificationsUnread' },
    ],
  },
]

function unwrap(response) {
  const body = response.data
  return body?.success ? body.data : body
}

function getMeta(response) {
  const body = response.data
  if (body?.meta) return body.meta
  if (body?.current_page) {
    return {
      current_page: body.current_page,
      last_page: body.last_page,
      total: body.total,
      per_page: body.per_page,
    }
  }
  return null
}

const unwrapNotifications = payload => (Array.isArray(payload) ? payload : payload?.data || [])

const notificationData = item => {
  if (!item?.data) return {}
  if (typeof item.data === 'string') {
    try {
      return JSON.parse(item.data)
    } catch {
      return {}
    }
  }
  return item.data
}

const notificationTitle = item => {
  const data = notificationData(item)
  return item?.title || data.title || data.message || item?.message || ''
}

const notificationBody = item => {
  const data = notificationData(item)
  return data.body || data.content || ''
}

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay])

  return debounced
}

function TableSkeleton({ rows = 5, cols = 6 }) {
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

function EmptyTableRow({ colSpan, message }) {
  const tAdmin = useAdminText()

  return (
    <tr>
      <td colSpan={colSpan} className="py-10 text-center text-sm text-gray-400">
        {message || tAdmin('no_data')}
      </td>
    </tr>
  )
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => start + index).filter(p => p <= totalPages)

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="p-2 rounded-lg disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map(p => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
            p === page ? 'bg-[#D62300] text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="p-2 rounded-lg disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }) {
  const tAdmin = useAdminText()
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div onMouseDown={event => event.stopPropagation()} className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-300 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#161825] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {tAdmin('cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {tAdmin('confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminSidebar({ collapsed, onToggle, badges }) {
  const tAdmin = useAdminText()

  return (
    <aside className={`fixed left-0 top-0 z-40 h-screen bg-white dark:bg-[#1E2130] border-r border-[#F0F0F0] dark:border-gray-700 shadow-[2px_0_8px_rgba(0,0,0,0.04)] transition-all duration-300 ${collapsed ? 'w-[70px]' : 'w-[260px]'}`}>
      <div className="h-[60px] flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        {!collapsed && (
          <Link to="/admin" className="text-[#D62300] font-bold text-lg tracking-wide">
            HAMBURGER KING
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors ml-auto"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="h-[calc(100vh-60px)] overflow-y-auto py-3">
        {menuGroups.map(group => (
          <div key={group.labelKey} className="mb-2">
            {!collapsed && (
              <p className="text-[10px] text-gray-400 uppercase tracking-[1px] px-5 pt-4 pb-1.5 font-semibold">
                {tAdmin(group.labelKey)}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon
                const badge = item.badgeKey ? formatBadgeCount(badges[item.badgeKey]) : null

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'}
                    title={collapsed ? tAdmin(item.labelKey) : undefined}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-150 group relative
                      ${collapsed ? 'justify-center' : ''}
                      ${isActive
                        ? 'bg-[#FFF5F5] dark:bg-red-500/10 text-[#D62300] font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-[#F9FAFB] dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white'
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={18} className={isActive ? 'text-[#D62300]' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-200'} />
                        {!collapsed && <span className="text-sm">{tAdmin(item.labelKey)}</span>}
                        {!!badge && !collapsed && (
                          <span className="ml-auto bg-[#D62300] text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

function AdminTopbar({ notifications = [], unreadCount = 0 }) {
  const { user, setLogout } = useAuthStore()
  const navigate = useNavigate()
  const tAdmin = useAdminText()
  const [isDark, setIsDark] = useState(() => localStorage.getItem('adminDarkMode') === 'dark')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationMenuRef = useRef(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(initDarkMode())
  }, [])

  const handleLogout = () => {
    setLogout()
    navigate('/login')
  }

  const handleToggle = () => {
    setIsDark(toggleDarkMode())
  }

  useEffect(() => {
    if (!notificationsOpen) return undefined

    const handlePointerDown = event => {
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [notificationsOpen])

  const recentNotifications = notifications.slice(0, 5)

  return (
    <header className="h-[60px] bg-white dark:bg-[#1E2130] border-b border-gray-100 dark:border-gray-700 flex items-center px-6 gap-4 sticky top-0 z-30">
      <div className="relative flex-1 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder={tAdmin('search')}
          className="w-full pl-9 pr-16 py-2 bg-gray-50 dark:bg-[#161825] rounded-xl text-sm border border-transparent focus:outline-none focus:border-red-200 dark:focus:border-red-500/50 focus:bg-white dark:focus:bg-[#1E2130] dark:text-gray-100 transition-all"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono">
          Ctrl+K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <LanguageSwitcher variant="compact" />
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
        >
          <ExternalLink size={14} />
          {tAdmin('view_site')}
        </a>
        <button
          id="darkModeToggle"
          type="button"
          onClick={handleToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <div ref={notificationMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(open => !open)}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors"
            aria-label={tAdmin('notifications')}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1E2130] shadow-xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{tAdmin('notifications_title')}</p>
                <span className="text-xs font-semibold text-gray-400">{unreadCount} {tAdmin('unread').toLowerCase()}</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                {recentNotifications.map(item => {
                  const title = notificationTitle(item)
                  const body = notificationBody(item)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(false)
                        navigate('/admin/notifications', { state: { notificationId: item.id } })
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!item.read_at ? 'bg-red-50/50 dark:bg-red-500/5' : ''}`}
                    >
                      <div className="flex gap-3">
                        <span className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${item.read_at ? 'bg-gray-300 dark:bg-gray-600' : 'bg-red-500'}`} />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{title || tAdmin('notifications')}</span>
                          {body && <span className="block text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{body}</span>}
                          <span className="block text-[11px] text-gray-400 mt-1">{formatDate(item.created_at)}</span>
                        </span>
                      </div>
                    </button>
                  )
                })}
                {!recentNotifications.length && (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">{tAdmin('no_notifications')}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(false)
                  navigate('/admin/notifications')
                }}
                className="w-full px-4 py-3 text-sm font-semibold text-[#D62300] hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700"
              >
                {tAdmin('notifications_title')}
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2.5 pl-2 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-[#D62300] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-400">{tAdmin('admin_role')}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ml-1"
            aria-label="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}

function AdminLayout({ children, badges, notifications, unreadNotifications }) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div className="admin-layout min-h-screen bg-[#F4F6F8] dark:bg-[#161825] text-gray-900 dark:text-gray-100">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} badges={badges} />
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${collapsed ? 'ml-[70px]' : 'ml-[260px]'}`}>
        <AdminTopbar notifications={notifications} unreadCount={unreadNotifications} />
        <main key={location.pathname} className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

function AdminPageShell({ title, eyebrow, action, onAction, children }) {
  const tAdmin = useAdminText()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400 font-medium">{eyebrow || tAdmin('admin_home')}</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        </div>
        {action && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#D62300] hover:bg-[#b51e00] text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {action}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function AdminDashboard({ stats, orders, chartData }) {
  const tAdmin = useAdminText()
  const cards = [
    { label: tAdmin('orders'), value: stats?.metrics?.pending_orders ?? 0, icon: ShoppingBag, gradient: 'from-[#00C9A7] to-[#00A67C]', badge: tAdmin('status_pending') },
    { label: tAdmin('products'), value: stats?.metrics?.total_products ?? 0, icon: Layers, gradient: 'from-[#4E9FFF] to-[#2979FF]' },
    { label: tAdmin('customers'), value: stats?.metrics?.active_customers ?? 0, icon: Users, gradient: 'from-[#FF6B9D] to-[#E91E8C]' },
    { label: tAdmin('revenue'), value: formatVND(stats?.metrics?.total_sales ?? 0), icon: BarChart2, gradient: 'from-[#FFB347] to-[#FF9500]' },
  ]

  const activities = orders.slice(0, 5).map(order => ({
    name: order.user?.name || tAdmin('customer_walkin'),
    role: order.user?.role === 'admin' ? tAdmin('admin_role') : tAdmin('customer'),
    action: tAdmin('activity_created_order', { code: order.order_code }),
    time: formatDate(order.created_at),
    ip: '127.0.0.1',
  }))

  return (
    <AdminPageShell title={tAdmin('dashboard')}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-6 text-white relative overflow-hidden`}>
              <div className="absolute right-4 top-4 opacity-20"><Icon size={48} /></div>
              <p className="text-sm font-medium opacity-80">{card.label}</p>
              <p className="text-3xl font-bold mt-1">{card.value}</p>
              {card.badge && <span className="mt-3 inline-block text-xs bg-white/20 rounded-full px-3 py-1">{card.badge}</span>}
            </div>
          )
        })}
      </div>

      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800 dark:text-gray-100">{tAdmin('last_7_days_revenue')}</h3>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="revenue" tick={{ fontSize: 12 }} tickFormatter={value => `${value / 1000}k`} />
            <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value, name) => [name === 'revenue' ? formatVND(value) : `${value} ${tAdmin('orders').toLowerCase()}`, name === 'revenue' ? tAdmin('revenue') : tAdmin('orders')]} />
            <Legend />
            <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#D62300" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} name="revenue" />
            <Line yAxisId="orders" type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} name="orders" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)] gap-6">
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">{tAdmin('recent_orders')}</h3>
          <OrdersTable orders={orders.slice(0, 5)} compact />
        </div>
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">{tAdmin('activity_log')}</h3>
          <div className="space-y-4">
            {activities.map((act, index) => (
              <div key={`${act.time}-${index}`} className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-[#D62300]/10 text-[#D62300] flex items-center justify-center font-bold flex-shrink-0">
                  {act.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-100">
                    <span className="font-semibold">{act.name}</span>{' '}
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${act.role === tAdmin('admin_role') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      {act.role}
                    </span>{' '}
                    {act.action}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{act.time} · {act.ip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPageShell>
  )
}

function OrdersTable({ orders, compact = false, onStatusChange, onView }) {
  const tAdmin = useAdminText()

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700">
            <th className="py-3">{tAdmin('order_code')}</th>
            <th className="py-3">{tAdmin('customer')}</th>
            <th className="py-3">{tAdmin('time')}</th>
            <th className="py-3">{tAdmin('total_amount')}</th>
            <th className="py-3">{tAdmin('status')}</th>
            {!compact && <th className="py-3 text-right">{tAdmin('actions')}</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {orders.map(order => (
            <tr key={order.id} className="text-gray-700 dark:text-gray-200">
              <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">{order.order_code}</td>
              <td className="py-3">{order.user?.name || tAdmin('customer_walkin')}</td>
              <td className="py-3 text-gray-500 dark:text-gray-400">{formatDate(order.created_at)}</td>
              <td className="py-3 font-semibold">{formatVND(order.total)}</td>
              <td className="py-3">
                {onStatusChange ? (
                  <OrderStatusControl order={order} onChange={onStatusChange} />
                ) : (
                  <OrderStatusBadge status={order.status} />
                )}
              </td>
              {!compact && (
                <td className="py-3 text-right">
                  <button type="button" onClick={() => onView?.(order)} className="inline-flex items-center gap-1 text-[#D62300] text-xs font-semibold hover:underline">
                    <Eye size={14} />
                    {tAdmin('view')}
                  </button>
                </td>
              )}
            </tr>
          ))}
          {!orders.length && <EmptyTableRow colSpan={compact ? 5 : 6} />}
        </tbody>
      </table>
    </div>
  )
}

function OrderStatusBadge({ status }) {
  const tAdmin = useAdminText()
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusClasses[status] || statusClasses.pending}`}>
      {tAdmin(`status_${status}`)}
    </span>
  )
}

function OrderStatusTimeline({ status }) {
  const tAdmin = useAdminText()
  const progress = orderStatusProgress(status)
  const isCancelled = status === 'cancelled'

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {orderStatusFlow.slice(0, -1).map((step, index) => {
          const reached = progress >= index
          return (
            <div key={step} className="min-w-0">
              <div className={`h-1.5 rounded-full ${reached ? 'bg-[#D62300]' : 'bg-gray-200 dark:bg-gray-700'}`} />
              <p className={`mt-1 text-[10px] font-semibold truncate ${reached ? 'text-[#D62300]' : 'text-gray-400'}`}>{tAdmin(`status_${step}`)}</p>
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <OrderStatusBadge status={status} />
        {isCancelled && <span className="text-xs text-gray-400">{tAdmin('order_cancelled_terminal')}</span>}
        {status === 'delivered' && <span className="text-xs text-gray-400">{tAdmin('order_completed_terminal')}</span>}
      </div>
    </div>
  )
}

function OrderStatusControl({ order, onChange }) {
  const tAdmin = useAdminText()
  const allowedStatuses = getAllowedOrderStatuses(order.status)
  const terminal = allowedStatuses.length === 0

  if (terminal) {
    return (
      <div className="space-y-1.5">
        <OrderStatusBadge status={order.status} />
        <p className="text-[11px] text-gray-400">{order.status === 'delivered' ? tAdmin('order_completed_terminal') : tAdmin('order_cancelled_terminal')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <OrderStatusBadge status={order.status} />
      <ChevronRight size={14} className="text-gray-300" />
      {allowedStatuses.map(status => (
        <button
          key={status}
          type="button"
          onClick={() => onChange?.(order.id, status)}
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
            status === 'cancelled'
              ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10'
              : 'border-[#D62300]/20 text-[#D62300] hover:bg-red-50 dark:hover:bg-red-500/10'
          }`}
        >
          {tAdmin(`status_${status}`)}
        </button>
      ))}
    </div>
  )
}

function OrderDetailModal({ order, onClose, onStatusChange }) {
  const tAdmin = useAdminText()
  if (!order) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div onMouseDown={event => event.stopPropagation()} className="bg-white dark:bg-[#1E2130] rounded-2xl max-w-3xl w-full max-h-[88vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-400">{tAdmin('order_detail')}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{order.order_code}</h2>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors">
            <X size={16} />
            {tAdmin('close')}
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-3">{tAdmin('products')}</h3>
            <div className="space-y-3">
              {(order.items || []).map(item => (
                <div key={item.id} className="flex justify-between gap-4 text-sm border-b border-gray-100 dark:border-gray-700 pb-3">
                  <div>
                    <p className="font-semibold">{item.product_name}</p>
                    <p className="text-xs text-gray-400">{item.product_sku || '-'}{item.size_sku ? ` / ${item.size_sku}` : ''}</p>
                    <p className="text-gray-500">{tAdmin('quantity')}: {item.quantity}</p>
                    {!!item.toppings?.length && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.toppings.map(topping => (
                          <span key={`${topping.id}-${topping.sku || topping.name}`} className="rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-[11px] text-gray-500 dark:text-gray-300">
                            {topping.name}{topping.sku ? ` (${topping.sku})` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="font-semibold">{formatVND(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <h3 className="font-bold mb-3">{tAdmin('delivery')}</h3>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <p>{order.address?.name || order.user?.name}</p>
                <p>{order.address?.phone}</p>
                <p>{order.address?.full_address || order.address?.address}</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-3">{tAdmin('payment')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>{tAdmin('subtotal')}</span><span>{formatVND(order.subtotal)}</span></div>
                <div className="flex justify-between"><span>{tAdmin('discount')}</span><span>-{formatVND(order.discount || 0)}</span></div>
                <div className="flex justify-between"><span>{tAdmin('shipping_fee')}</span><span>{formatVND(order.shipping_fee || 0)}</span></div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100 dark:border-gray-700"><span>{tAdmin('total_amount')}</span><span>{formatVND(order.total)}</span></div>
                <p className="text-gray-500">{tAdmin('payment_method')}: {order.payment_method}</p>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="font-bold">{tAdmin('timeline')}</h3>
                {onStatusChange && <OrderStatusControl order={order} onChange={onStatusChange} />}
              </div>
              <OrderStatusTimeline status={order.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminOrdersPage({ orders, counts, loading, meta, filters, setFilters, onStatusChange, onPageChange }) {
  const tAdmin = useAdminText()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const formatCount = value => Number.parseInt(Number(value || 0), 10)
  const handleStatusChange = async (orderId, status) => {
    const updatedOrder = await onStatusChange(orderId, status)
    if (updatedOrder && selectedOrder?.id === orderId) {
      setSelectedOrder(updatedOrder)
    }
  }

  return (
    <AdminPageShell title={tAdmin('orders')} action={tAdmin('export_csv')}>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map(tab => (
            <button
              key={tab.key || 'all'}
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, status: tab.key, page: 1 }))}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filters.status === tab.key ? 'bg-[#D62300] text-white' : 'bg-gray-50 dark:bg-[#161825] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.key ? tAdmin(`status_${tab.key}`) : tAdmin('all')} <span className="opacity-70">({formatCount(tab.key ? counts[tab.key] : counts.total)})</span>
            </button>
          ))}
        </div>
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={filters.search}
            onChange={event => setFilters(prev => ({ ...prev, search: event.target.value, page: 1 }))}
            placeholder={tAdmin('search_orders')}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </div>
        {loading ? <TableSkeleton rows={6} cols={6} /> : <OrdersTable orders={orders} onStatusChange={handleStatusChange} onView={setSelectedOrder} />}
        <div className="flex justify-end">
          <Pagination page={meta.current_page} totalPages={meta.last_page} onChange={onPageChange} />
        </div>
      </div>
      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={handleStatusChange} />
    </AdminPageShell>
  )
}

function AdminProductsPage({ products, categories, loading, meta, filters, setFilters, onToggleFlag, onDelete, onPageChange }) {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const tableLocale = i18n.language?.startsWith('en') ? 'en' : 'vi'
  const tAdmin = useAdminText()

  return (
    <AdminPageShell title={tAdmin('products')} action={tAdmin('add_product')} onAction={() => navigate('/admin/products/create')}>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 min-w-[260px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.search}
              onChange={event => setFilters(prev => ({ ...prev, search: event.target.value, page: 1 }))}
              placeholder={tAdmin('search_products')}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </div>
          <select
            value={filters.categoryId}
            onChange={event => setFilters(prev => ({ ...prev, categoryId: event.target.value, page: 1 }))}
            className="flex-1 min-w-[220px] border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm"
          >
            <option value="">{tAdmin('all_categories')}</option>
            {categories.map(category => {
              const catName = category.name && typeof category.name === 'object' ? (category.name[tableLocale] || category.name.vi) : category.name
              return <option key={category.id} value={category.id}>{catName}</option>
            })}
          </select>
          <select
            value={filters.available}
            onChange={event => setFilters(prev => ({ ...prev, available: event.target.value, page: 1 }))}
            className="flex-1 min-w-[180px] border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm"
          >
            <option value="">{tAdmin('all_statuses')}</option>
            <option value="true">{tAdmin('available')}</option>
            <option value="false">{tAdmin('unavailable')}</option>
          </select>
          <button
            type="button"
            onClick={() => setFilters({ search: '', categoryId: '', available: '', page: 1 })}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            {tAdmin('reset')}
          </button>

        </div>

        {loading ? <TableSkeleton rows={6} cols={7} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="py-3">{tAdmin('product')}</th>
                  <th className="py-3">{tAdmin('category')}</th>
                  <th className="py-3">{tAdmin('base_price')}</th>
                  <th className="py-3">{tAdmin('sale_price')}</th>
                  <th className="py-3">{tAdmin('featured')}</th>
                  <th className="py-3">{tAdmin('status')}</th>
                  <th className="py-3 text-center">
                    <img src="/flags/vn.svg" alt="Vietnamese" className="mx-auto h-5 w-7 rounded-sm object-cover shadow-sm" />
                  </th>
                  <th className="py-3 text-center">
                    <img src="/flags/us.svg" alt="English" className="mx-auto h-5 w-7 rounded-sm object-cover shadow-sm" />
                  </th>
                  <th className="py-3 text-right">{tAdmin('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {products.map(product => {
                  const productName = product.name && typeof product.name === 'object' ? (product.name[tableLocale] || product.name.vi) : product.name
                  const categoryName = product.category?.name && typeof product.category.name === 'object' ? (product.category.name[tableLocale] || product.category.name.vi) : product.category?.name
                  const missingEn = tableLocale === 'en' && (!product.translations?.name?.en)

                  return (
                    <tr key={product.id} className="text-gray-700 dark:text-gray-200">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img src={assetUrl(product.thumbnail)} alt={productName} className="w-11 h-11 object-cover rounded-lg bg-gray-100" />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{productName}</p>
                            <p className="text-xs text-gray-400">{product.sku || product.slug}</p>
                            {missingEn && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 mt-0.5 font-medium">
                                <span>⚠️</span>
                                <span>{tAdmin('no_en_translation')}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">{categoryName || 'N/A'}</td>
                      <td className="py-3">{formatVND(product.base_price)}</td>
                      <td className="py-3 text-[#D62300] font-semibold">{product.sale_price ? formatVND(product.sale_price) : '-'}</td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => onToggleFlag(product.id, 'is_featured', product.is_featured)}
                          className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${product.is_featured ? 'bg-[#D62300]' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${product.is_featured ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => onToggleFlag(product.id, 'is_available', product.is_available)}
                          className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${product.is_available ? 'bg-green-500' : 'bg-gray-300'}`}
                          aria-label="Toggle available"
                        >
                          <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${product.is_available ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                          title={tAdmin('edit_vi')}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
                          aria-label={tAdmin('edit_vi')}
                        >
                          <Pencil size={15} />
                        </button>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/products/${product.id}/edit?ref_lang=en`)}
                          title={tAdmin('edit_en')}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors cursor-pointer"
                          aria-label={tAdmin('edit_en')}
                        >
                          <Pencil size={15} />
                        </button>
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button type="button" onClick={() => onDelete(product)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 cursor-pointer"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {!products.length && <EmptyTableRow colSpan={9} />}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end">
          <Pagination page={meta.current_page} totalPages={meta.last_page} onChange={onPageChange} />
        </div>
      </div>
    </AdminPageShell>
  )
}

function AdminImageInput({ label, value, onChange }) {
  const fileInput = useRef(null)
  const tAdmin = useAdminText()

  const handleUpload = async file => {
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)
    const { data } = await apiClient.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    onChange(assetUrl(data?.data?.url || data?.url))
    toast.success(tAdmin('upload_success'))
  }

  return (
    <div className="bg-white dark:bg-[#1E2130] rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">{label || tAdmin('image')}</h3>
      <input
        value={value || ''}
        onChange={event => onChange(event.target.value)}
        placeholder={tAdmin('image_url_placeholder')}
        className={fieldInputClass}
      />
      <div
        onDragOver={event => event.preventDefault()}
        onDrop={event => {
          event.preventDefault()
          handleUpload(event.dataTransfer.files[0])
        }}
        onClick={() => fileInput.current?.click()}
        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl min-h-[170px] p-8 text-center hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-500/10 transition-all cursor-pointer flex items-center justify-center"
      >
        {value ? (
          <img src={assetUrl(value)} alt="" className="max-h-44 mx-auto rounded-lg object-cover" />
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

function AdminProductFormPage({ categories, itemId }) {
  const params = useParams()
  const id = itemId ?? params.id
  const isCreate = !id
  const navigate = useNavigate()
  const { refLang, currentLocale, isDefault, LOCALES } = useRefLang()
  const tAdmin = useAdminText()

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  // Translatable fields
  const [translations, setTranslations] = useState({
    name: { vi: '', en: '' },
    description: { vi: '', en: '' },
    short_description: { vi: '', en: '' },
  })

  // Shared non-translatable fields
  const [fields, setFields] = useState({
    category_id: '',
    slug: '',
    sku: '',
    base_price: '',
    sale_price: '',
    thumbnail: '',
    is_featured: false,
    is_available: true,
    sort_order: 0,
    sizes: [
      { size: 'S', sku: '', extra_price: 0, is_available: true },
      { size: 'M', sku: '', extra_price: 15000, is_available: true },
      { size: 'L', sku: '', extra_price: 30000, is_available: true },
    ],
  })

  // Fetch product data if edit mode
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true)
      try {
        const res = await apiClient.get(`/admin/products/${id}`)
        const p = res.data.data
        setTranslations(p.translations || {
          name: { vi: '', en: '' },
          description: { vi: '', en: '' },
          short_description: { vi: '', en: '' },
        })
        setFields({
          category_id: p.category_id || '',
          slug: p.slug || '',
          sku: p.sku || '',
          base_price: p.base_price || '',
          sale_price: p.sale_price || '',
          thumbnail: p.thumbnail || '',
          is_featured: !!p.is_featured,
          is_available: p.is_available ?? true,
          sort_order: p.sort_order || 0,
          sizes: p.sizes?.length ? p.sizes : [
            { size: 'S', sku: '', extra_price: 0, is_available: true },
            { size: 'M', sku: '', extra_price: 15000, is_available: true },
            { size: 'L', sku: '', extra_price: 30000, is_available: true },
          ],
        })
      } catch {
        toast.error(tAdmin('product_not_found'))
      } finally {
        setLoading(false)
      }
    }

    if (!isCreate && id) {
      loadProduct()
    }
  }, [id, isCreate, tAdmin])

  const updateTranslation = (field, value) => {
    setTranslations(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [refLang]: value
      }
    }))
    if (field === 'name' && refLang === 'vi' && isCreate) {
      setFields(prev => ({
        ...prev,
        slug: slugify(value),
        sku: prev.sku || skuify('PRD', value),
      }))
    }
  }

  const updateField = (key, value) => {
    setFields(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'name' && isCreate) {
        const nameVal = typeof value === 'object' ? (value?.vi || '') : value
        next.slug = slugify(nameVal)
      }
      return next
    })
  }

  const handleSave = async (andContinue = false) => {
    if (!translations.name.vi?.trim()) {
      toast.error(tAdmin('product_name_required'))
      return
    }
    setSaving(true)
    try {
      const payload = { ...fields, translations }
      let savedId = id
      
      if (isCreate) {
        const res = await apiClient.post('/admin/products', payload)
        savedId = res.data.data.id
        toast.success(tAdmin('product_created'))
      } else {
        await apiClient.put(`/admin/products/${id}`, payload)
        toast.success(tAdmin('saved_bang'))
      }

      if (andContinue) {
        if (isCreate) {
          navigate(`/admin/products/${savedId}/edit?ref_lang=${refLang}`)
        }
      } else {
        navigate('/admin/products')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || tAdmin('generic_error'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#D62300]" size={28} /></div>
  }

  const inputClass = 'w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:text-gray-400'

  return (
    <AdminPageShell title={isCreate ? tAdmin('add_product_title') : tAdmin('edit_product_title')} action={tAdmin('back')} onAction={() => navigate('/admin/products')}>
      {/* Warning Banner */}
      {!isDefault && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5">
          <Info size={16} className="text-blue-500 flex-shrink-0 animate-bounce" />
          <p className="text-sm text-blue-700">
            {tAdmin('editing_locale_notice', { locale: currentLocale.label })}
          </p>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start">
        {/* Left Form */}
        <div className="space-y-5 bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {tAdmin('product_name')} {isDefault && <span className="text-red-500">*</span>}
            </label>
            <input
              value={translations.name?.[refLang] || ''}
              onChange={e => updateTranslation('name', e.target.value)}
              placeholder={tAdmin('enter_product_name')}
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-xl px-3 py-2.5 text-sm mt-1.5 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
            {!isDefault && translations.name?.vi && (
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                <span>🇻🇳 {tAdmin('original_vi')}</span>
                <span className="font-medium">{translations.name.vi}</span>
              </p>
            )}
          </div>

          {/* Slug (only edit on default vi) */}
          {isDefault && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</label>
              <input
                value={fields.slug}
                onChange={e => updateField('slug', e.target.value)}
                placeholder="slug..."
                className={inputClass}
              />
            </div>
          )}

          {isDefault && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin('sku')}</label>
              <input
                value={fields.sku}
                onChange={e => updateField('sku', e.target.value.toUpperCase())}
                placeholder="PRD-WHOPPER"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-400">{tAdmin('sku_auto_hint')}</p>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin('category')}</label>
            <select
              disabled={!isDefault}
              value={fields.category_id}
              onChange={e => updateField('category_id', e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-xl px-3 py-2.5 text-sm mt-1.5 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-60"
            >
              <option value="">{tAdmin('select_category')}</option>
              {categories.map(category => {
                const catName = category.name && typeof category.name === 'object' ? (category.name.vi || '') : category.name
                return <option key={category.id} value={category.id}>{catName}</option>
              })}
            </select>
          </div>

          {/* Short description */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin('short_description')}</label>
            <textarea
              value={translations.short_description?.[refLang] || ''}
              onChange={e => updateTranslation('short_description', e.target.value)}
              placeholder={tAdmin('enter_short_description')}
              rows={2}
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-xl px-3 py-2.5 text-sm mt-1.5 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
            {!isDefault && translations.short_description?.vi && (
              <p className="text-xs text-gray-400 mt-1 flex items-start gap-1.5">
                <span className="flex-shrink-0">🇻🇳 {tAdmin('original_vi')}</span>
                <span>{translations.short_description.vi}</span>
              </p>
            )}
          </div>

          {/* Detailed description */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin('detailed_description')}</label>
            <textarea
              value={translations.description?.[refLang] || ''}
              onChange={e => updateTranslation('description', e.target.value)}
              placeholder={tAdmin('enter_detailed_description')}
              rows={6}
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-xl px-3 py-2.5 text-sm mt-1.5 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
            {!isDefault && translations.description?.vi && (
              <details className="mt-1">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 outline-none">🇻🇳 {tAdmin('view_original_vi')}</summary>
                <p className="text-xs text-gray-400 mt-1 bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  {translations.description.vi}
                </p>
              </details>
            )}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin('base_price')}</label>
              <input
                disabled={!isDefault}
                type="number"
                value={fields.base_price}
                onChange={e => updateField('base_price', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin('sale_price')}</label>
              <input
                disabled={!isDefault}
                type="number"
                value={fields.sale_price || ''}
                onChange={e => updateField('sale_price', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Sorting */}
          {isDefault && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin('sort_order')}</label>
              <input
                type="number"
                value={fields.sort_order}
                onChange={e => updateField('sort_order', Number(e.target.value))}
                className={inputClass}
              />
            </div>
          )}

          {/* Sizes (shared - disabled in EN) */}
          <div className={`border border-gray-100 dark:border-gray-700 rounded-xl p-4 space-y-3 ${!isDefault ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">{tAdmin('sizes')}</h3>
              {isDefault && (
                <button
                  type="button"
                  onClick={() => updateField('sizes', [...fields.sizes, { size: 'XL', sku: fields.sku ? `${fields.sku}-XL` : '', extra_price: 0, is_available: true }])}
                  className="text-xs font-semibold text-[#D62300] cursor-pointer"
                >
                  {tAdmin('add_size')}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400">{tAdmin('sku_auto_hint')}</p>
            {fields.sizes.map((size, index) => (
              <div key={index} className="grid grid-cols-[80px_minmax(160px,1fr)_110px_90px_40px] gap-2">
                <select
                  disabled={!isDefault}
                  value={size.size}
                  onChange={e => updateField('sizes', fields.sizes.map((row, i) => i === index ? { ...row, size: e.target.value, sku: row.sku || (fields.sku ? `${fields.sku}-${e.target.value}` : '') } : row))}
                  className={inputClass}
                >
                  {['S', 'M', 'L', 'XL'].map(option => <option key={option} value={option}>{option}</option>)}
                </select>
                <input
                  disabled={!isDefault}
                  value={size.sku || ''}
                  onChange={e => updateField('sizes', fields.sizes.map((row, i) => i === index ? { ...row, sku: e.target.value.toUpperCase() } : row))}
                  placeholder={tAdmin('sku')}
                  className={inputClass}
                />
                <input
                  disabled={!isDefault}
                  type="number"
                  value={size.extra_price}
                  onChange={e => updateField('sizes', fields.sizes.map((row, i) => i === index ? { ...row, extra_price: Number(e.target.value) } : row))}
                  className={inputClass}
                />
                <label className="flex items-center gap-2 text-xs">
                  <input
                    disabled={!isDefault}
                    type="checkbox"
                    checked={!!size.is_available}
                    onChange={e => updateField('sizes', fields.sizes.map((row, i) => i === index ? { ...row, is_available: e.target.checked } : row))}
                  />
                  {tAdmin('available')}
                </label>
                {isDefault && (
                  <button
                    type="button"
                    onClick={() => updateField('sizes', fields.sizes.filter((_, i) => i !== index))}
                    className="text-red-500 font-semibold cursor-pointer"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Publish card */}
          <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{tAdmin('publish')}</h4>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {tAdmin('save_continue')}
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="w-full py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              {tAdmin('save')}
            </button>
          </div>

          {/* Language card */}
          <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{tAdmin('language')}</h4>
            <div className="space-y-1">
              {LOCALES.map(locale => {
                const isActive = locale.code === refLang
                const hasTranslation = locale.code === 'vi' || !!translations.name?.[locale.code]

                const editUrl = isCreate
                  ? `/admin/products/create${locale.code !== 'vi' ? `?ref_lang=${locale.code}` : ''}`
                  : locale.code === 'vi'
                    ? `/admin/products/${id}/edit`
                    : `/admin/products/${id}/edit?ref_lang=${locale.code}`

                return (
                  <Link
                    key={locale.code}
                    to={editUrl}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? 'bg-red-50 dark:bg-red-500/10 text-[#D62300] font-semibold scale-[1.02]'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{locale.flag}</span>
                      <span>{locale.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${hasTranslation ? 'bg-green-400' : 'bg-gray-300'}`} />
                      {isActive && <ExternalLink size={12} className="text-gray-400" />}
                    </div>
                  </Link>
                )
              })}
            </div>
            <p className="text-[10px] text-gray-400">
              🟢 {tAdmin('translated')} &nbsp; ⚪ {tAdmin('not_translated')}
            </p>
          </div>

          {/* Options card (only edit on default locale) */}
          {isDefault && (
            <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-4 shadow-sm space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{tAdmin('options')}</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{tAdmin('featured')}</label>
                  <button
                    type="button"
                    onClick={() => updateField('is_featured', !fields.is_featured)}
                    className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${fields.is_featured ? 'bg-[#D62300]' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${fields.is_featured ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{tAdmin('available')}</label>
                  <button
                    type="button"
                    onClick={() => updateField('is_available', !fields.is_available)}
                    className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${fields.is_available ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${fields.is_available ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Image card (only edit on default locale) */}
          <div className={`${!isDefault ? 'opacity-60' : ''}`}>
            <AdminImageInput
              label={tAdmin('product_image')}
              value={fields.thumbnail}
              onChange={value => {
                if (isDefault) updateField('thumbnail', value)
              }}
            />
          </div>
        </div>
      </div>
    </AdminPageShell>
  )
}

function AdminCouponsPage({ coupons, loading, onRefresh }) {
  const tAdmin = useAdminText()
  const emptyForm = { code: '', type: 'percent', value: '', min_order: 0, max_discount: '', usage_limit: '', starts_at: '', expires_at: '', is_active: true }
  const [form, setForm] = useState(emptyForm)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [confirm, setConfirm] = useState({ open: false })
  const [confirmLoading, setConfirmLoading] = useState(false)

  const filteredCoupons = coupons.filter(coupon => {
    const matchSearch = [coupon.code, coupon.type].join(' ').toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || (statusFilter === 'active' ? coupon.is_active : !coupon.is_active)
    return matchSearch && matchStatus
  })

  const dateInput = value => value ? String(value).slice(0, 10) : ''
  const resetForm = () => {
    setForm(emptyForm)
    setEditingCoupon(null)
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    setForm(prev => ({ ...prev, code: Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('') }))
  }

  const editCoupon = coupon => {
    setEditingCoupon(coupon)
    setForm({
      code: coupon.code || '',
      type: coupon.type || 'percent',
      value: coupon.value ?? '',
      min_order: coupon.min_order ?? 0,
      max_discount: coupon.max_discount ?? '',
      usage_limit: coupon.usage_limit ?? '',
      starts_at: dateInput(coupon.starts_at),
      expires_at: dateInput(coupon.expires_at),
      is_active: coupon.is_active ?? true,
    })
  }

  const payload = () => ({
    ...form,
    code: form.code.trim().toUpperCase(),
    value: Number(form.value || 0),
    min_order: Number(form.min_order || 0),
    max_discount: form.type === 'percent' && form.max_discount !== '' ? Number(form.max_discount) : null,
    usage_limit: form.usage_limit !== '' ? Number(form.usage_limit) : null,
    starts_at: form.starts_at || null,
    expires_at: form.expires_at || null,
    is_active: !!form.is_active,
  })

  const submit = async event => {
    event.preventDefault()
    setSaving(true)
    try {
      if (editingCoupon) {
        await apiClient.put(`/admin/coupons/${editingCoupon.id}`, payload())
        toast.success(tAdmin('coupon_updated'))
      } else {
        await apiClient.post('/admin/coupons', payload())
        toast.success(tAdmin('coupon_created'))
      }
      resetForm()
      await onRefresh()
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('coupon_save_error'))
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async coupon => {
    try {
      await apiClient.put(`/admin/coupons/${coupon.id}`, { ...coupon, is_active: !coupon.is_active })
      toast.success(coupon.is_active ? tAdmin('coupon_disabled') : tAdmin('coupon_enabled'))
      await onRefresh()
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('update_error'))
    }
  }

  const deleteCoupon = coupon => {
    setConfirm({
      open: true,
      title: tAdmin('delete_coupon_title'),
      message: tAdmin('delete_coupon_message', { code: coupon.code }),
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          await apiClient.delete(`/admin/coupons/${coupon.id}`)
          toast.success(tAdmin('coupon_deleted'))
          if (editingCoupon?.id === coupon.id) resetForm()
          setConfirm({ open: false })
          await onRefresh()
        } finally {
          setConfirmLoading(false)
        }
      },
    })
  }

  const inputClass = 'w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm'

  return (
    <AdminPageShell title={tAdmin('coupons_title')}>
      <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6">
        <form onSubmit={submit} className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">{editingCoupon ? tAdmin('edit_coupon') : tAdmin('add_coupon')}</h3>
            {editingCoupon && <button type="button" onClick={resetForm} className="text-xs font-semibold text-gray-500 hover:text-[#D62300]">{tAdmin('cancel_edit')}</button>}
          </div>
          <div className="flex gap-2">
            <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CODE" className={inputClass} />
            <button type="button" onClick={generateCode} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-semibold">{tAdmin('random')}</button>
          </div>
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputClass}>
            <option value="percent">{tAdmin('percent')}</option>
            <option value="fixed">{tAdmin('fixed')}</option>
            <option value="free_ship">{tAdmin('free_ship')}</option>
          </select>
          <input required type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder={tAdmin('value')} className={inputClass} />
          <input type="number" value={form.min_order} onChange={e => setForm({ ...form, min_order: e.target.value })} placeholder={tAdmin('min_order')} className={inputClass} />
          {form.type === 'percent' && <input type="number" value={form.max_discount} onChange={e => setForm({ ...form, max_discount: e.target.value })} placeholder={tAdmin('max_discount')} className={inputClass} />}
          <input type="number" value={form.usage_limit} onChange={e => setForm({ ...form, usage_limit: e.target.value })} placeholder={tAdmin('usage_limit')} className={inputClass} />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })} className={inputClass} />
            <input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} className={inputClass} />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> {tAdmin('active')}</label>
          <button disabled={saving} className="w-full bg-[#D62300] text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {editingCoupon ? tAdmin('update_coupon') : tAdmin('save_coupon')}
          </button>
        </form>
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm overflow-x-auto">
          <div className="flex flex-col md:flex-row gap-3 mb-5">
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder={tAdmin('search_coupons')} className={inputClass} />
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className={inputClass}>
              <option value="">{tAdmin('all_statuses')}</option>
              <option value="active">{tAdmin('active')}</option>
              <option value="inactive">{tAdmin('inactive')}</option>
            </select>
          </div>
          {loading ? <TableSkeleton rows={6} cols={8} /> : (
            <table className="w-full text-left text-sm">
              <thead><tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="py-3">Code</th><th>{tAdmin('type')}</th><th>{tAdmin('value')}</th><th>{tAdmin('min_order')}</th><th>{tAdmin('used_limit')}</th><th>{tAdmin('expires')}</th><th>{tAdmin('status')}</th><th>{tAdmin('actions')}</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredCoupons.map(coupon => (
                  <tr key={coupon.id}>
                    <td className="py-3 font-bold text-[#D62300]">{coupon.code}</td>
                    <td>{coupon.type}</td>
                    <td>{coupon.type === 'percent' ? `${Number(coupon.value).toFixed(2)}%` : formatVND(coupon.value)}</td>
                    <td>{formatVND(coupon.min_order)}</td>
                    <td>{coupon.used_count || 0}/{coupon.usage_limit || '∞'}</td>
                    <td>{coupon.expires_at ? formatDate(coupon.expires_at) : '-'}</td>
                    <td>
                      <button type="button" onClick={() => toggleActive(coupon)} className={`text-xs px-2 py-1 rounded-full ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {coupon.is_active ? tAdmin('active') : tAdmin('inactive')}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => editCoupon(coupon)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500" aria-label={tAdmin('edit_coupon')}><Pencil size={15} /></button>
                        <button type="button" onClick={() => deleteCoupon(coupon)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500" aria-label={tAdmin('delete_language')}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filteredCoupons.length && <EmptyTableRow colSpan={8} />}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <ConfirmDialog open={confirm.open} title={confirm.title} message={confirm.message} onCancel={() => setConfirm({ open: false })} onConfirm={confirm.onConfirm} loading={confirmLoading} />
    </AdminPageShell>
  )
}

function AdminUsersPage({ users, loading }) {
  const tAdmin = useAdminText()
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')
  const filtered = users.filter(user => (!role || user.role === role) && [user.name, user.email, user.phone].join(' ').toLowerCase().includes(search.toLowerCase()))

  return (
    <AdminPageShell title={tAdmin('users_title')}>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={tAdmin('search_users')} className="border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm" />
          <select value={role} onChange={e => setRole(e.target.value)} className="border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm">
            <option value="">{tAdmin('all_roles')}</option><option value="customer">{tAdmin('customer')}</option><option value="admin">Admin</option><option value="staff">{tAdmin('staff')}</option>
          </select>
        </div>
        {loading ? <TableSkeleton rows={6} cols={8} /> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead><tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700"><th className="py-3">{tAdmin('avatar')}</th><th>{tAdmin('name')}</th><th>{tAdmin('email')}</th><th>{tAdmin('phone')}</th><th>{tAdmin('role')}</th><th>{tAdmin('orders_count')}</th><th>{tAdmin('points')}</th><th>{tAdmin('created_at')}</th></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">{filtered.map(user => (
              <tr key={user.id}><td className="py-3"><div className="w-9 h-9 rounded-full bg-[#D62300] text-white flex items-center justify-center font-bold">{user.name?.charAt(0)}</div></td><td className="font-semibold">{user.name}</td><td>{user.email}</td><td>{user.phone || '-'}</td><td><span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{user.role}</span></td><td>{user.orders_count || 0}</td><td>{user.loyalty_balance || 0}</td><td>{formatDate(user.created_at)}</td></tr>
            ))}
            {!filtered.length && <EmptyTableRow colSpan={8} />}
            </tbody>
          </table></div>
        )}
      </div>
    </AdminPageShell>
  )
}

function AdminReviewsPage({ reviews, loading, onModerate }) {
  const tAdmin = useAdminText()
  const [filter, setFilter] = useState('')
  const filtered = reviews.filter(review => filter === '' || (filter === 'approved' ? review.is_approved : !review.is_approved))

  return (
    <AdminPageShell title={tAdmin('reviews_title')}>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex gap-2">
          {[['', 'all'], ['pending', 'pending_review'], ['approved', 'approved']].map(([key, label]) => (
            <button key={key} type="button" onClick={() => setFilter(key)} className={`px-3 py-2 rounded-lg text-xs font-semibold ${filter === key ? 'bg-[#D62300] text-white' : 'bg-gray-50 dark:bg-[#161825]'}`}>{tAdmin(label)}</button>
          ))}
        </div>
        {loading ? <TableSkeleton rows={6} cols={7} /> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead><tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700"><th className="py-3">{tAdmin('product')}</th><th>{tAdmin('customer')}</th><th>{tAdmin('rating')}</th><th>{tAdmin('content')}</th><th>{tAdmin('status')}</th><th>{tAdmin('date')}</th><th>{tAdmin('actions')}</th></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">{filtered.map(review => (
              <tr key={review.id}><td className="py-3 font-semibold">{review.product?.name}</td><td>{review.user?.name}</td><td className="text-yellow-500">{'★'.repeat(review.rating)}</td><td className="max-w-xs truncate">{review.comment}</td><td>{review.is_approved ? tAdmin('approved') : tAdmin('pending_review')}</td><td>{formatDate(review.created_at)}</td><td><div className="flex gap-2"><button onClick={() => onModerate(review.id, 'approve')} className="text-green-600 text-xs">{tAdmin('approve')}</button><button onClick={() => onModerate(review.id, 'hide')} className="text-orange-600 text-xs">{tAdmin('hide')}</button><button onClick={() => onModerate(review.id, 'delete')} className="text-red-600 text-xs">{tAdmin('delete')}</button></div></td></tr>
            ))}
            {!filtered.length && <EmptyTableRow colSpan={7} />}
            </tbody>
          </table></div>
        )}
      </div>
    </AdminPageShell>
  )
}

function AdminReportsPage({ stats, chartData, reportData }) {
  const tAdmin = useAdminText()
  const topProducts = reportData.topProducts || stats?.top_products || []
  const topCustomers = reportData.topCustomers || []
  const statusData = statusTabs
    .filter(tab => tab.key)
    .map(tab => ({ key: tab.key, name: tAdmin(`status_${tab.key}`), value: Number(reportData.counts?.[tab.key] || 0) }))
    .filter(item => item.value > 0)
  const colors = ['#D62300', '#2563EB', '#F59E0B', '#8B5CF6', '#10B981', '#EC4899', '#0891B2', '#84CC16', '#F97316', '#6366F1']
  const monthRevenue = chartData.reduce((sum, item) => sum + Number(item.revenue || 0), 0)
  const monthOrders = chartData.reduce((sum, item) => sum + Number(item.orders || 0), 0)
  const delivered = reportData.counts?.delivered || 0
  const total = reportData.counts?.total || 0

  const exportCSV = () => {
    const headers = [tAdmin('date'), tAdmin('revenue_label'), tAdmin('orders')]
    const rows = chartData.map(item => [item.date, item.revenue, item.orders].join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bao-cao-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminPageShell title={tAdmin('reports')} action={<><Download size={15} /> {tAdmin('export_csv')}</>} onAction={exportCSV}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          [tAdmin('month_revenue_total'), formatVND(monthRevenue)],
          [tAdmin('month_orders_total'), monthOrders],
          [tAdmin('new_customers_month'), reportData.newCustomers || 0],
          [tAdmin('completion_rate'), `${total ? Math.round((delivered / total) * 100) : 0}%`],
        ].map(([label, value]) => <div key={label} className="bg-white dark:bg-[#1E2130] rounded-2xl p-5 shadow-sm"><p className="text-sm text-gray-500">{label}</p><p className="text-2xl font-bold mt-1">{value}</p></div>)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)] gap-6">
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">{tAdmin('report_revenue_30_days')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="revenue" tick={{ fontSize: 11 }} tickFormatter={value => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} />
              <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value, name) => [name === 'revenue' ? formatVND(value) : `${value} ${tAdmin('orders').toLowerCase()}`, name === 'revenue' ? tAdmin('revenue_label') : tAdmin('orders')]} />
              <Legend />
              <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#D62300" strokeWidth={2} dot={false} name="revenue" />
              <Line yAxisId="orders" type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} dot={false} name="orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-gray-100">{tAdmin('orders_by_status')}</h3>
          <p className="text-xs text-gray-400 mt-1 mb-4">{tAdmin('orders_by_status_hint')}</p>
          {statusData.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={92} innerRadius={48} paddingAngle={3} label={({ value }) => value}>
                  {statusData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} ${tAdmin('orders').toLowerCase()}`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-sm text-gray-400">{tAdmin('no_order_status_data')}</div>
          )}
        </div>
      </div>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">{tAdmin('top_products')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProducts}><CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Bar dataKey="quantity" radius={[8, 8, 0, 0]}>{topProducts.map((product, index) => <Cell key={product.sku || product.name} fill={colors[index % colors.length]} />)}</Bar></BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm overflow-x-auto">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">{tAdmin('top_customers')}</h3>
        <table className="w-full text-left text-sm"><thead><tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700"><th className="py-3">{tAdmin('customer')}</th><th>{tAdmin('email')}</th><th>{tAdmin('orders_count')}</th><th>{tAdmin('total_spent')}</th></tr></thead><tbody>{topCustomers.map(customer => <tr key={customer.id} className="border-b border-gray-100 dark:border-gray-700"><td className="py-3 font-semibold">{customer.name}</td><td>{customer.email}</td><td>{customer.orders_count}</td><td>{formatVND(customer.total_spent)}</td></tr>)}</tbody></table>
      </div>
    </AdminPageShell>
  )
}

const pluginLogos = {
  vnpay: '/payment-logos/vnpay.svg',
  momo: '/payment-logos/momo.svg',
  zalopay: '/payment-logos/zalopay.svg',
  sepay: '/payment-logos/sepay.svg',
  stripe: '/payment-logos/stripe.svg',
  paypal: '/payment-logos/paypal.svg',
}

function PaymentPluginLogo({ plugin }) {
  const logo = pluginLogos[plugin.key]
  if (logo) {
    return <img src={logo} alt={`${plugin.name} logo`} className="h-12 w-12 flex-shrink-0 rounded-xl border border-gray-100 bg-white object-contain p-2" />
  }

  const Icon = plugin.key === 'cod' ? Banknote : plugin.key === 'loyalty_points' ? Gift : WalletCards
  return (
    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-700">
      <Icon size={24} />
    </div>
  )
}

const configFields = {
  vnpay: [
    { key: 'vnp_TmnCode', label: 'Terminal Code', type: 'text' },
    { key: 'vnp_HashSecret', label: 'Hash Secret', type: 'password' },
    { key: 'vnp_Url', label: 'Payment URL', type: 'text' },
    { key: 'vnp_ReturnUrl', label: 'Return URL', type: 'text' },
  ],
  momo: [
    { key: 'partner_code', label: 'Partner Code', type: 'text' },
    { key: 'access_key', label: 'Access Key', type: 'password' },
    { key: 'secret_key', label: 'Secret Key', type: 'password' },
    { key: 'endpoint', label: 'Endpoint', type: 'text' },
  ],
  zalopay: [
    { key: 'app_id', label: 'App ID', type: 'text' },
    { key: 'key1', label: 'Key 1', type: 'password' },
    { key: 'key2', label: 'Key 2', type: 'password' },
    { key: 'endpoint', label: 'Endpoint', type: 'text' },
  ],
  sepay: [
    { key: 'api_key', label: 'API Key', type: 'password' },
    { key: 'account_number', labelKey: 'account_number', type: 'text' },
    { key: 'bank_code', labelKey: 'bank_code', type: 'text' },
    { key: 'webhook_secret', label: 'Webhook Secret', type: 'password' },
  ],
  stripe: [
    { key: 'publishable_key', label: 'Publishable Key', type: 'text' },
    { key: 'secret_key', label: 'Secret Key', type: 'password' },
    { key: 'webhook_secret', label: 'Webhook Secret', type: 'password' },
  ],
  paypal: [
    { key: 'client_id', label: 'Client ID', type: 'text' },
    { key: 'client_secret', label: 'Client Secret', type: 'password' },
    { key: 'mode', labelKey: 'environment', type: 'select', options: ['sandbox', 'live'] },
  ],
}

function PluginConfigModal({ plugin, onClose, onSave }) {
  const tAdmin = useAdminText()
  const [config, setConfig] = useState(plugin.config || {})
  const [saving, setSaving] = useState(false)
  const [showPasswords, setShowPasswords] = useState({})
  const fields = configFields[plugin.key] || []

  const handleSave = async () => {
    setSaving(true)
    try {
      const cleanConfig = Object.fromEntries(
        Object.entries(config).filter(([, value]) => !(typeof value === 'string' && value.includes('•')))
      )
      await onSave(cleanConfig)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div onMouseDown={event => event.stopPropagation()} className="bg-white dark:bg-[#1E2130] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">{tAdmin('configure_plugin', { name: plugin.name })}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{tAdmin('plugin_credentials_hint')}</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors">
            <X size={16} />
            {tAdmin('close')}
          </button>
        </div>
        <div className="mx-5 mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-700">{tAdmin('masked_fields_hint')}</p>
        </div>
        <div className="p-5 space-y-4">
          {fields.map(field => (
            <div key={field.key}>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5 block">{field.labelKey ? tAdmin(field.labelKey) : field.label}</label>
              {field.type === 'select' ? (
                <select value={config[field.key] || ''} onChange={event => setConfig(prev => ({ ...prev, [field.key]: event.target.value }))} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-300">
                  {field.options.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <div className="relative">
                  <input
                    type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                    value={config[field.key] || ''}
                    onChange={event => setConfig(prev => ({ ...prev, [field.key]: event.target.value }))}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:border-red-300"
                  />
                  {field.type === 'password' && (
                    <button type="button" onClick={() => setShowPasswords(prev => ({ ...prev, [field.key]: !prev[field.key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPasswords[field.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-700">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#161825] border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">{tAdmin('cancel')}</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 text-sm text-white bg-[#D62300] rounded-xl hover:bg-[#b51e00] disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {tAdmin('save_config')}
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminPaymentsPage() {
  const tAdmin = useAdminText()
  const [plugins, setPlugins] = useState([])
  const [loading, setLoading] = useState(true)
  const [configModal, setConfigModal] = useState(null)

  const fetchPlugins = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/admin/payment-plugins')
      setPlugins(data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    apiClient.get('/admin/payment-plugins')
      .then(({ data }) => {
        if (!ignore) setPlugins(data.data || [])
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const handleToggle = async plugin => {
    if (plugin.is_default) return
    setPlugins(prev => prev.map(item => item.key === plugin.key ? { ...item, is_active: !item.is_active } : item))
    try {
      const { data } = await apiClient.patch(`/admin/payment-plugins/${plugin.key}/toggle`)
      toast.success(data.message || tAdmin('plugin_updated'))
    } catch {
      setPlugins(prev => prev.map(item => item.key === plugin.key ? { ...item, is_active: plugin.is_active } : item))
      toast.error(tAdmin('plugin_update_error'))
    }
  }

  const saveConfig = async config => {
    await apiClient.put(`/admin/payment-plugins/${configModal.key}/config`, { config })
    toast.success(tAdmin('config_saved'))
    setConfigModal(null)
    await fetchPlugins()
  }

  return (
    <AdminPageShell title={tAdmin('payment_methods')}>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
        <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">{tAdmin('payment_note')}</p>
      </div>
      {loading ? (
        <TableSkeleton rows={4} cols={2} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plugins.map(plugin => {
            return (
              <div key={plugin.key} className={`bg-white dark:bg-[#1E2130] rounded-2xl border-2 p-5 transition-all ${plugin.is_active && !plugin.is_default ? 'border-green-200 shadow-md' : 'border-gray-100 dark:border-gray-700'}`}>
                <div className="flex items-start gap-4">
                  <PaymentPluginLogo plugin={plugin} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{plugin.name}</h3>
                      {plugin.is_default && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tAdmin('default_badge')}</span>}
                      {plugin.is_active && !plugin.is_default && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">{tAdmin('active')}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{plugin.description}</p>
                  </div>
                </div>
                {!plugin.is_default && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleToggle(plugin)} className={`relative w-11 h-6 rounded-full transition-colors ${plugin.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${plugin.is_active ? 'left-6' : 'left-1'}`} />
                      </button>
                      <span className="text-sm text-gray-500">{plugin.is_active ? tAdmin('enabled') : tAdmin('disabled')}</span>
                    </div>
                    <button onClick={() => setConfigModal(plugin)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <Settings size={14} />
                      {tAdmin('config')}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      {configModal && <PluginConfigModal plugin={configModal} onClose={() => setConfigModal(null)} onSave={saveConfig} />}
    </AdminPageShell>
  )
}

function AdminLoyaltyPage({ users, loading }) {
  const tAdmin = useAdminText()
  const customers = users.filter(user => user.role === 'customer')
  const totalPoints = customers.reduce((sum, user) => sum + Number(user.loyalty_balance || 0), 0)
  const topCustomers = [...customers].sort((a, b) => Number(b.loyalty_balance || 0) - Number(a.loyalty_balance || 0)).slice(0, 10)

  return (
    <AdminPageShell title={tAdmin('loyalty_title')}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">{tAdmin('participating_customers')}</p>
          <p className="text-3xl font-bold mt-1">{customers.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">{tAdmin('total_points')}</p>
          <p className="text-3xl font-bold mt-1">{totalPoints}</p>
        </div>
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">{tAdmin('conversion_rate')}</p>
          <p className="text-3xl font-bold mt-1">{tAdmin('point_conversion')}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm overflow-x-auto">
        <h3 className="font-bold mb-4">{tAdmin('top_points_customers')}</h3>
        {loading ? <TableSkeleton rows={6} cols={5} /> : (
          <table className="w-full text-left text-sm">
            <thead><tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700"><th className="py-3">{tAdmin('customer')}</th><th>{tAdmin('email')}</th><th>{tAdmin('phone')}</th><th>{tAdmin('orders_count')}</th><th>{tAdmin('points')}</th></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {topCustomers.map(user => <tr key={user.id}><td className="py-3 font-semibold">{user.name}</td><td>{user.email}</td><td>{user.phone || '-'}</td><td>{user.orders_count || 0}</td><td className="font-bold text-[#D62300]">{user.loyalty_balance || 0}</td></tr>)}
              {!topCustomers.length && <EmptyTableRow colSpan={5} />}
            </tbody>
          </table>
        )}
      </div>
    </AdminPageShell>
  )
}

const settingTabs = [
  { key: 'general', labelKey: 'general', icon: Store },
  { key: 'shipping', labelKey: 'shipping', icon: Truck },
  { key: 'appearance', labelKey: 'appearance', icon: Palette },
  { key: 'notification', labelKey: 'notification', icon: Bell },
  { key: 'localization', labelKey: 'localization', icon: Globe },
  { key: 'seo', labelKey: 'seo', icon: Search },
  { key: 'loyalty', labelKey: 'loyalty', icon: Gift },
]

function SettingInput({ label, type = 'text', value, onChange, placeholder, suffix, hint }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">{label}</span>
      <div className="relative mt-2">
        <input
          type={type}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={event => onChange(type === 'number' ? Number(event.target.value) : event.target.value)}
          className={`${fieldInputClass} ${suffix ? 'pr-12' : ''}`}
        />
        {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">{suffix}</span>}
      </div>
      {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
    </label>
  )
}

function SettingTextarea({ label, value, onChange, rows = 3, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">{label}</span>
      <textarea rows={rows} value={value ?? ''} placeholder={placeholder} onChange={event => onChange(event.target.value)} className={`${fieldInputClass} mt-2 resize-y`} />
    </label>
  )
}

function SettingSelect({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">{label}</span>
      <select value={value ?? ''} onChange={event => onChange(event.target.value)} className={`${fieldInputClass} mt-2`}>
        {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  )
}

function SettingToggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
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

const CURRENCY_OPTIONS = [
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

function AdminLanguageLocalesPage() {
  const tAdmin = useAdminText()
  const [locales, setLocales] = useState([])
  const [available, setAvailable] = useState([])
  const [defaultLocale, setDefaultLocale] = useState('vi')
  const [selectedLocale, setSelectedLocale] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let ignore = false
    apiClient.get('/admin/translations/locales')
      .then(({ data }) => {
        if (ignore) return
        const payload = data.data || {}
        setLocales(payload.locales || [])
        setAvailable(payload.available || [])
        setDefaultLocale(payload.default || 'vi')
      })
      .catch(() => toast.error(tAdmin('languages_load_error')))
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [tAdmin])

  const enabledCodes = useMemo(() => new Set(locales.map(locale => locale.code)), [locales])
  const options = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return available
      .filter(locale => !enabledCodes.has(locale.code))
      .filter(locale => !normalizedQuery || `${locale.name} ${locale.code}`.toLowerCase().includes(normalizedQuery))
  }, [available, enabledCodes, query])

  const selectedName = available.find(locale => locale.code === selectedLocale)?.name || ''

  const addLocale = async () => {
    if (!selectedLocale) {
      toast.error(tAdmin('language_required'))
      return
    }
    setSaving(true)
    try {
      const { data } = await apiClient.post('/admin/translations/locales', { locale: selectedLocale })
      const payload = data.data || {}
      setLocales(payload.locales || [])
      setAvailable(payload.available || [])
      setDefaultLocale(payload.default || 'vi')
      setSelectedLocale('')
      setQuery('')
      toast.success(tAdmin('language_added'))
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('language_add_error'))
    } finally {
      setSaving(false)
    }
  }

  const makeDefault = async locale => {
    if (locale === defaultLocale) return
    setSaving(true)
    try {
      const { data } = await apiClient.patch(`/admin/translations/locales/${locale}/default`)
      const payload = data.data || {}
      setLocales(payload.locales || [])
      setDefaultLocale(payload.default || locale)
      toast.success(tAdmin('default_language_changed'))
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('default_language_error'))
    } finally {
      setSaving(false)
    }
  }

  const deleteLocale = async locale => {
    setSaving(true)
    try {
      const { data } = await apiClient.delete(`/admin/translations/locales/${locale}`)
      const payload = data.data || {}
      setLocales(payload.locales || [])
      setDefaultLocale(payload.default || 'vi')
      toast.success(tAdmin('language_deleted'))
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('language_delete_error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPageShell title={tAdmin('languages')} eyebrow={tAdmin('localization_breadcrumb')}>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.4fr)] gap-5">
        <div className="bg-white dark:bg-[#1E2130] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-fit">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{tAdmin('languages')}</h2>
          </div>
          <div className="p-6 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{tAdmin('select_language')}</span>
              <div className="mt-2 rounded-lg border border-blue-300 dark:border-blue-500/70 ring-4 ring-blue-100 dark:ring-blue-500/10 bg-white dark:bg-[#161825] overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-100"
                >
                  <span>{selectedName ? `${selectedName} - ${selectedLocale}` : tAdmin('select_language')}</span>
                  <ChevronRight size={16} className="rotate-90 text-gray-400" />
                </button>
                <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                  <input
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder={tAdmin('search_language')}
                    className="w-full rounded-lg border border-blue-300 dark:border-blue-500/60 px-3 py-2 text-sm bg-white dark:bg-[#1E2130] focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedLocale('')}
                    className={`w-full px-4 py-2.5 text-left text-sm ${!selectedLocale ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    {tAdmin('select_language')}
                  </button>
                  {options.map(locale => (
                    <button
                      key={locale.code}
                      type="button"
                      onClick={() => setSelectedLocale(locale.code)}
                      className={`w-full px-4 py-2.5 text-left text-sm ${selectedLocale === locale.code ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      {locale.name} - {locale.code}
                    </button>
                  ))}
                  {!options.length && (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">{tAdmin('no_language_options')}</div>
                  )}
                </div>
              </div>
            </label>
            <button
              type="button"
              onClick={addLocale}
              disabled={saving || !selectedLocale}
              className="inline-flex items-center justify-center rounded-lg bg-[#2b72c9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2362ad] disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : tAdmin('add_language')}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E2130] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{tAdmin('languages')}</h2>
          </div>
          {loading ? (
            <div className="p-6"><TableSkeleton rows={3} cols={4} /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-[#161825]">
                <tr className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-3 font-semibold">{tAdmin('language_name')}</th>
                  <th className="px-6 py-3 font-semibold text-center">{tAdmin('language_code')}</th>
                  <th className="px-6 py-3 font-semibold text-center">{tAdmin('is_default')}</th>
                  <th className="px-6 py-3 font-semibold text-right">{tAdmin('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {locales.map(locale => (
                  <tr key={locale.code} className="text-gray-800 dark:text-gray-100">
                    <td className="px-6 py-4 font-medium">{locale.name}</td>
                    <td className="px-6 py-4 text-center">{locale.code}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        disabled={saving || locale.is_default}
                        onClick={() => makeDefault(locale.code)}
                        className={`rounded-md px-3 py-1 text-sm ${locale.is_default ? 'text-gray-900 dark:text-gray-100 cursor-default' : 'text-[#2b72c9] hover:bg-blue-50 dark:hover:bg-blue-500/10'}`}
                      >
                        {locale.is_default ? tAdmin('yes') : tAdmin('no')}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          title={tAdmin('download_language')}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#2b72c9] text-white hover:bg-[#2362ad]"
                        >
                          <Download size={16} />
                        </button>
                        {!locale.is_default && (
                          <button
                            type="button"
                            onClick={() => deleteLocale(locale.code)}
                            disabled={saving}
                            title={tAdmin('delete_language')}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!locales.length && <EmptyTableRow colSpan={4} message={tAdmin('no_languages')} />}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminPageShell>
  )
}

function AdminSettingsDatabasePage() {
  const tAdmin = useAdminText()
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [testAddress, setTestAddress] = useState({ lat: 10.781232, lng: 106.685324, order_amount: 178000 })
  const [testResult, setTestResult] = useState(null)

  const flattenSettings = groups => {
    const flat = {}
    Object.entries(groups || {}).forEach(([group, values]) => {
      Object.entries(values || {}).forEach(([key, value]) => {
        flat[`${group}.${key}`] = value
      })
    })
    return flat
  }

  const loadSettings = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/admin/settings')
      setSettings(flattenSettings(data.data || {}))
      setDirty(false)
    } catch {
      toast.error(tAdmin('settings_load_error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    apiClient.get('/admin/settings')
      .then(({ data }) => {
        if (!ignore) setSettings(flattenSettings(data.data || {}))
      })
      .catch(() => toast.error(tAdmin('settings_load_error')))
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [tAdmin])

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await apiClient.put('/admin/settings', { settings })
      toast.success(tAdmin('settings_saved'))
      await loadSettings()
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('settings_save_error'))
    } finally {
      setSaving(false)
    }
  }

  const calculateTestShipping = async () => {
    const { data } = await apiClient.post('/shipping/calculate', testAddress)
    setTestResult(data.data)
  }

  const parseTiers = () => {
    const tiers = settings['shipping.distance_tiers']
    if (Array.isArray(tiers)) return tiers
    try {
      return JSON.parse(tiers || '[]')
    } catch {
      return []
    }
  }

  const updateTiers = tiers => updateSetting('shipping.distance_tiers', tiers)

  const renderGeneral = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput label={tAdmin('store_name')} value={settings['general.store_name']} onChange={value => updateSetting('general.store_name', value)} />
        <SettingInput label={tAdmin('slogan')} value={settings['general.store_tagline']} onChange={value => updateSetting('general.store_tagline', value)} />
        <SettingInput label={tAdmin('hotline')} value={settings['general.hotline']} onChange={value => updateSetting('general.hotline', value)} />
        <SettingInput label={tAdmin('support_email')} value={settings['general.email']} onChange={value => updateSetting('general.email', value)} />
      </div>
      <SettingTextarea label={tAdmin('store_description')} value={settings['general.store_description']} onChange={value => updateSetting('general.store_description', value)} />
      <SettingInput label={tAdmin('address')} value={settings['general.address']} onChange={value => updateSetting('general.address', value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminImageInput label={tAdmin('logo')} value={settings['general.logo']} onChange={value => updateSetting('general.logo', value)} />
        <AdminImageInput label={tAdmin('favicon')} value={settings['general.favicon']} onChange={value => updateSetting('general.favicon', value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['facebook_url', 'instagram_url', 'youtube_url', 'tiktok_url', 'zalo_url', 'google_maps_key'].map(key => (
          <SettingInput key={key} label={key.replaceAll('_', ' ')} value={settings[`general.${key}`]} onChange={value => updateSetting(`general.${key}`, value)} />
        ))}
      </div>
      <SettingToggle label={tAdmin('maintenance_mode')} description={tAdmin('maintenance_desc')} checked={!!settings['general.maintenance_mode']} onChange={value => updateSetting('general.maintenance_mode', value)} />
      <SettingTextarea label={tAdmin('maintenance_message')} value={settings['general.maintenance_message']} onChange={value => updateSetting('general.maintenance_message', value)} />
    </div>
  )

  const renderShipping = () => {
    const tiers = parseTiers()

    return (
      <div className="space-y-5">
        <SettingSelect label={tAdmin('shipping_method')} value={settings['shipping.method'] || 'fixed'} onChange={value => updateSetting('shipping.method', value)} options={[{ value: 'fixed', label: tAdmin('fixed') }, { value: 'distance', label: tAdmin('distance') }, { value: 'free', label: tAdmin('free_all') }]} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingInput label={tAdmin('base_fee')} type="number" suffix={settings['localization.currency_symbol'] || 'VND'} value={settings['shipping.base_fee']} onChange={value => updateSetting('shipping.base_fee', value)} />
          <SettingInput label={tAdmin('free_from')} type="number" suffix={settings['localization.currency_symbol'] || 'VND'} value={settings['shipping.free_from_amount']} onChange={value => updateSetting('shipping.free_from_amount', value)} hint={tAdmin('free_from_hint')} />
          <SettingInput label={tAdmin('per_km_fee')} type="number" suffix={settings['localization.currency_symbol'] || 'VND'} value={settings['shipping.per_km_fee']} onChange={value => updateSetting('shipping.per_km_fee', value)} />
          <SettingInput label={tAdmin('max_distance')} type="number" suffix="km" value={settings['shipping.max_distance_km']} onChange={value => updateSetting('shipping.max_distance_km', value)} />
        </div>
        <SettingInput label={tAdmin('main_store_address')} value={settings['shipping.store_address']} onChange={value => updateSetting('shipping.store_address', value)} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SettingInput label={tAdmin('latitude')} type="number" value={settings['shipping.store_lat']} onChange={value => updateSetting('shipping.store_lat', value)} />
          <SettingInput label={tAdmin('longitude')} type="number" value={settings['shipping.store_lng']} onChange={value => updateSetting('shipping.store_lng', value)} />
          <SettingInput label={tAdmin('estimated_time')} value={settings['shipping.estimated_time']} onChange={value => updateSetting('shipping.estimated_time', value)} />
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{tAdmin('distance_tiers')}</h3>
            <button type="button" onClick={() => updateTiers([...tiers, { max_km: 0, fee: 0 }])} className="text-sm font-semibold text-[#D62300]">{tAdmin('add_tier')}</button>
          </div>
          <div className="space-y-2">
            {tiers.map((tier, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-3">
                <input type="number" value={tier.max_km} onChange={event => updateTiers(tiers.map((item, i) => i === index ? { ...item, max_km: Number(event.target.value) } : item))} className={fieldInputClass} placeholder={tAdmin('to_km')} />
                <input type="number" value={tier.fee} onChange={event => updateTiers(tiers.map((item, i) => i === index ? { ...item, fee: Number(event.target.value) } : item))} className={fieldInputClass} placeholder={tAdmin('fee')} />
                <button type="button" onClick={() => updateTiers(tiers.filter((_, i) => i !== index))} className="px-3 text-red-500 hover:bg-red-50 rounded-lg"><X size={16} /></button>
              </div>
            ))}
            {!tiers.length && <p className="text-sm text-gray-400">{tAdmin('no_tiers')}</p>}
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold mb-3">{tAdmin('test_shipping')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input type="number" value={testAddress.lat} onChange={event => setTestAddress(prev => ({ ...prev, lat: Number(event.target.value) }))} className={fieldInputClass} placeholder="Lat" />
            <input type="number" value={testAddress.lng} onChange={event => setTestAddress(prev => ({ ...prev, lng: Number(event.target.value) }))} className={fieldInputClass} placeholder="Lng" />
            <input type="number" value={testAddress.order_amount} onChange={event => setTestAddress(prev => ({ ...prev, order_amount: Number(event.target.value) }))} className={fieldInputClass} placeholder={tAdmin('order_value')} />
            <button type="button" onClick={calculateTestShipping} className="rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700">{tAdmin('calculate')}</button>
          </div>
          {testResult && (
            <div className={`mt-3 rounded-xl p-3 text-sm ${testResult.out_of_range ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {testResult.out_of_range ? testResult.message : `${tAdmin('shipping_fee_result')}: ${testResult.is_free ? tAdmin('free') : formatVND(testResult.fee || 0)}${testResult.distance_km ? ` - ${testResult.distance_km}km` : ''}`}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderAppearance = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SettingInput label={tAdmin('primary_color')} type="color" value={settings['appearance.primary_color']} onChange={value => updateSetting('appearance.primary_color', value)} />
        <SettingInput label={tAdmin('secondary_color')} type="color" value={settings['appearance.secondary_color']} onChange={value => updateSetting('appearance.secondary_color', value)} />
        <SettingSelect label={tAdmin('font')} value={settings['appearance.font_family']} onChange={value => updateSetting('appearance.font_family', value)} options={[{ value: 'DM Sans', label: 'DM Sans' }, { value: 'Inter', label: 'Inter' }, { value: 'Arial', label: 'Arial' }]} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminImageInput label={tAdmin('hero_image')} value={settings['appearance.hero_image']} onChange={value => updateSetting('appearance.hero_image', value)} />
        <AdminImageInput label={tAdmin('social_share_image')} value={settings['appearance.og_image']} onChange={value => updateSetting('appearance.og_image', value)} />
      </div>
    </div>
  )

  const renderNotification = () => (
    <div className="space-y-5">
      <SettingToggle label={tAdmin('email_order_created')} checked={!!settings['notification.email_order_created']} onChange={value => updateSetting('notification.email_order_created', value)} />
      <SettingToggle label={tAdmin('email_order_status')} checked={!!settings['notification.email_order_status']} onChange={value => updateSetting('notification.email_order_status', value)} />
      <SettingToggle label={tAdmin('email_new_user')} checked={!!settings['notification.email_new_user']} onChange={value => updateSetting('notification.email_new_user', value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput label={tAdmin('admin_email')} value={settings['notification.admin_email']} onChange={value => updateSetting('notification.admin_email', value)} />
        <SettingSelect label={tAdmin('email_driver')} value={settings['notification.email_driver']} onChange={value => updateSetting('notification.email_driver', value)} options={[{ value: 'smtp', label: 'SMTP' }, { value: 'mailgun', label: 'Mailgun' }, { value: 'ses', label: 'SES' }]} />
        <SettingInput label="SMTP host" value={settings['notification.smtp_host']} onChange={value => updateSetting('notification.smtp_host', value)} />
        <SettingInput label="SMTP port" type="number" value={settings['notification.smtp_port']} onChange={value => updateSetting('notification.smtp_port', value)} />
        <SettingInput label="SMTP username" value={settings['notification.smtp_username']} onChange={value => updateSetting('notification.smtp_username', value)} />
        <SettingInput label="SMTP password" type="password" value={settings['notification.smtp_password']} onChange={value => updateSetting('notification.smtp_password', value)} />
      </div>
    </div>
  )

  const renderLocalization = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingSelect
          label={tAdmin('timezone')}
          value={settings['localization.timezone']}
          onChange={value => updateSetting('localization.timezone', value)}
          options={[
            { value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho_Chi_Minh' },
            { value: 'Asia/Bangkok', label: 'Asia/Bangkok' },
            { value: 'Asia/Shanghai', label: 'Asia/Shanghai' },
            { value: 'Asia/Seoul', label: 'Asia/Seoul' },
            { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
            { value: 'America/New_York', label: 'America/New_York' },
            { value: 'UTC', label: 'UTC' }
          ]}
        />
        <div className="block">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">{tAdmin('currency')}</span>
          <select
            value={settings['localization.currency'] || ''}
            onChange={e => {
              const opt = CURRENCY_OPTIONS.find(o => o.value === e.target.value)
              updateSetting('localization.currency', e.target.value)
              if (opt) {
                updateSetting('localization.currency_symbol', opt.symbol)
              }
            }}
            className={`${fieldInputClass} mt-2`}
          >
            {CURRENCY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <SettingInput
          label={tAdmin('currency_symbol')}
          value={settings['localization.currency_symbol']}
          onChange={value => updateSetting('localization.currency_symbol', value)}
        />
        <SettingSelect
          label={tAdmin('currency_position')}
          value={settings['localization.currency_position']}
          onChange={value => updateSetting('localization.currency_position', value)}
          options={[{ value: 'after', label: tAdmin('after_amount') }, { value: 'before', label: tAdmin('before_amount') }]}
        />
        <SettingSelect
          label={tAdmin('number_format')}
          value={settings['localization.number_format']}
          onChange={value => updateSetting('localization.number_format', value)}
          options={[{ value: 'dot', label: '1.000' }, { value: 'comma', label: '1,000' }]}
        />
      </div>
    </div>
  )

  const renderSeo = () => (
    <div className="space-y-5">
      <SettingInput label="Meta title" value={settings['seo.meta_title']} onChange={value => updateSetting('seo.meta_title', value)} />
      <SettingTextarea label="Meta description" value={settings['seo.meta_description']} onChange={value => updateSetting('seo.meta_description', value)} />
      <SettingInput label="Meta keywords" value={settings['seo.meta_keywords']} onChange={value => updateSetting('seo.meta_keywords', value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput label="Google Analytics" value={settings['seo.google_analytics']} onChange={value => updateSetting('seo.google_analytics', value)} />
        <SettingInput label="Facebook Pixel" value={settings['seo.facebook_pixel']} onChange={value => updateSetting('seo.facebook_pixel', value)} />
      </div>
      <SettingTextarea label="robots.txt" rows={5} value={settings['seo.robots_txt']} onChange={value => updateSetting('seo.robots_txt', value)} />
    </div>
  )

  const renderLoyalty = () => (
    <div className="space-y-5">
      <SettingToggle label={tAdmin('enable_loyalty')} checked={!!settings['loyalty.enabled']} onChange={value => updateSetting('loyalty.enabled', value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput label={tAdmin('vnd_per_point')} type="number" value={settings['loyalty.points_per_vnd']} onChange={value => updateSetting('loyalty.points_per_vnd', value)} />
        <SettingInput label={tAdmin('point_value')} type="number" value={settings['loyalty.vnd_per_point']} onChange={value => updateSetting('loyalty.vnd_per_point', value)} />
        <SettingInput label={tAdmin('min_redeem_points')} type="number" value={settings['loyalty.min_redeem_points']} onChange={value => updateSetting('loyalty.min_redeem_points', value)} />
        <SettingInput label={tAdmin('expires_after')} type="number" suffix={tAdmin('days')} value={settings['loyalty.expiry_days']} onChange={value => updateSetting('loyalty.expiry_days', value)} />
      </div>
    </div>
  )

  const tabContent = {
    general: renderGeneral,
    shipping: renderShipping,
    appearance: renderAppearance,
    notification: renderNotification,
    localization: renderLocalization,
    seo: renderSeo,
    loyalty: renderLoyalty,
  }

  if (loading) {
    return (
      <AdminPageShell title={tAdmin('settings')}>
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm"><TableSkeleton rows={7} cols={3} /></div>
      </AdminPageShell>
    )
  }

  return (
    <AdminPageShell title={tAdmin('settings')}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-300">{tAdmin('settings_desc')}</p>
        <button type="button" onClick={saveSettings} disabled={saving || !dirty} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${dirty ? 'bg-[#D62300] hover:bg-[#b51e00]' : 'bg-gray-300 cursor-not-allowed'}`}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {dirty ? tAdmin('save_changes') : tAdmin('saved')}
        </button>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[250px_minmax(0,1fr)] gap-6">
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-2 shadow-sm h-fit">
          {settingTabs.map(tab => {
            const Icon = tab.icon
            return (
              <button type="button" key={tab.key} onClick={() => setActiveTab(tab.key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeTab === tab.key ? 'bg-red-50 dark:bg-red-500/10 text-[#D62300] font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                <Icon size={16} />
                {tAdmin(tab.labelKey)}
              </button>
            )
          })}
        </div>
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">{tAdmin(settingTabs.find(tab => tab.key === activeTab)?.labelKey)}</h2>
          {tabContent[activeTab]?.()}
        </div>
      </div>
    </AdminPageShell>
  )
}

function NotificationDetailModal({ notification, order, loading, onClose }) {
  const tAdmin = useAdminText()
  if (!notification) return null

  const title = notificationTitle(notification) || tAdmin('notifications')
  const body = notificationBody(notification)
  const notificationPayload = notificationData(notification)
  const data = {
    customer_name: order?.address?.recipient_name || order?.user?.name,
    customer_phone: order?.address?.phone,
    delivery_address: order?.address ? [order.address.street, order.address.ward, order.address.district, order.address.province].filter(Boolean).join(', ') : null,
    items_count: order?.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    payment_method: order?.payment_method,
    payment_status: order?.payment_status,
    delivery_type: order?.delivery_type,
    subtotal: order?.subtotal,
    discount: order?.discount,
    shipping_fee: order?.shipping_fee,
    total: order?.total,
    note: order?.note,
    order_created_at: order?.created_at,
    ...notificationPayload,
  }
  const hasValue = value => value !== undefined && value !== null && value !== ''
  const money = value => hasValue(value) ? formatVND(value) : null
  const eventTime = data.event_at || notification.created_at
  const eventLabel = data.status ? tAdmin('status_event_time', { status: tAdmin(`status_${data.status}`).toLowerCase() }) : tAdmin('notification_time')
  const detailRows = [
    { label: tAdmin('order_code'), value: data.order_code },
    { label: tAdmin('customer'), value: data.customer_name },
    { label: tAdmin('phone'), value: data.customer_phone },
    { label: tAdmin('items_count'), value: data.items_count },
    { label: tAdmin('total_amount'), value: money(data.total) },
    { label: tAdmin('subtotal'), value: money(data.subtotal) },
    { label: tAdmin('discount'), value: money(data.discount) },
    { label: tAdmin('shipping_fee'), value: money(data.shipping_fee) },
    { label: tAdmin('payment_method'), value: data.payment_method?.toUpperCase?.() || data.payment_method },
    { label: tAdmin('payment_status'), value: data.payment_status },
    { label: tAdmin('delivery_type'), value: data.delivery_type },
  ].filter(row => hasValue(row.value))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-[#1E2130] rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-700 p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
              <span>{formatDate(notification.created_at)}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span>{notification.read_at ? tAdmin('read') : tAdmin('unread')}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
              {data.status && <OrderStatusBadge status={data.status} />}
            </div>
          </div>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={16} /> {tAdmin('close')}
          </button>
        </div>
        <div className="p-5 space-y-4">
          {body && (
            <div className="rounded-xl border border-red-100 bg-red-50/60 dark:border-red-500/20 dark:bg-red-500/10 p-4">
              <p className="text-sm leading-6 text-gray-700 dark:text-gray-200">{body}</p>
            </div>
          )}
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-xs uppercase font-semibold text-gray-400">{tAdmin('event_timeline')}</p>
            <div className="mt-3 space-y-3">
              {data.order_created_at && (
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50 dark:ring-blue-500/10" />
                  <div><p className="text-sm font-semibold">{tAdmin('order_created_time')}</p><p className="text-xs text-gray-400">{formatDate(data.order_created_at)}</p></div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#D62300] ring-4 ring-red-50 dark:ring-red-500/10" />
                <div><p className="text-sm font-semibold">{eventLabel}</p><p className="text-xs text-gray-400">{formatDate(eventTime)}</p></div>
              </div>
              {notification.read_at && (
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-4 ring-green-50 dark:ring-green-500/10" />
                  <div><p className="text-sm font-semibold">{tAdmin('notification_read_time')}</p><p className="text-xs text-gray-400">{formatDate(notification.read_at)}</p></div>
                </div>
              )}
            </div>
          </div>
          {!!detailRows.length && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {detailRows.map(row => (
                <div key={row.label} className="rounded-xl bg-gray-50 dark:bg-[#161825] p-3">
                  <p className="text-xs uppercase font-semibold text-gray-400">{row.label}</p>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100 break-words">{row.value}</p>
                </div>
              ))}
            </div>
          )}
          {data.delivery_address && (
            <div className="rounded-xl bg-gray-50 dark:bg-[#161825] p-3">
              <p className="text-xs uppercase font-semibold text-gray-400">{tAdmin('delivery_address')}</p>
              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{data.delivery_address}</p>
            </div>
          )}
          {data.note && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 p-3">
              <p className="text-xs uppercase font-semibold text-amber-600">{tAdmin('note')}</p>
              <p className="mt-1 text-sm text-gray-800 dark:text-gray-100">{data.note}</p>
            </div>
          )}
          {loading && <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#D62300]" size={24} /></div>}
        </div>
      </div>
    </div>
  )
}

function AdminNotificationsPage({ notifications = [], loading = false, onMarkRead }) {
  const tAdmin = useAdminText()
  const location = useLocation()
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const autoOpenedNotificationRef = useRef(null)

  const openDetail = useCallback(async item => {
    const data = notificationData(item)
    setSelectedNotification(item)
    setSelectedOrder(null)
    if (!item.read_at) {
      onMarkRead?.(item.id)
    }
    if (!data.order_id) return

    setDetailLoading(true)
    try {
      const res = await apiClient.get(`/admin/orders/${data.order_id}`)
      setSelectedOrder(unwrap(res.data))
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('error'))
    } finally {
      setDetailLoading(false)
    }
  }, [onMarkRead, tAdmin])

  useEffect(() => {
    const notificationId = location.state?.notificationId
    if (!notificationId || loading || selectedNotification || selectedOrder) return
    if (String(autoOpenedNotificationRef.current) === String(notificationId)) return

    const target = notifications.find(item => String(item.id) === String(notificationId))
    if (target) {
      autoOpenedNotificationRef.current = notificationId
      setTimeout(() => openDetail(target), 0)
    }
  }, [location.state, loading, notifications, openDetail, selectedNotification, selectedOrder])

  return (
    <AdminPageShell title={tAdmin('notifications_title')}>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm overflow-x-auto">
        {loading ? <TableSkeleton rows={6} cols={4} /> : (
          <table className="w-full text-left text-sm">
            <thead><tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700"><th className="py-3">{tAdmin('notification_content')}</th><th>{tAdmin('time')}</th><th>{tAdmin('status')}</th><th className="text-right">{tAdmin('actions')}</th></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map(item => {
                const title = notificationTitle(item)
                const body = notificationBody(item)
                return (
                  <tr key={item.id}>
                    <td className="py-3">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{title || tAdmin('notifications')}</p>
                      {body && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{body}</p>}
                    </td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>{item.read_at ? tAdmin('read') : tAdmin('unread')}</td>
                    <td className="text-right">
                      <button type="button" onClick={() => openDetail(item)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#D62300] hover:underline">
                        <Eye size={14} /> {tAdmin('view_details')}
                      </button>
                    </td>
                  </tr>
                )
              })}
              {!notifications.length && <EmptyTableRow colSpan={4} />}
            </tbody>
          </table>
        )}
      </div>
      <NotificationDetailModal
        notification={selectedNotification}
        order={selectedOrder}
        loading={detailLoading}
        onClose={() => {
          setSelectedNotification(null)
          setSelectedOrder(null)
        }}
      />
    </AdminPageShell>
  )
}

const fieldInputClass = 'w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100'

const slugify = value => (value || '')
  .toString()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '')

const skuify = (prefix, value) => {
  const base = slugify(value).toUpperCase()
  return base ? `${prefix}-${base}` : ''
}

function ToggleCell({ checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
    >
      <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

function GenericCrudPage({ title, endpoint, columns, fields, filters = [], products = [], categories = [], postCategories = [] }) {
  const tAdmin = useAdminText()
  const crud = useCrud(endpoint)
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const tableLocale = i18n.language?.startsWith('en') ? 'en' : 'vi'

  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState({})
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState({ open: false })
  const [confirmLoading, setConfirmLoading] = useState(false)
  const debouncedSearch = useDebounce(search)
  const hasTranslatableFields = fields.some(field => field.translatable)

  const fetchParams = useMemo(() => ({
    page,
    per_page: 10,
    search: debouncedSearch || undefined,
    ...Object.fromEntries(Object.entries(filterValues).filter(([, value]) => value !== '')),
  }), [page, debouncedSearch, filterValues])

  useEffect(() => {
    crud.fetchAll(fetchParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchParams])

  const resourceKey = endpoint.replace(/^\/admin\//, '')
  const titleText = tAdmin(resourceKey)
  const labelFor = value => tAdmin(value) === value ? value : tAdmin(value)
  const filterLabel = filter => {
    if (filter.labelKey) return tAdmin(filter.labelKey)
    if (filter.key === 'status') return tAdmin('all_statuses')
    if (filter.key === 'category') return tAdmin('all_types')
    if (filter.key === 'category_id') return tAdmin('all_applied_categories')
    if (filter.key === 'position') return tAdmin('all_positions')
    return filter.label || filter.key
  }

  const deleteItem = item => {
    setConfirm({
      open: true,
      title: tAdmin('delete_data_title'),
      message: tAdmin('delete_data_message', { name: resolveTranslation(item.name || item.title, tableLocale) || item.code }),
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          await crud.remove(item.id)
          setConfirm({ open: false })
          await crud.fetchAll(fetchParams)
        } finally {
          setConfirmLoading(false)
        }
      },
    })
  }

  const patchItem = async (item, key) => {
    const nextValue = !item[key]
    crud.setData(current => current.map(row => row.id === item.id ? { ...row, [key]: nextValue } : row))
    try {
      await crud.update(item.id, { ...item, [key]: nextValue })
      toast.success(tAdmin('status_updated'))
    } catch {
      crud.setData(current => current.map(row => row.id === item.id ? { ...row, [key]: item[key] } : row))
      toast.error(tAdmin('update_error'))
    }
  }

  const resolveTranslation = (value, locale = 'vi') => {
    if (value && typeof value === 'object') {
      return value[locale] || value['vi'] || '';
    }
    return value;
  }

  const enhancedColumns = columns.map(column => {
    let baseRender = column.render;
    const render = (item) => {
      if (baseRender) {
        // Flatten all translatable attributes into strings for the tableLocale
        const translatedItem = { ...item };
        Object.keys(translatedItem).forEach(key => {
          if (translatedItem[key] && typeof translatedItem[key] === 'object') {
            translatedItem[key] = translatedItem[key][tableLocale] || translatedItem[key]['vi'] || '';
          }
        });
        return baseRender(translatedItem);
      }

      const rawValue = item[column.key];
      if (rawValue && typeof rawValue === 'object') {
        return rawValue[tableLocale] || rawValue['vi'] || '';
      }
      return rawValue;
    };

    const translatedColumnLabel = column.label ? tAdmin(column.label) : column.label
    const label = column.labelKey
      ? tAdmin(column.labelKey)
      : (translatedColumnLabel !== column.label ? translatedColumnLabel : column.label)
    if (column.toggleKey) {
      return {
        ...column,
        label,
        render: item => <ToggleCell checked={!!item[column.toggleKey]} onToggle={() => patchItem(item, column.toggleKey)} />,
      }
    }
    return {
      ...column,
      label,
      render
    }
  })

  return (
    <AdminPageShell title={titleText || title} action={tAdmin('add_new')} onAction={() => navigate(`/admin/${resourceKey}/create`)}>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <AdminSearch value={search} onChange={value => { setSearch(value); setPage(1) }} placeholder={tAdmin('search_resource', { title: titleText.toLowerCase() })} className="relative flex-1 min-w-[260px]" />
          {filters.map(filter => (
            <select key={filter.key} value={filterValues[filter.key] || ''} onChange={e => { setFilterValues(prev => ({ ...prev, [filter.key]: e.target.value })); setPage(1) }} className={`${fieldInputClass} flex-1 min-w-[220px]`}>
              <option value="">{filterLabel(filter)}</option>
              {(typeof filter.options === 'function' ? filter.options({ categories, products, postCategories, data: crud.data }) : filter.options).map(option => {
                const rawLabel = option.label && typeof option.label === 'object' ? (option.label[tableLocale] || option.label.vi || '') : option.label
                const optLabel = option.labelKey ? tAdmin(option.labelKey) : labelFor(rawLabel)
                return <option key={option.value} value={option.value}>{optLabel}</option>
              })}
            </select>
          ))}
          <button type="button" onClick={() => { setSearch(''); setFilterValues({}); setPage(1) }} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">{tAdmin('reset')}</button>

        </div>
        {crud.error && <p className="text-sm text-red-500">{crud.error}</p>}
        <AdminTable
          columns={enhancedColumns}
          data={crud.data}
          loading={crud.loading}
          onDelete={deleteItem}
          renderLanguageActions={hasTranslatableFields ? item => (
            <>
              <td className="py-3 text-center">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/${resourceKey}/${item.id}/edit`)}
                  title={tAdmin('edit_vi')}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
                  aria-label={tAdmin('edit_vi')}
                >
                  <Pencil size={15} />
                </button>
              </td>
              <td className="py-3 text-center">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/${resourceKey}/${item.id}/edit?ref_lang=en`)}
                  title={tAdmin('edit_en')}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors cursor-pointer"
                  aria-label={tAdmin('edit_en')}
                >
                  <Pencil size={15} />
                </button>
              </td>
            </>
          ) : undefined}
          renderActions={item => (
            <div className="inline-flex items-center gap-2">
              {!hasTranslatableFields && (
                <button
                  type="button"
                  onClick={() => navigate(`/admin/${resourceKey}/${item.id}/edit`)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 cursor-pointer"
                  aria-label={tAdmin('edit')}
                >
                  <Pencil size={15} />
                </button>
              )}
              <button type="button" onClick={() => deleteItem(item)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 cursor-pointer" aria-label={tAdmin('delete')}><Trash2 size={15} /></button>
            </div>
          )}
        />
        <div className="flex justify-end">
          <AdminPagination page={crud.meta?.current_page || page} totalPages={crud.meta?.last_page || 1} onChange={setPage} />
        </div>
      </div>
      <ConfirmDialog open={confirm.open} title={confirm.title} message={confirm.message} onCancel={() => setConfirm({ open: false })} onConfirm={confirm.onConfirm} loading={confirmLoading} />
    </AdminPageShell>
  )
}

function GenericCrudFormPage({ config, products = [], categories = [], postCategories = [], itemId }) {
  const tAdmin = useAdminText()
  const params = useParams()
  const id = itemId ?? params.id
  const isCreate = !id
  const navigate = useNavigate()
  const { refLang, currentLocale, isDefault, LOCALES } = useRefLang()

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  const translatableKeys = useMemo(() => config.fields.filter(f => f.translatable).map(f => f.key), [config])
  const nameKey = useMemo(() => config.fields.find(f => f.key === 'title') ? 'title' : 'name', [config])
  const resourceKey = config.endpoint.replace(/^\/admin\//, '')
  const titleText = tAdmin(resourceKey)
  const fieldLabel = field => {
    if (field.labelKey) return tAdmin(field.labelKey)
    const translatedLabel = tAdmin(field.key)
    if (translatedLabel !== field.key) return translatedLabel
    return field.label || field.key
  }
  const optionLabel = option => {
    if (typeof option === 'string') return tAdmin(option) === option ? option : tAdmin(option)
    if (option.labelKey) return tAdmin(option.labelKey)
    if (option.label && typeof option.label === 'object') return option.label[refLang] || option.label.vi || ''
    if (option.label) return option.label
    return option.value || ''
  }
  
  const [form, setForm] = useState(config.defaults)

  useEffect(() => {
    const loadItem = async () => {
      setLoading(true)
      try {
        const res = await apiClient.get(`${config.endpoint}/${id}`)
        const fetchedItem = res.data.data
        const merged = { ...config.defaults }
        Object.keys(config.defaults).forEach(key => {
          if (translatableKeys.includes(key)) {
            const translationMap = fetchedItem.translations?.[key] || fetchedItem[key] || { vi: '', en: '' }
            if (translationMap && typeof translationMap === 'object') {
              merged[key] = {
                vi: translationMap.vi || '',
                en: translationMap.en || ''
              }
            } else if (translationMap) {
              merged[key] = { vi: translationMap, en: '' }
            } else {
              merged[key] = { vi: '', en: '' }
            }
          } else {
            merged[key] = fetchedItem[key] !== undefined ? fetchedItem[key] : config.defaults[key]
          }
        })
        setForm(merged)
      } catch (err) {
        console.error(err)
        toast.error(tAdmin('product_not_found'))
      } finally {
        setLoading(false)
      }
    }

    if (!isCreate && id) {
      loadItem()
    }
  }, [id, isCreate, config, translatableKeys, tAdmin])

  const updateTranslation = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: {
        ...(prev[field] || {}),
        [refLang]: value
      },
      ...(field === nameKey && refLang === 'vi' && isCreate && !prev.sku
        ? { sku: skuify(resourceKey === 'combos' ? 'CMB' : resourceKey === 'toppings' ? 'TOP' : 'SKU', value) }
        : {}),
    }))
  }

  const updateField = (key, value) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if ((key === 'name' || key === 'title') && isCreate) {
        const slugField = config.fields.find(f => f.key === 'slug')
        const skuField = config.fields.find(f => f.key === 'sku')
        const nameVal = typeof value === 'object' ? (value?.vi || '') : value
        if (slugField) {
          next.slug = slugify(nameVal)
        }
        if (skuField && !next.sku) {
          next.sku = skuify(resourceKey === 'combos' ? 'CMB' : resourceKey === 'toppings' ? 'TOP' : 'SKU', nameVal)
        }
      }
      return next
    })
  }

  const handleSave = async (andContinue = false) => {
    for (const field of config.fields) {
      if (field.required) {
        if (field.translatable) {
          const val = form[field.key]?.[refLang] || ''
          if (refLang === 'vi' && !val.trim()) {
            toast.error(tAdmin('required_vi', { label: fieldLabel(field).toLowerCase() }))
            return
          }
        } else {
          if (isDefault) {
            const val = form[field.key]
            if (val === undefined || val === null || val === '') {
              toast.error(tAdmin('required_field', { label: fieldLabel(field).toLowerCase() }))
              return
            }
          }
        }
      }
    }

    setSaving(true)
    try {
      const transPayload = {}
      const fieldsPayload = {}
      
      Object.keys(form).forEach(key => {
        if (translatableKeys.includes(key)) {
          transPayload[key] = form[key]
        } else {
          fieldsPayload[key] = form[key]
        }
      })
      
      const payload = {
        ...fieldsPayload,
        translations: transPayload
      }

      let savedId = id
      const resource = config.endpoint.replace(/^\/admin\//, '')
      
      if (isCreate) {
        const res = await apiClient.post(config.endpoint, payload)
        savedId = res.data.data.id
        toast.success(tAdmin('created_resource', { title: titleText.toLowerCase() }))
      } else {
        await apiClient.put(`${config.endpoint}/${id}`, payload)
        toast.success(tAdmin('saved_changes'))
      }

      if (andContinue) {
        if (isCreate) {
          navigate(`/admin/${resource}/${savedId}/edit?ref_lang=${refLang}`)
        }
      } else {
        navigate(`/admin/${resource}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || tAdmin('generic_error'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#D62300]" size={28} /></div>
  }

  const inputClass = 'w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:text-gray-400'

  const imageField = config.fields.find(f => f.type === 'image' || f.key === 'image' || f.key === 'thumbnail')
  const toggleFields = config.fields.filter(f => f.type === 'checkbox' && (f.key.startsWith('is_') || f.key === 'active' || f.key === 'published'))
  
  const leftFields = config.fields.filter(field => {
    if (field.type === 'image' || field.key === 'image' || field.key === 'thumbnail') return false
    if (field.type === 'checkbox' && (field.key.startsWith('is_') || field.key === 'active' || field.key === 'published')) return false
    return true
  })

  const renderField = field => {
    if (field.translatable) {
      const isLongText = field.type === 'textarea'
      const showDetails = isLongText && (field.rows >= 5 || field.key === 'content')
      const val = form[field.key]?.[refLang] || ''
      const origVi = form[field.key]?.vi || ''
      
      return (
        <div key={field.key} className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {fieldLabel(field)} {field.required && isDefault && <span className="text-red-500">*</span>}
          </label>
          {isLongText ? (
            <textarea
              value={val}
              onChange={e => updateTranslation(field.key, e.target.value)}
              placeholder={fieldLabel(field)}
              rows={field.rows || 4}
              className={inputClass}
            />
          ) : (
            <input
              type="text"
              value={val}
              onChange={e => updateTranslation(field.key, e.target.value)}
              placeholder={fieldLabel(field)}
              className={inputClass}
            />
          )}
          {!isDefault && origVi && (
            showDetails ? (
              <details className="mt-1">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 outline-none">🇻🇳 {tAdmin('view_original_vi')}</summary>
                <p className="text-xs text-gray-400 mt-1 bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 whitespace-pre-wrap">
                  {origVi}
                </p>
              </details>
            ) : (
              <p className="text-xs text-gray-400 mt-1 flex items-start gap-1.5">
                <span className="flex-shrink-0">🇻🇳 {tAdmin('original_vi')}</span>
                <span>{origVi}</span>
              </p>
            )
          )}
        </div>
      )
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {fieldLabel(field)} {field.required && isDefault && <span className="text-red-500">*</span>}
          </label>
          <textarea
            disabled={!isDefault}
            value={form[field.key] || ''}
            onChange={e => updateField(field.key, e.target.value)}
            rows={field.rows || 3}
            className={inputClass}
            required={field.required && isDefault}
            maxLength={field.maxLength}
          />
        </div>
      )
    }

    if (field.type === 'select') {
      const options = typeof field.options === 'function' ? field.options({ products, categories, postCategories }) : field.options
      return (
        <div key={field.key} className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {fieldLabel(field)} {field.required && isDefault && <span className="text-red-500">*</span>}
          </label>
          <select
            disabled={!isDefault}
            value={form[field.key] || ''}
            onChange={e => updateField(field.key, e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-xl px-3 py-2.5 text-sm mt-1.5 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-60"
            required={field.required && isDefault}
          >
            <option value="">{tAdmin('choose')}</option>
            {options.map(option => {
              const value = typeof option === 'string' ? option : option.value
              return <option key={value} value={value}>{optionLabel(option)}</option>
            })}
          </select>
        </div>
      )
    }

    if (field.type === 'categoryMultiSelect') {
      const selected = Array.isArray(form[field.key]) ? form[field.key].map(Number) : []
      return (
        <div key={field.key} className={`rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2 ${!isDefault ? 'opacity-60' : ''}`}>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{fieldLabel(field)}</label>
          <p className="text-xs text-gray-500 mb-3">{tAdmin('all_products_categories_hint')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {categories.map(category => {
              const catId = Number(category.id)
              const checked = selected.includes(catId)
              const catName = category.name && typeof category.name === 'object' ? (category.name[refLang] || category.name.vi || '') : category.name
              return (
                <label key={category.id} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm border transition ${checked ? 'border-[#D62300] bg-red-50 text-[#D62300]' : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <input
                    disabled={!isDefault}
                    type="checkbox"
                    checked={checked}
                    onChange={event => {
                      const next = event.target.checked
                        ? [...selected, catId]
                        : selected.filter(value => value !== catId)
                      updateField(field.key, next)
                    }}
                  />
                  {catName}
                </label>
              )
            })}
          </div>
        </div>
      )
    }

    if (field.type === 'branchMap') {
      const translatedAddress = typeof form.address === 'object' ? (form.address?.[refLang] || form.address?.vi || '') : form.address
      const coordinateQuery = form.lat && form.lng ? `${form.lat},${form.lng}` : ''
      const mapQuery = coordinateQuery || translatedAddress
      const encodedQuery = encodeURIComponent(mapQuery || '')
      const mapsUrl = mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodedQuery}` : null

      return (
        <div key={field.key} className="space-y-3 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm">{tAdmin('branch_map')}</h3>
              <p className="text-xs text-gray-400 mt-1">{tAdmin('branch_map_hint')}</p>
            </div>
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#D62300] px-3 py-2 text-xs font-semibold text-white hover:bg-[#b51e00]">
                <MapPin size={15} /> {tAdmin('open_google_maps')}
              </a>
            )}
          </div>
          {mapQuery ? (
            <iframe
              title={tAdmin('branch_map')}
              src={`https://maps.google.com/maps?q=${encodedQuery}&z=16&output=embed`}
              className="h-72 w-full rounded-xl border-0 bg-gray-100"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-xl bg-gray-50 dark:bg-[#161825] text-sm text-gray-400">{tAdmin('branch_map_empty')}</div>
          )}
        </div>
      )
    }

    if (field.type === 'comboItems') {
      const items = form.items || []
      return (
        <div key={field.key} className={`border border-gray-100 dark:border-gray-700 rounded-xl p-4 space-y-3 ${!isDefault ? 'opacity-60' : ''}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">{tAdmin('combo_items')}</h3>
            {isDefault && (
              <button
                type="button"
                onClick={() => updateField('items', [...items, { product_id: '', size: 'S', quantity: 1 }])}
                className="text-xs font-semibold text-[#D62300] cursor-pointer"
              >
                {tAdmin('add_combo_item')}
              </button>
            )}
          </div>
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-[minmax(0,1fr)_80px_90px_40px] gap-2">
              <select
                disabled={!isDefault}
                value={item.product_id || ''}
                onChange={e => updateField('items', items.map((row, i) => i === index ? { ...row, product_id: e.target.value } : row))}
                className={inputClass}
              >
                <option value="">{tAdmin('product')}</option>
                {products.map(product => {
                  const prodName = product.name && typeof product.name === 'object' ? (product.name[refLang] || product.name.vi || '') : product.name
                  return <option key={product.id} value={product.id}>{product.sku ? `${product.sku} - ${prodName}` : prodName}</option>
                })}
              </select>
              <select
                disabled={!isDefault}
                value={item.size || 'S'}
                onChange={e => updateField('items', items.map((row, i) => i === index ? { ...row, size: e.target.value } : row))}
                className={inputClass}
              >
                {['S', 'M', 'L', 'XL'].map(size => <option key={size} value={size}>{size}</option>)}
              </select>
              <input
                disabled={!isDefault}
                type="number"
                value={item.quantity || 1}
                onChange={e => updateField('items', items.map((row, i) => i === index ? { ...row, quantity: Number(e.target.value) } : row))}
                className={inputClass}
              />
              {isDefault && (
                <button type="button" onClick={() => updateField('items', items.filter((_, i) => i !== index))} className="text-red-500 font-semibold cursor-pointer">X</button>
              )}
            </div>
          ))}
        </div>
      )
    }

    return (
      <div key={field.key} className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {fieldLabel(field)} {field.required && isDefault && <span className="text-red-500">*</span>}
        </label>
        <input
          disabled={!isDefault}
          type={field.type || 'text'}
          value={form[field.key] || ''}
          onChange={e => updateField(field.key, e.target.value)}
          className={inputClass}
          required={field.required && isDefault}
          readOnly={field.readOnly}
          maxLength={field.maxLength}
        />
        {field.key === 'sku' && isDefault && <p className="text-xs text-gray-400">{tAdmin('sku_auto_hint')}</p>}
      </div>
    )
  }

  return (
    <AdminPageShell title={tAdmin(isCreate ? 'add_resource' : 'edit_resource', { title: titleText })} action={tAdmin('back')} onAction={() => navigate(`/admin/${resourceKey}`)}>
      {!isDefault && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5">
          <Info size={16} className="text-blue-500 flex-shrink-0 animate-bounce" />
          <p className="text-sm text-blue-700">
            {tAdmin('editing_locale_notice', { locale: currentLocale.label })}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start">
        {/* Left Form */}
        <div className="space-y-5 bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
          {leftFields.map(field => renderField(field))}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Publish card */}
          <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{tAdmin('publish')}</h4>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {tAdmin('save_continue')}
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="w-full py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              {tAdmin('save')}
            </button>
          </div>

          {/* Language card */}
          <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{tAdmin('language')}</h4>
            <div className="space-y-1">
              {LOCALES.map(locale => {
                const isActive = locale.code === refLang
                const hasTranslation = locale.code === 'vi' || !!form[nameKey]?.[locale.code]

                const editUrl = isCreate
                  ? `/admin/${resourceKey}/create${locale.code !== 'vi' ? `?ref_lang=${locale.code}` : ''}`
                  : locale.code === 'vi'
                    ? `/admin/${resourceKey}/${id}/edit`
                    : `/admin/${resourceKey}/${id}/edit?ref_lang=${locale.code}`

                return (
                  <Link
                    key={locale.code}
                    to={editUrl}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? 'bg-red-50 dark:bg-red-500/10 text-[#D62300] font-semibold scale-[1.02]'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{locale.flag}</span>
                      <span>{locale.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${hasTranslation ? 'bg-green-400' : 'bg-gray-300'}`} />
                      {isActive && <ExternalLink size={12} className="text-gray-400" />}
                    </div>
                  </Link>
                )
              })}
            </div>
            <p className="text-[10px] text-gray-400">
              🟢 {tAdmin('translated')} &nbsp; ⚪ {tAdmin('not_translated')}
            </p>
          </div>

          {/* Options card */}
          {isDefault && toggleFields.length > 0 && (
            <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-4 shadow-sm space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{tAdmin('options')}</h4>
              <div className="space-y-3">
                {toggleFields.map(field => {
                  const checked = !!form[field.key]
                  const isGreen = field.key === 'is_available' || field.key === 'is_published' || field.key === 'is_active'
                  return (
                    <div key={field.key} className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-500 uppercase">{field.checkLabel ? tAdmin(field.checkLabel) : fieldLabel(field)}</label>
                      <button
                        type="button"
                        onClick={() => updateField(field.key, !checked)}
                        className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${checked ? (isGreen ? 'bg-green-500' : 'bg-[#D62300]') : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Image card */}
          {imageField && (
            <div className={`${!isDefault ? 'opacity-60' : ''}`}>
              <AdminImageInput
                label={fieldLabel(imageField)}
                value={form[imageField.key] || ''}
                onChange={value => {
                  if (isDefault) updateField(imageField.key, value)
                }}
              />
            </div>
          )}
        </div>
      </div>
    </AdminPageShell>
  )
}

const toppingIcon = category => category === 'cheese' ? '🧀' : category === 'meat' ? '🥓' : category === 'veggie' ? '🧅' : '🏺'

function ToppingCategoryBadge({ category }) {
  const tAdmin = useAdminText()
  const label = tAdmin(category) === category ? category : tAdmin(category)
  return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">{label}</span>
}

const imageThumb = (src, size = 'w-12 h-12', fallback = null) => (
  src ? <img src={assetUrl(src)} alt="" className={`${size} object-cover rounded-lg bg-gray-100`} /> : <div className={`${size} rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg`}>{fallback}</div>
)

const crudPages = {
  categories: {
    endpoint: '/admin/categories',
    defaults: { name: { vi: '', en: '' }, slug: '', description: { vi: '', en: '' }, image: '', sort_order: 0, is_active: true },
    columns: [
      { key: 'image', labelKey: 'image', render: item => imageThumb(item.image, 'w-10 h-10') },
      { key: 'name', labelKey: 'category_name' },
      { key: 'slug', label: 'Slug' },
      { key: 'products_count', labelKey: 'products_count' },
      { key: 'sort_order', labelKey: 'sort_order' },
      { key: 'is_active', labelKey: 'status', toggleKey: 'is_active' },
    ],
    fields: [
      { key: 'name', labelKey: 'name', required: true, translatable: true },
      { key: 'slug', label: 'Slug' },
      { key: 'description', labelKey: 'description', type: 'textarea', translatable: true },
      { key: 'image', labelKey: 'image', type: 'image' },
      { key: 'sort_order', labelKey: 'sort_order', type: 'number' },
      { key: 'is_active', labelKey: 'active', type: 'checkbox' },
    ],
  },
  combos: {
    title: 'Combo Sets',
    endpoint: '/admin/combos',
    defaults: { name: { vi: '', en: '' }, slug: '', sku: '', description: { vi: '', en: '' }, image: '', price: '', is_active: true, items: [] },
    columns: [
      { key: 'image', labelKey: 'image', render: item => imageThumb(item.image) },
      { key: 'name', labelKey: 'combo_name', render: item => <div><p className="font-semibold">{item.name}</p><p className="text-xs text-gray-400">{item.slug}</p></div> },
      { key: 'sku', labelKey: 'sku' },
      { key: 'price', labelKey: 'combo_price', render: item => formatVND(item.price) },
      { key: 'items_count', labelKey: 'items_count' },
      { key: 'is_active', labelKey: 'active', toggleKey: 'is_active' },
    ],
    fields: [
      { key: 'name', labelKey: 'name', required: true, translatable: true },
      { key: 'slug', label: 'Slug' },
      { key: 'sku', labelKey: 'sku' },
      { key: 'description', labelKey: 'description', type: 'textarea', translatable: true },
      { key: 'price', labelKey: 'price', type: 'number', required: true },
      { key: 'image', labelKey: 'image', type: 'image' },
      { key: 'items', labelKey: 'combo_items', type: 'comboItems' },
      { key: 'is_active', labelKey: 'active', type: 'checkbox' },
    ],
  },
  toppings: {
    endpoint: '/admin/toppings',
    defaults: { name: { vi: '', en: '' }, sku: '', category: 'sauce', category_ids: [], price: '', image: '', is_available: true },
    filters: [
      { key: 'category', labelKey: 'all_types', options: [
        { value: 'sauce', labelKey: 'sauce' }, { value: 'cheese', labelKey: 'cheese' }, { value: 'veggie', labelKey: 'veggie' }, { value: 'meat', labelKey: 'meat' },
      ] },
      { key: 'category_id', labelKey: 'all_applied_categories', options: ({ categories }) => categories.map(category => ({ value: category.id, label: category.name })) },
    ],
    columns: [
      { key: 'image', labelKey: 'image', render: item => imageThumb(item.image, 'w-10 h-10', toppingIcon(item.category)) },
      { key: 'name', labelKey: 'topping_name' },
      { key: 'sku', labelKey: 'sku' },
      { key: 'category', labelKey: 'type', render: item => <ToppingCategoryBadge category={item.category} /> },
      { key: 'category_ids', labelKey: 'apply_to', render: item => item.category_ids?.length || 0 },
      { key: 'price', labelKey: 'price', render: item => formatVND(item.price) },
      { key: 'is_available', labelKey: 'available', toggleKey: 'is_available' },
    ],
    fields: [
      { key: 'name', labelKey: 'name', required: true, translatable: true },
      { key: 'sku', labelKey: 'sku' },
      { key: 'category', labelKey: 'type', type: 'select', required: true, options: [
        { value: 'sauce', labelKey: 'sauce' }, { value: 'cheese', labelKey: 'cheese' }, { value: 'veggie', labelKey: 'veggie' }, { value: 'meat', labelKey: 'meat' },
      ] },
      { key: 'category_ids', labelKey: 'all_applied_categories', type: 'categoryMultiSelect' },
      { key: 'price', labelKey: 'price', type: 'number', required: true },
      { key: 'image', labelKey: 'image', type: 'image' },
      { key: 'is_available', labelKey: 'available', type: 'checkbox' },
    ],
  },
  banners: {
    endpoint: '/admin/banners',
    defaults: { title: { vi: '', en: '' }, subtitle: { vi: '', en: '' }, image: '', link: '', position: 'hero', sort_order: 0, starts_at: '', expires_at: '', is_active: true },
    filters: [{ key: 'position', labelKey: 'all_positions', options: [{ value: 'hero', label: 'Hero' }, { value: 'popup', label: 'Popup' }, { value: 'sidebar', label: 'Sidebar' }] }],
    columns: [
      { key: 'image', labelKey: 'preview', render: item => imageThumb(item.image, 'w-20 h-12') },
      { key: 'title', labelKey: 'title' },
      { key: 'position', labelKey: 'position', render: item => <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs">{item.position}</span> },
      { key: 'sort_order', labelKey: 'sort_order' },
      { key: 'expires_at', labelKey: 'effect_time', render: item => `${item.starts_at ? formatDate(item.starts_at) : '-'} - ${item.expires_at ? formatDate(item.expires_at) : '-'}` },
      { key: 'is_active', labelKey: 'active', toggleKey: 'is_active' },
    ],
    fields: [
      { key: 'title', labelKey: 'title', required: true, translatable: true },
      { key: 'subtitle', labelKey: 'subtitle', translatable: true },
      { key: 'image', labelKey: 'image', type: 'image', required: true },
      { key: 'link', labelKey: 'link_target' },
      { key: 'position', labelKey: 'position', type: 'select', required: true, options: [{ value: 'hero', label: 'Hero' }, { value: 'popup', label: 'Popup' }, { value: 'sidebar', label: 'Sidebar' }] },
      { key: 'sort_order', labelKey: 'sort_order', type: 'number' },
      { key: 'starts_at', labelKey: 'start_date', type: 'date' },
      { key: 'expires_at', labelKey: 'end_date', type: 'date' },
      { key: 'is_active', labelKey: 'active', type: 'checkbox' },
    ],
  },
  branches: {
    endpoint: '/admin/branches',
    defaults: { name: { vi: '', en: '' }, address: { vi: '', en: '' }, phone: '', open_time: '08:00', close_time: '22:00', lat: '', lng: '', is_active: true },
    columns: [
      { key: 'name', labelKey: 'branch_name' },
      { key: 'address', labelKey: 'address' },
      { key: 'phone', labelKey: 'phone' },
      { key: 'open_time', labelKey: 'open_close_time', render: item => `${item.open_time} - ${item.close_time}` },
      { key: 'is_active', labelKey: 'active_operation', toggleKey: 'is_active' },
    ],
    fields: [
      { key: 'name', labelKey: 'name', required: true, translatable: true },
      { key: 'address', labelKey: 'address', required: true, translatable: true },
      { key: 'phone', labelKey: 'phone', required: true },
      { key: 'open_time', labelKey: 'open_time', type: 'time', required: true },
      { key: 'close_time', labelKey: 'close_time', type: 'time', required: true },
      { key: 'lat', labelKey: 'latitude', type: 'number' },
      { key: 'lng', labelKey: 'longitude', type: 'number' },
      { key: 'map_preview', labelKey: 'branch_map', type: 'branchMap' },
      { key: 'is_active', labelKey: 'active_operation', type: 'checkbox' },
    ],
  },
  posts: {
    endpoint: '/admin/posts',
    defaults: { title: { vi: '', en: '' }, slug: '', excerpt: { vi: '', en: '' }, thumbnail: '', category: '', read_time: 5, video_url: '', content: { vi: '', en: '' }, is_published: true, published_at: '' },
    filters: [
      { key: 'status', labelKey: 'all_statuses', options: [{ value: 'published', labelKey: 'published' }, { value: 'draft', labelKey: 'draft' }] },
      {
        key: 'category',
        labelKey: 'all_categories',
        options: ({ postCategories }) => (postCategories || [])
          .map(category => ({ value: category, label: category })),
      },
    ],
    columns: [
      { key: 'thumbnail', labelKey: 'image', render: item => imageThumb(item.thumbnail, 'w-16 h-10') },
      { key: 'title', labelKey: 'title', render: item => <div><p className="font-semibold">{item.title}</p><p className="text-xs text-gray-400">{item.slug}</p></div> },
      { key: 'category', labelKey: 'blog_category' },
      { key: 'read_time', labelKey: 'read_label', render: item => item.read_time },
      { key: 'is_published', labelKey: 'status', render: item => <StatusBadge status={item.is_published ? 'published' : 'draft'} /> },
      { key: 'published_at', labelKey: 'published_at', render: item => item.published_at ? formatDate(item.published_at) : '-' },
    ],
    fields: [
      { key: 'title', labelKey: 'title', required: true, translatable: true },
      { key: 'slug', label: 'Slug' },
      { key: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 2, required: true, maxLength: 200, translatable: true },
      { key: 'thumbnail', labelKey: 'thumbnail', type: 'image', required: true },
      { key: 'category', labelKey: 'category', required: true },
      { key: 'read_time', labelKey: 'read_time', type: 'number' },
      { key: 'video_url', labelKey: 'video_url' },
      { key: 'content', labelKey: 'content', type: 'textarea', rows: 10, required: true, translatable: true },
      { key: 'is_published', labelKey: 'published', type: 'checkbox' },
      { key: 'published_at', labelKey: 'published_at', type: 'date' },
    ],
  },
}

function AdminPanel() {
  const { user } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const tAdmin = useAdminText()
  const editMatch = location.pathname.match(/^\/admin\/products\/(\d+)\/edit$/)
  const genericEditMatch = location.pathname.match(/^\/admin\/(categories|combos|toppings|posts|banners|branches)\/(\d+)\/edit$/)
  const genericCreateMatch = location.pathname.match(/^\/admin\/(categories|combos|toppings|posts|banners|branches)\/create$/)

  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [orders, setOrders] = useState([])
  const [orderCounts, setOrderCounts] = useState({})
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [coupons, setCoupons] = useState([])
  const [users, setUsers] = useState([])
  const [reviews, setReviews] = useState([])
  const [postCategories, setPostCategories] = useState([])
  const [notifications, setNotifications] = useState([])
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [reportData, setReportData] = useState({ counts: {}, topProducts: [], topCustomers: [], newCustomers: 0 })
  const [editProduct, setEditProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(false)
  const [confirm, setConfirm] = useState({ open: false })
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [orderFilters, setOrderFilters] = useState({ status: '', search: '', page: 1 })
  const [productFilters, setProductFilters] = useState({ search: '', categoryId: '', available: '', page: 1 })
  const [orderMeta, setOrderMeta] = useState({ current_page: 1, last_page: 1 })
  const [productMeta, setProductMeta] = useState({ current_page: 1, last_page: 1 })
  const debouncedOrderSearch = useDebounce(orderFilters.search)
  const debouncedProductSearch = useDebounce(productFilters.search)

  const fetchDashboard = async () => {
    const [statsRes, chartRes, countsRes] = await Promise.all([
      apiClient.get('/admin/dashboard/stats').catch(() => apiClient.get('/admin/dashboard')),
      apiClient.get('/admin/dashboard/revenue-chart', { params: { period: '7days' } }),
      apiClient.get('/admin/orders/counts'),
    ])
    setStats(unwrap(statsRes))
    setChartData(unwrap(chartRes))
    setOrderCounts(unwrap(countsRes))
  }

  const fetchOrders = async (next = orderFilters) => {
    setTableLoading(true)
    try {
      const res = await apiClient.get('/admin/orders', { params: { status: next.status || undefined, search: debouncedOrderSearch || undefined, page: next.page } })
      const data = unwrap(res)
      setOrders(Array.isArray(data) ? data : data.data || [])
      setOrderMeta(getMeta(res) || { current_page: 1, last_page: 1 })
    } finally {
      setTableLoading(false)
    }
  }

  const fetchProducts = async (next = productFilters) => {
    setTableLoading(true)
    try {
      const res = await apiClient.get('/admin/products', { params: { search: debouncedProductSearch || undefined, category_id: next.categoryId || undefined, is_available: next.available || undefined, page: next.page, per_page: 15 } })
      const data = unwrap(res)
      setProducts(Array.isArray(data) ? data : data.data || [])
      setProductMeta(getMeta(res) || { current_page: 1, last_page: 1 })
    } finally {
      setTableLoading(false)
    }
  }

  const fetchCategories = async () => {
    const res = await apiClient.get('/admin/categories', { params: { per_page: 100 } })
    setCategories(unwrap(res))
  }

  const fetchCoupons = async () => {
    const res = await apiClient.get('/admin/coupons')
    setCoupons(unwrap(res))
  }

  const fetchUsers = async () => {
    const res = await apiClient.get('/admin/users')
    setUsers(unwrap(res))
  }

  const fetchReviews = async () => {
    const res = await apiClient.get('/admin/reviews')
    setReviews(unwrap(res))
  }

  const fetchPostCategories = async () => {
    const res = await apiClient.get('/admin/posts/categories')
    setPostCategories(unwrap(res))
  }

  const fetchNotifications = async ({ silent = false } = {}) => {
    if (!silent) setNotificationLoading(true)
    try {
      const { data } = await apiClient.get('/notifications')
      setNotifications(unwrapNotifications(data))
    } finally {
      if (!silent) setNotificationLoading(false)
    }
  }

  const fetchReports = async () => {
    const [reportsRes, topProductsRes, topCustomersRes, countsRes, chartRes] = await Promise.all([
      apiClient.get('/admin/reports/summary'),
      apiClient.get('/admin/reports/top-products'),
      apiClient.get('/admin/reports/top-customers'),
      apiClient.get('/admin/orders/counts'),
      apiClient.get('/admin/dashboard/revenue-chart', { params: { period: '30days' } }),
    ])
    setOrderCounts(unwrap(countsRes))
    setChartData(unwrap(chartRes))
    setReportData(prev => ({ ...prev, ...unwrap(reportsRes), topProducts: unwrap(topProductsRes), topCustomers: unwrap(topCustomersRes) }))
  }

  useEffect(() => {
    if (user?.role !== 'admin') return
    let ignore = false
    const loadRouteData = async () => {
      setLoading(true)
      const path = location.pathname
      if (path === '/admin') {
        await fetchDashboard()
        await fetchOrders()
      } else if (path === '/admin/orders') {
        const countsRes = await apiClient.get('/admin/orders/counts')
        setOrderCounts(unwrap(countsRes))
        await fetchOrders()
      } else if (path === '/admin/products' || path === '/admin/products/create' || /^\/admin\/products\/\d+\/edit$/.test(path)) {
        await fetchCategories()
        await fetchProducts()
      } else if (path === '/admin/coupons') {
        await fetchCoupons()
      } else if (path === '/admin/users') {
        await fetchUsers()
      } else if (path === '/admin/reviews') {
        await fetchReviews()
      } else if (path === '/admin/reports') {
        await fetchDashboard()
        await fetchReports()
      } else if (path.startsWith('/admin/combos')) {
        await fetchProducts({ search: '', categoryId: '', available: '', page: 1 })
      } else if (path.startsWith('/admin/toppings')) {
        await fetchCategories()
      } else if (path.startsWith('/admin/posts')) {
        await fetchPostCategories()
      } else if (path === '/admin/loyalty') {
        await fetchUsers()
      }
      if (!ignore) setLoading(false)
    }

    loadRouteData()
      .catch(error => {
        console.error(error)
        toast.error(tAdmin('admin_load_error'))
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, location.pathname, tAdmin])

  useEffect(() => {
    if (user?.role !== 'admin') return undefined

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications().catch(error => {
      console.error(error)
    })

    const intervalId = window.setInterval(() => {
      fetchNotifications({ silent: true }).catch(error => {
        console.error(error)
      })
    }, 60000)

    return () => window.clearInterval(intervalId)
  }, [user?.role])

  useEffect(() => {
    if (!user || loading) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders({ ...orderFilters, page: 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedOrderSearch, orderFilters.status])

  useEffect(() => {
    if (!user || loading) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts({ ...productFilters, page: 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedProductSearch, productFilters.categoryId, productFilters.available])

  useEffect(() => {
    if (!editMatch) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditProduct(null)
      return
    }
    const id = Number(editMatch[1])
    const localProduct = products.find(product => product.id === id)
    if (localProduct) {
      setEditProduct(localProduct)
      return
    }
    apiClient.get(`/admin/products/${id}`).then(res => setEditProduct(unwrap(res))).catch(() => toast.error(tAdmin('product_not_found')))
  }, [editMatch, products, tAdmin])

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await apiClient.patch(`/admin/orders/${orderId}/status`, { status })
      const updatedOrder = unwrap(res)
      setOrders(prev => prev.map(order => order.id === orderId ? updatedOrder : order))
      toast.success(tAdmin('order_status_updated'))
      fetchOrders()
      fetchDashboard()
      return updatedOrder
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('order_status_invalid'))
      throw error
    }
  }

  const markNotificationRead = async id => {
    const current = notifications
    setNotifications(prev => prev.map(item => item.id === id ? { ...item, read_at: item.read_at || new Date().toISOString() } : item))
    try {
      await apiClient.post(`/notifications/${id}/read`)
      await fetchNotifications({ silent: true })
    } catch (error) {
      setNotifications(current)
      toast.error(error.response?.data?.message || tAdmin('update_error'))
    }
  }

  const toggleProductFlag = async (productId, key, current) => {
    setProducts(prev => prev.map(product => product.id === productId ? { ...product, [key]: !current } : product))
    try {
      await apiClient.patch(`/admin/products/${productId}`, { [key]: !current })
      toast.success(tAdmin('status_updated'))
    } catch {
      setProducts(prev => prev.map(product => product.id === productId ? { ...product, [key]: current } : product))
      toast.error(tAdmin('update_error'))
    }
  }

  const deleteProduct = product => {
    setConfirm({
      open: true,
      title: tAdmin('delete_product_title'),
      message: tAdmin('delete_product_message', { name: product.name }),
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          await apiClient.delete(`/admin/products/${product.id}`)
          setProducts(prev => prev.filter(item => item.id !== product.id))
          toast.success(tAdmin('product_deleted'))
          setConfirm({ open: false })
        } finally {
          setConfirmLoading(false)
        }
      },
    })
  }

  const saveProduct = async form => {
    const payload = { ...form, sale_price: form.sale_price || null }
    if (editProduct) {
      await apiClient.put(`/admin/products/${editProduct.id}`, payload)
      toast.success(tAdmin('product_updated'))
    } else {
      await apiClient.post('/admin/products', payload)
      toast.success(tAdmin('product_added'))
    }
    await fetchProducts()
  }

  const moderateReview = async (id, action) => {
    if (action === 'delete') await apiClient.delete(`/admin/reviews/${id}`)
    else await apiClient.patch(`/admin/reviews/${id}/${action}`)
    toast.success(tAdmin('review_updated'))
    const res = await apiClient.get('/admin/reviews')
    setReviews(unwrap(res))
  }

  const unreadNotifications = notifications.filter(item => !item.read_at).length
  const badges = useMemo(() => ({
    pendingOrders: orderCounts.pending || stats?.metrics?.pending_orders || 0,
    notificationsUnread: unreadNotifications,
  }), [orderCounts, stats, unreadNotifications])

  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />

  if (loading) {
    return <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#161825] flex items-center justify-center"><Loader2 className="animate-spin text-[#D62300]" size={34} /></div>
  }

  let page = <AdminDashboard stats={stats} orders={orders} chartData={chartData} />
  if (location.pathname === '/admin/orders') page = <AdminOrdersPage orders={orders} counts={orderCounts} loading={tableLoading} meta={orderMeta} filters={orderFilters} setFilters={setOrderFilters} onStatusChange={updateOrderStatus} onPageChange={pageNum => { setOrderFilters(prev => ({ ...prev, page: pageNum })); fetchOrders({ ...orderFilters, page: pageNum }) }} />
  else if (location.pathname === '/admin/products') page = <AdminProductsPage products={products} categories={categories} loading={tableLoading} meta={productMeta} filters={productFilters} setFilters={setProductFilters} onToggleFlag={toggleProductFlag} onDelete={deleteProduct} onPageChange={pageNum => { setProductFilters(prev => ({ ...prev, page: pageNum })); fetchProducts({ ...productFilters, page: pageNum }) }} />
  else if (location.pathname === '/admin/products/create' || editMatch) page = <AdminProductFormPage key={editMatch ? `edit-product-${editMatch[1]}` : 'create-product'} categories={categories} itemId={editMatch?.[1]} editProduct={editProduct} onSave={saveProduct} />
  else if (location.pathname === '/admin/coupons') page = <AdminCouponsPage coupons={coupons} loading={tableLoading} onRefresh={fetchCoupons} />
  else if (location.pathname === '/admin/users') page = <AdminUsersPage users={users} loading={tableLoading} />
  else if (location.pathname === '/admin/reviews') page = <AdminReviewsPage reviews={reviews} loading={tableLoading} onModerate={moderateReview} />
  else if (location.pathname === '/admin/reports') page = <AdminReportsPage stats={stats} chartData={chartData} reportData={{ ...reportData, counts: orderCounts }} />
  else if (location.pathname === '/admin/categories') page = <GenericCrudPage {...crudPages.categories} />
  else if (location.pathname === '/admin/combos') page = <GenericCrudPage {...crudPages.combos} products={products} />
  else if (location.pathname === '/admin/toppings') page = <GenericCrudPage {...crudPages.toppings} categories={categories} />
  else if (location.pathname === '/admin/payments') page = <AdminPaymentsPage />
  else if (location.pathname === '/admin/loyalty') page = <AdminLoyaltyPage users={users} loading={tableLoading} />
  else if (location.pathname === '/admin/posts') page = <GenericCrudPage {...crudPages.posts} postCategories={postCategories} />
  else if (location.pathname === '/admin/banners') page = <GenericCrudPage {...crudPages.banners} />
  else if (location.pathname === '/admin/branches') page = <GenericCrudPage {...crudPages.branches} />
  else if (genericEditMatch) {
    const resource = genericEditMatch[1]
    const config = crudPages[resource]
    page = <GenericCrudFormPage key={`edit-${resource}-${genericEditMatch[2]}`} config={config} itemId={genericEditMatch[2]} products={products} categories={categories} postCategories={postCategories} />
  } else if (genericCreateMatch) {
    const resource = genericCreateMatch[1]
    const config = crudPages[resource]
    page = <GenericCrudFormPage key={`create-${resource}`} config={config} products={products} categories={categories} postCategories={postCategories} />
  }
  else if (location.pathname === '/admin/settings') page = <AdminSettingsDatabasePage />
  else if (location.pathname === '/admin/translations/locales') page = <AdminLanguageLocalesPage />
  else if (location.pathname === '/admin/notifications') page = <AdminNotificationsPage notifications={notifications} loading={notificationLoading} onMarkRead={markNotificationRead} />
  else if (location.pathname !== '/admin' && !genericEditMatch && !genericCreateMatch) navigate('/admin')

  return (
    <AdminLayout badges={badges} notifications={notifications} unreadNotifications={unreadNotifications}>
      {page}
      <ConfirmDialog open={confirm.open} title={confirm.title} message={confirm.message} onCancel={() => setConfirm({ open: false })} onConfirm={confirm.onConfirm} loading={confirmLoading} />
    </AdminLayout>
  )
}

export default AdminPanel
