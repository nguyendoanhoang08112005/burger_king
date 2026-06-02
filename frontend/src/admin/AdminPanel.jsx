import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  BarChart2,
  AlertCircle,
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
import AdminModal from '../components/admin/AdminModal'
import AdminSearch from '../components/admin/AdminSearch'
import AdminPagination from '../components/admin/AdminPagination'
import StatusBadge from '../components/admin/StatusBadge'
import { useAuthStore } from '../store/authStore'
import { formatDate, formatVND } from '../utils/format'
import { initDarkMode, toggleDarkMode } from '../utils/darkMode'

const apiOrigin = (apiClient.defaults.baseURL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')

const assetUrl = value => {
  if (!value) return ''
  if (/^(https?:)?\/\//.test(value) || value.startsWith('data:') || value.startsWith('blob:')) return value
  return `${apiOrigin}${value.startsWith('/') ? value : `/${value}`}`
}

const statusTabs = [
  { key: '', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'preparing', label: 'Đang chuẩn bị' },
  { key: 'delivering', label: 'Đang giao' },
  { key: 'delivered', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã huỷ' },
]

const statusLabels = {
  pending: 'Chờ xử lý',
  confirmed: 'Xác nhận',
  preparing: 'Đang chuẩn bị',
  delivering: 'Đang giao',
  delivered: 'Hoàn thành',
  cancelled: 'Đã huỷ',
}

const statusClasses = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300',
  preparing: 'bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300',
  delivering: 'bg-purple-100 text-purple-700 dark:bg-purple-400/15 dark:text-purple-300',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300',
}

const menuGroups = [
  {
    label: 'TỔNG QUAN',
    items: [
      { icon: LayoutDashboard, label: 'Bảng Điều Khiển', path: '/admin' },
      { icon: BarChart2, label: 'Báo Cáo Doanh Thu', path: '/admin/reports' },
    ],
  },
  {
    label: 'THỰC ĐƠN',
    items: [
      { icon: Utensils, label: 'Sản Phẩm', path: '/admin/products' },
      { icon: Layers, label: 'Danh Mục', path: '/admin/categories' },
      { icon: Gift, label: 'Combo Sets', path: '/admin/combos' },
      { icon: Tags, label: 'Toppings', path: '/admin/toppings' },
    ],
  },
  {
    label: 'BÁN HÀNG',
    items: [
      { icon: Package, label: 'Đơn Hàng', path: '/admin/orders', badgeKey: 'pendingOrders' },
      { icon: Percent, label: 'Mã Giảm Giá', path: '/admin/coupons' },
      { icon: CreditCard, label: 'Thanh Toán', path: '/admin/payments' },
    ],
  },
  {
    label: 'KHÁCH HÀNG',
    items: [
      { icon: Users, label: 'Người Dùng', path: '/admin/users' },
      { icon: Star, label: 'Đánh Giá', path: '/admin/reviews' },
      { icon: Target, label: 'Điểm Tích Lũy', path: '/admin/loyalty' },
    ],
  },
  {
    label: 'NỘI DUNG',
    items: [
      { icon: FileText, label: 'Blog / Bài Viết', path: '/admin/posts' },
      { icon: Image, label: 'Banners', path: '/admin/banners' },
      { icon: Building2, label: 'Chi Nhánh', path: '/admin/branches' },
    ],
  },
  {
    label: 'HỆ THỐNG',
    items: [
      { icon: Settings, label: 'Cài Đặt', path: '/admin/settings' },
      { icon: Bell, label: 'Thông Báo', path: '/admin/notifications' },
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

function EmptyTableRow({ colSpan, message = 'Không tìm thấy dữ liệu phù hợp.' }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-10 text-center text-sm text-gray-400">
        {message}
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
            Huỷ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminSidebar({ collapsed, onToggle, badges }) {
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
          <div key={group.label} className="mb-2">
            {!collapsed && (
              <p className="text-[10px] text-gray-400 uppercase tracking-[1px] px-5 pt-4 pb-1.5 font-semibold">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon
                const badge = item.badgeKey ? badges[item.badgeKey] : null

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'}
                    title={collapsed ? item.label : undefined}
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
                        {!collapsed && <span className="text-sm">{item.label}</span>}
                        {badge > 0 && !collapsed && (
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

function AdminTopbar() {
  const { user, setLogout } = useAuthStore()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(() => localStorage.getItem('adminDarkMode') === 'dark')

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

  return (
    <header className="h-[60px] bg-white dark:bg-[#1E2130] border-b border-gray-100 dark:border-gray-700 flex items-center px-6 gap-4 sticky top-0 z-30">
      <div className="relative flex-1 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Tìm kiếm..."
          className="w-full pl-9 pr-16 py-2 bg-gray-50 dark:bg-[#161825] rounded-xl text-sm border border-transparent focus:outline-none focus:border-red-200 dark:focus:border-red-500/50 focus:bg-white dark:focus:bg-[#1E2130] dark:text-gray-100 transition-all"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono">
          Ctrl+K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
        >
          <ExternalLink size={14} />
          Xem trang ngoài
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
        <button type="button" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2.5 pl-2 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-[#D62300] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-400">Quản trị viên</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ml-1"
            aria-label="Đăng xuất"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}

function AdminLayout({ children, badges }) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div className="admin-layout min-h-screen bg-[#F4F6F8] dark:bg-[#161825] text-gray-900 dark:text-gray-100">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} badges={badges} />
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${collapsed ? 'ml-[70px]' : 'ml-[260px]'}`}>
        <AdminTopbar />
        <main key={location.pathname} className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

function AdminPageShell({ title, eyebrow = 'Trang quản trị', action, onAction, children }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400 font-medium">{eyebrow}</p>
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
  const cards = [
    { label: 'Đơn Hàng', value: stats?.metrics?.pending_orders ?? 0, icon: ShoppingBag, gradient: 'from-[#00C9A7] to-[#00A67C]', badge: 'chờ xử lý' },
    { label: 'Sản Phẩm', value: stats?.metrics?.total_products ?? 0, icon: Layers, gradient: 'from-[#4E9FFF] to-[#2979FF]' },
    { label: 'Khách Hàng', value: stats?.metrics?.active_customers ?? 0, icon: Users, gradient: 'from-[#FF6B9D] to-[#E91E8C]' },
    { label: 'Doanh Thu', value: formatVND(stats?.metrics?.total_sales ?? 0), icon: BarChart2, gradient: 'from-[#FFB347] to-[#FF9500]' },
  ]

  const activities = orders.slice(0, 5).map(order => ({
    name: order.user?.name || 'Khách lẻ',
    role: order.user?.role === 'admin' ? 'quản trị viên' : 'khách hàng',
    action: `tạo đơn ${order.order_code}`,
    time: formatDate(order.created_at),
    ip: '127.0.0.1',
  }))

  return (
    <AdminPageShell title="Bảng Điều Khiển">
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
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Doanh Thu 7 Ngày Qua</h3>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="revenue" tick={{ fontSize: 12 }} tickFormatter={value => `${value / 1000}k`} />
            <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value, name) => [name === 'revenue' ? formatVND(value) : `${value} đơn`, name === 'revenue' ? 'Doanh thu' : 'Đơn hàng']} />
            <Legend />
            <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#D62300" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} name="revenue" />
            <Line yAxisId="orders" type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} name="orders" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)] gap-6">
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Đơn hàng gần đây</h3>
          <OrdersTable orders={orders.slice(0, 5)} compact />
        </div>
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Nhật Ký Hoạt Động</h3>
          <div className="space-y-4">
            {activities.map((act, index) => (
              <div key={`${act.time}-${index}`} className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-[#D62300]/10 text-[#D62300] flex items-center justify-center font-bold flex-shrink-0">
                  {act.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-100">
                    <span className="font-semibold">{act.name}</span>{' '}
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${act.role === 'quản trị viên' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
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
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700">
            <th className="py-3">Mã đơn</th>
            <th className="py-3">Khách hàng</th>
            <th className="py-3">Thời gian</th>
            <th className="py-3">Tổng tiền</th>
            <th className="py-3">Trạng thái</th>
            {!compact && <th className="py-3 text-right">Thao tác</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {orders.map(order => (
            <tr key={order.id} className="text-gray-700 dark:text-gray-200">
              <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">{order.order_code}</td>
              <td className="py-3">{order.user?.name || 'Khách lẻ'}</td>
              <td className="py-3 text-gray-500 dark:text-gray-400">{formatDate(order.created_at)}</td>
              <td className="py-3 font-semibold">{formatVND(order.total)}</td>
              <td className="py-3">
                {onStatusChange ? (
                  <select
                    value={order.status}
                    onChange={event => onStatusChange(order.id, event.target.value)}
                    className="text-xs border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-red-200"
                  >
                    {statusTabs.filter(tab => tab.key).map(tab => (
                      <option key={tab.key} value={tab.key}>{tab.label}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusClasses[order.status] || statusClasses.pending}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                )}
              </td>
              {!compact && (
                <td className="py-3 text-right">
                  <button type="button" onClick={() => onView?.(order)} className="inline-flex items-center gap-1 text-[#D62300] text-xs font-semibold hover:underline">
                    <Eye size={14} />
                    Xem
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

function OrderDetailModal({ order, onClose }) {
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
            <p className="text-xs text-gray-400">Chi tiết đơn hàng</p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{order.order_code}</h2>
          </div>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors">
            <X size={16} />
            Đóng
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-3">Sản phẩm</h3>
            <div className="space-y-3">
              {(order.items || []).map(item => (
                <div key={item.id} className="flex justify-between gap-4 text-sm border-b border-gray-100 dark:border-gray-700 pb-3">
                  <div>
                    <p className="font-semibold">{item.product_name}</p>
                    <p className="text-gray-500">SL: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatVND(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <h3 className="font-bold mb-3">Giao hàng</h3>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <p>{order.address?.name || order.user?.name}</p>
                <p>{order.address?.phone}</p>
                <p>{order.address?.full_address || order.address?.address}</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-3">Thanh toán</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Tạm tính</span><span>{formatVND(order.subtotal)}</span></div>
                <div className="flex justify-between"><span>Giảm giá</span><span>-{formatVND(order.discount || 0)}</span></div>
                <div className="flex justify-between"><span>Phí giao hàng</span><span>{formatVND(order.shipping_fee || 0)}</span></div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100 dark:border-gray-700"><span>Tổng cộng</span><span>{formatVND(order.total)}</span></div>
                <p className="text-gray-500">Phương thức: {order.payment_method}</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-3">Timeline</h3>
              <div className="flex flex-wrap gap-2">
                {statusTabs.filter(tab => tab.key).map(tab => (
                  <span key={tab.key} className={`text-xs px-2.5 py-1 rounded-full ${order.status === tab.key ? 'bg-[#D62300] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}>
                    {tab.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminOrdersPage({ orders, counts, loading, meta, filters, setFilters, onStatusChange, onPageChange }) {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const formatCount = value => Number.parseInt(Number(value || 0), 10)

  return (
    <AdminPageShell title="Đơn Hàng" action="Xuất CSV">
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
              {tab.label} <span className="opacity-70">({formatCount(tab.key ? counts[tab.key] : counts.total)})</span>
            </button>
          ))}
        </div>
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={filters.search}
            onChange={event => setFilters(prev => ({ ...prev, search: event.target.value, page: 1 }))}
            placeholder="Tìm mã đơn, tên khách..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </div>
        {loading ? <TableSkeleton rows={6} cols={6} /> : <OrdersTable orders={orders} onStatusChange={onStatusChange} onView={setSelectedOrder} />}
        <div className="flex justify-end">
          <Pagination page={meta.current_page} totalPages={meta.last_page} onChange={onPageChange} />
        </div>
      </div>
      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </AdminPageShell>
  )
}

function AdminProductsPage({ products, categories, loading, meta, filters, setFilters, onToggleFlag, onDelete, onPageChange }) {
  const navigate = useNavigate()

  return (
    <AdminPageShell title="Sản Phẩm" action="Thêm sản phẩm" onAction={() => navigate('/admin/products/create')}>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.search}
              onChange={event => setFilters(prev => ({ ...prev, search: event.target.value, page: 1 }))}
              placeholder="Tìm sản phẩm..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </div>
          <select
            value={filters.categoryId}
            onChange={event => setFilters(prev => ({ ...prev, categoryId: event.target.value, page: 1 }))}
            className="flex-1 min-w-[220px] border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <select
            value={filters.available}
            onChange={event => setFilters(prev => ({ ...prev, available: event.target.value, page: 1 }))}
            className="flex-1 min-w-[180px] border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Còn bán</option>
            <option value="false">Hết</option>
          </select>
          <button
            type="button"
            onClick={() => setFilters({ search: '', categoryId: '', available: '', page: 1 })}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>

        {loading ? <TableSkeleton rows={6} cols={7} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="py-3">Sản phẩm</th>
                  <th className="py-3">Danh mục</th>
                  <th className="py-3">Giá gốc</th>
                  <th className="py-3">Giá sale</th>
                  <th className="py-3">Nổi bật</th>
                  <th className="py-3">Trạng thái</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {products.map(product => (
                  <tr key={product.id} className="text-gray-700 dark:text-gray-200">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img src={assetUrl(product.thumbnail)} alt={product.name} className="w-11 h-11 object-cover rounded-lg bg-gray-100" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">{product.category?.name || 'N/A'}</td>
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
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button type="button" onClick={() => navigate(`/admin/products/${product.id}/edit`)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><Pencil size={15} /></button>
                        <button type="button" onClick={() => onDelete(product)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!products.length && <EmptyTableRow colSpan={7} />}
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

function AdminField({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-500 uppercase">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function AdminImageInput({ label = 'Ảnh', value, onChange }) {
  const fileInput = useRef(null)

  const handleUpload = async file => {
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)
    const { data } = await apiClient.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    onChange(assetUrl(data?.data?.url || data?.url))
    toast.success('Đã tải ảnh lên')
  }

  return (
    <div className="bg-white dark:bg-[#1E2130] rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">{label}</h3>
      <input
        value={value || ''}
        onChange={event => onChange(event.target.value)}
        placeholder="Dán URL ảnh hoặc upload bên dưới"
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
            <p className="text-sm text-gray-500">Kéo thả hoặc chọn ảnh</p>
          </div>
        )}
      </div>
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={event => handleUpload(event.target.files[0])} />
    </div>
  )
}

function AdminProductFormPage({ categories, editProduct, onSave }) {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: editProduct?.name || '',
    slug: editProduct?.slug || '',
    category_id: editProduct?.category_id || '',
    short_description: editProduct?.short_description || '',
    description: editProduct?.description || '',
    base_price: editProduct?.base_price || '',
    sale_price: editProduct?.sale_price || '',
    thumbnail: assetUrl(editProduct?.thumbnail) || '',
    is_featured: !!editProduct?.is_featured,
    is_available: editProduct?.is_available ?? true,
    sort_order: editProduct?.sort_order || 0,
    sizes: editProduct?.sizes?.length ? editProduct.sizes : [
      { size: 'S', extra_price: 0, is_available: true },
      { size: 'M', extra_price: 15000, is_available: true },
      { size: 'L', extra_price: 30000, is_available: true },
    ],
  })

  const update = (key, value) => setForm(prev => {
    const next = { ...prev, [key]: value }
    if (key === 'name' && !editProduct) next.slug = slugify(value)
    return next
  })

  const submit = async event => {
    event.preventDefault()
    setSaving(true)
    try {
      await onSave(form)
      navigate('/admin/products')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100'

  return (
    <AdminPageShell title={editProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'} action="Quay lại" onAction={() => navigate('/admin/products')}>
      <form onSubmit={submit} className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6">
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-4">
          <AdminField label="Tên sản phẩm"><input required value={form.name} onChange={e => update('name', e.target.value)} className={inputClass} /></AdminField>
          <AdminField label="Slug"><input value={form.slug} onChange={e => update('slug', e.target.value)} className={inputClass} /></AdminField>
          <AdminField label="Danh mục">
            <select required value={form.category_id} onChange={e => update('category_id', e.target.value)} className={inputClass}>
              <option value="">Chọn danh mục</option>
              {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </AdminField>
          <AdminField label="Mô tả ngắn"><textarea value={form.short_description} onChange={e => update('short_description', e.target.value)} className={inputClass} rows={3} /></AdminField>
          <AdminField label="Mô tả dài"><textarea value={form.description} onChange={e => update('description', e.target.value)} className={inputClass} rows={7} /></AdminField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminField label="Giá gốc"><input required type="number" value={form.base_price} onChange={e => update('base_price', e.target.value)} className={inputClass} /></AdminField>
            <AdminField label="Giá sale"><input type="number" value={form.sale_price || ''} onChange={e => update('sale_price', e.target.value)} className={inputClass} /></AdminField>
          </div>
          <AdminField label="Thứ tự"><input type="number" value={form.sort_order} onChange={e => update('sort_order', e.target.value)} className={inputClass} /></AdminField>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={e => update('is_featured', e.target.checked)} /> Nổi bật</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_available} onChange={e => update('is_available', e.target.checked)} /> Đang bán</label>
          </div>
          <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Sizes</h3>
              <button type="button" onClick={() => update('sizes', [...form.sizes, { size: 'XL', extra_price: 0, is_available: true }])} className="text-xs font-semibold text-[#D62300]">+ Thêm size</button>
            </div>
            {form.sizes.map((size, index) => (
              <div key={index} className="grid grid-cols-[90px_1fr_90px_40px] gap-2">
                <select value={size.size} onChange={e => update('sizes', form.sizes.map((row, i) => i === index ? { ...row, size: e.target.value } : row))} className={inputClass}>
                  {['S', 'M', 'L', 'XL'].map(option => <option key={option} value={option}>{option}</option>)}
                </select>
                <input type="number" value={size.extra_price} onChange={e => update('sizes', form.sizes.map((row, i) => i === index ? { ...row, extra_price: e.target.value } : row))} className={inputClass} />
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!size.is_available} onChange={e => update('sizes', form.sizes.map((row, i) => i === index ? { ...row, is_available: e.target.checked } : row))} /> Có bán</label>
                <button type="button" onClick={() => update('sizes', form.sizes.filter((_, i) => i !== index))} className="text-red-500">X</button>
              </div>
            ))}
          </div>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-[#D62300] text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">
            {saving && <Loader2 size={15} className="animate-spin" />}
            Lưu sản phẩm
          </button>
        </div>
        <AdminImageInput label="Ảnh sản phẩm" value={form.thumbnail} onChange={value => update('thumbnail', value)} />
      </form>
    </AdminPageShell>
  )
}

function AdminCouponsPage({ coupons, loading, onRefresh }) {
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
        toast.success('Đã cập nhật mã giảm giá')
      } else {
        await apiClient.post('/admin/coupons', payload())
        toast.success('Đã tạo mã giảm giá')
      }
      resetForm()
      await onRefresh()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không lưu được mã giảm giá')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async coupon => {
    try {
      await apiClient.put(`/admin/coupons/${coupon.id}`, { ...coupon, is_active: !coupon.is_active })
      toast.success(coupon.is_active ? 'Đã tắt mã giảm giá' : 'Đã kích hoạt mã giảm giá')
      await onRefresh()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không cập nhật được trạng thái')
    }
  }

  const deleteCoupon = coupon => {
    setConfirm({
      open: true,
      title: 'Xoá mã giảm giá?',
      message: `Bạn có chắc muốn xoá mã "${coupon.code}"? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          await apiClient.delete(`/admin/coupons/${coupon.id}`)
          toast.success('Đã xoá mã giảm giá')
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
    <AdminPageShell title="Mã Giảm Giá">
      <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6">
        <form onSubmit={submit} className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">{editingCoupon ? 'Sửa coupon' : 'Thêm coupon'}</h3>
            {editingCoupon && <button type="button" onClick={resetForm} className="text-xs font-semibold text-gray-500 hover:text-[#D62300]">Huỷ sửa</button>}
          </div>
          <div className="flex gap-2">
            <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CODE" className={inputClass} />
            <button type="button" onClick={generateCode} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-semibold">Random</button>
          </div>
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputClass}>
            <option value="percent">Percent</option>
            <option value="fixed">Fixed</option>
            <option value="free_ship">Free ship</option>
          </select>
          <input required type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="Giá trị" className={inputClass} />
          <input type="number" value={form.min_order} onChange={e => setForm({ ...form, min_order: e.target.value })} placeholder="Đơn tối thiểu" className={inputClass} />
          {form.type === 'percent' && <input type="number" value={form.max_discount} onChange={e => setForm({ ...form, max_discount: e.target.value })} placeholder="Giảm tối đa" className={inputClass} />}
          <input type="number" value={form.usage_limit} onChange={e => setForm({ ...form, usage_limit: e.target.value })} placeholder="Giới hạn lượt dùng" className={inputClass} />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })} className={inputClass} />
            <input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} className={inputClass} />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Đang hoạt động</label>
          <button disabled={saving} className="w-full bg-[#D62300] text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {editingCoupon ? 'Cập nhật coupon' : 'Lưu coupon'}
          </button>
        </form>
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm overflow-x-auto">
          <div className="flex flex-col md:flex-row gap-3 mb-5">
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm code, loại mã..." className={inputClass} />
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className={inputClass}>
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã tắt</option>
            </select>
          </div>
          {loading ? <TableSkeleton rows={6} cols={8} /> : (
            <table className="w-full text-left text-sm">
              <thead><tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="py-3">Code</th><th>Loại</th><th>Giá trị</th><th>Đơn tối thiểu</th><th>Đã dùng/Giới hạn</th><th>Hết hạn</th><th>Trạng thái</th><th>Actions</th>
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
                        {coupon.is_active ? 'Active' : 'Off'}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => editCoupon(coupon)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500" aria-label="Sửa coupon"><Pencil size={15} /></button>
                        <button type="button" onClick={() => deleteCoupon(coupon)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500" aria-label="Xoá coupon"><Trash2 size={15} /></button>
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
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')
  const filtered = users.filter(user => (!role || user.role === role) && [user.name, user.email, user.phone].join(' ').toLowerCase().includes(search.toLowerCase()))

  return (
    <AdminPageShell title="Người Dùng">
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, email, SĐT..." className="border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm" />
          <select value={role} onChange={e => setRole(e.target.value)} className="border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm">
            <option value="">Tất cả role</option><option value="customer">Khách hàng</option><option value="admin">Admin</option><option value="staff">Staff</option>
          </select>
        </div>
        {loading ? <TableSkeleton rows={6} cols={8} /> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead><tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700"><th className="py-3">Avatar</th><th>Tên</th><th>Email</th><th>SĐT</th><th>Role</th><th>Đơn hàng</th><th>Điểm</th><th>Ngày tạo</th></tr></thead>
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
  const [filter, setFilter] = useState('')
  const filtered = reviews.filter(review => filter === '' || (filter === 'approved' ? review.is_approved : !review.is_approved))

  return (
    <AdminPageShell title="Đánh Giá">
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex gap-2">
          {[['', 'Tất cả'], ['pending', 'Chờ duyệt'], ['approved', 'Đã duyệt']].map(([key, label]) => (
            <button key={key} type="button" onClick={() => setFilter(key)} className={`px-3 py-2 rounded-lg text-xs font-semibold ${filter === key ? 'bg-[#D62300] text-white' : 'bg-gray-50 dark:bg-[#161825]'}`}>{label}</button>
          ))}
        </div>
        {loading ? <TableSkeleton rows={6} cols={7} /> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead><tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700"><th className="py-3">Sản phẩm</th><th>Khách hàng</th><th>Rating</th><th>Nội dung</th><th>Trạng thái</th><th>Ngày</th><th>Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">{filtered.map(review => (
              <tr key={review.id}><td className="py-3 font-semibold">{review.product?.name}</td><td>{review.user?.name}</td><td className="text-yellow-500">{'★'.repeat(review.rating)}</td><td className="max-w-xs truncate">{review.comment}</td><td>{review.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}</td><td>{formatDate(review.created_at)}</td><td><div className="flex gap-2"><button onClick={() => onModerate(review.id, 'approve')} className="text-green-600 text-xs">Duyệt</button><button onClick={() => onModerate(review.id, 'hide')} className="text-orange-600 text-xs">Ẩn</button><button onClick={() => onModerate(review.id, 'delete')} className="text-red-600 text-xs">Xoá</button></div></td></tr>
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
  const topProducts = reportData.topProducts || stats?.top_products || []
  const topCustomers = reportData.topCustomers || []
  const statusData = reportData.statusData || statusTabs.filter(tab => tab.key).map(tab => ({ name: tab.label, value: reportData.counts?.[tab.key] || 0 }))
  const colors = ['#D62300', '#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444']
  const monthRevenue = chartData.reduce((sum, item) => sum + Number(item.revenue || 0), 0)
  const monthOrders = chartData.reduce((sum, item) => sum + Number(item.orders || 0), 0)
  const delivered = reportData.counts?.delivered || 0
  const total = reportData.counts?.total || 0

  const exportCSV = () => {
    const headers = ['Ngày', 'Doanh thu', 'Đơn hàng']
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
    <AdminPageShell title="Báo Cáo Doanh Thu" action={<><Download size={15} /> Xuất CSV</>} onAction={exportCSV}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          ['Tổng doanh thu tháng', formatVND(monthRevenue)],
          ['Tổng đơn hàng tháng', monthOrders],
          ['Khách hàng mới tháng', reportData.newCustomers || 0],
          ['Tỷ lệ hoàn thành', `${total ? Math.round((delivered / total) * 100) : 0}%`],
        ].map(([label, value]) => <div key={label} className="bg-white dark:bg-[#1E2130] rounded-2xl p-5 shadow-sm"><p className="text-sm text-gray-500">{label}</p><p className="text-2xl font-bold mt-1">{value}</p></div>)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)] gap-6">
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Doanh thu 30 ngày</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="revenue" tick={{ fontSize: 11 }} tickFormatter={value => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} />
              <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value, name) => [name === 'revenue' ? formatVND(value) : `${value} đơn`, name === 'revenue' ? 'Doanh thu' : 'Đơn hàng']} />
              <Legend />
              <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#D62300" strokeWidth={2} dot={false} name="revenue" />
              <Line yAxisId="orders" type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} dot={false} name="orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Đơn theo status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart><Pie data={statusData} dataKey="value" nameKey="name" outerRadius={95} label>{statusData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Top 10 sản phẩm bán chạy</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProducts}><CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Bar dataKey="quantity" fill="#D62300" radius={[8, 8, 0, 0]} /></BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm overflow-x-auto">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Top khách hàng</h3>
        <table className="w-full text-left text-sm"><thead><tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700"><th className="py-3">Khách hàng</th><th>Email</th><th>Đơn hàng</th><th>Tổng chi tiêu</th></tr></thead><tbody>{topCustomers.map(customer => <tr key={customer.id} className="border-b border-gray-100 dark:border-gray-700"><td className="py-3 font-semibold">{customer.name}</td><td>{customer.email}</td><td>{customer.orders_count}</td><td>{formatVND(customer.total_spent)}</td></tr>)}</tbody></table>
      </div>
    </AdminPageShell>
  )
}

const pluginLogos = {
  cod: { bg: '#F5F5F5', text: 'COD', color: '#1F2937' },
  loyalty_points: { bg: '#FFF8E1', text: '🎁', color: '#92400E' },
  vnpay: { bg: '#0066B3', text: 'VN', color: '#FFFFFF' },
  momo: { bg: '#AE2070', text: 'Mo', color: '#FFFFFF' },
  zalopay: { bg: '#0068FF', text: 'Za', color: '#FFFFFF' },
  sepay: { bg: '#FF6B00', text: 'Se', color: '#FFFFFF' },
  stripe: { bg: '#635BFF', text: 'St', color: '#FFFFFF' },
  paypal: { bg: '#003087', text: 'PP', color: '#FFFFFF' },
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
    { key: 'account_number', label: 'Số tài khoản', type: 'text' },
    { key: 'bank_code', label: 'Mã ngân hàng', type: 'text' },
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
    { key: 'mode', label: 'Môi trường', type: 'select', options: ['sandbox', 'live'] },
  ],
}

function PluginConfigModal({ plugin, onClose, onSave }) {
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
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Cấu hình {plugin.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Nhập credentials từ nhà cung cấp.</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors">
            <X size={16} />
            Đóng
          </button>
        </div>
        <div className="mx-5 mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-700">Các field đang bị mask bằng dấu • sẽ không bị ghi đè khi lưu.</p>
        </div>
        <div className="p-5 space-y-4">
          {fields.map(field => (
            <div key={field.key}>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5 block">{field.label}</label>
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
          <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#161825] border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Huỷ</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 text-sm text-white bg-[#D62300] rounded-xl hover:bg-[#b51e00] disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminPaymentsPage() {
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
      toast.success(data.message || 'Đã cập nhật')
    } catch {
      setPlugins(prev => prev.map(item => item.key === plugin.key ? { ...item, is_active: plugin.is_active } : item))
      toast.error('Lỗi cập nhật plugin')
    }
  }

  const saveConfig = async config => {
    await apiClient.put(`/admin/payment-plugins/${configModal.key}/config`, { config })
    toast.success('Đã lưu cấu hình')
    setConfigModal(null)
    await fetchPlugins()
  }

  return (
    <AdminPageShell title="Phương Thức Thanh Toán">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
        <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700"><strong>COD</strong> và <strong>Điểm tích lũy</strong> luôn hiển thị. Các plugin khác chỉ hiện ở checkout khi được bật.</p>
      </div>
      {loading ? (
        <TableSkeleton rows={4} cols={2} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plugins.map(plugin => {
            const logo = pluginLogos[plugin.key] || { bg: '#F5F5F5', text: plugin.name?.slice(0, 2), color: '#1F2937' }
            return (
              <div key={plugin.key} className={`bg-white dark:bg-[#1E2130] rounded-2xl border-2 p-5 transition-all ${plugin.is_active && !plugin.is_default ? 'border-green-200 shadow-md' : 'border-gray-100 dark:border-gray-700'}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm" style={{ background: logo.bg, color: logo.color }}>{logo.text}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{plugin.name}</h3>
                      {plugin.is_default && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Mặc định</span>}
                      {plugin.is_active && !plugin.is_default && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Đang hoạt động</span>}
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
                      <span className="text-sm text-gray-500">{plugin.is_active ? 'Bật' : 'Tắt'}</span>
                    </div>
                    <button onClick={() => setConfigModal(plugin)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <Settings size={14} />
                      Cấu hình
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
  const customers = users.filter(user => user.role === 'customer')
  const totalPoints = customers.reduce((sum, user) => sum + Number(user.loyalty_balance || 0), 0)
  const topCustomers = [...customers].sort((a, b) => Number(b.loyalty_balance || 0) - Number(a.loyalty_balance || 0)).slice(0, 10)

  return (
    <AdminPageShell title="Điểm Tích Lũy">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Khách hàng tham gia</p>
          <p className="text-3xl font-bold mt-1">{customers.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Tổng điểm đang lưu hành</p>
          <p className="text-3xl font-bold mt-1">{totalPoints}</p>
        </div>
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Quy đổi</p>
          <p className="text-3xl font-bold mt-1">1 = 100đ</p>
        </div>
      </div>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm overflow-x-auto">
        <h3 className="font-bold mb-4">Top khách hàng theo điểm</h3>
        {loading ? <TableSkeleton rows={6} cols={5} /> : (
          <table className="w-full text-left text-sm">
            <thead><tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700"><th className="py-3">Khách hàng</th><th>Email</th><th>SĐT</th><th>Đơn hàng</th><th>Điểm</th></tr></thead>
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

function AdminSettingsLegacyPage() {
  const defaultSettings = {
    storeName: 'Hamburger King',
    hotline: '1900 9999',
    supportEmail: 'support@hamburgerking.com',
    defaultShippingFee: 15000,
    freeShipThreshold: 300000,
    maintenanceMode: false,
  }
  const [settings, setSettings] = useState(() => {
    try {
      return { ...defaultSettings, ...(JSON.parse(localStorage.getItem('adminSettings') || '{}')) }
    } catch {
      return defaultSettings
    }
  })

  const updateSetting = (key, value) => setSettings(prev => ({ ...prev, [key]: value }))
  const saveSettings = () => {
    localStorage.setItem('adminSettings', JSON.stringify(settings))
    toast.success('Đã lưu cài đặt vận hành')
  }

  return (
    <AdminPageShell title="Cài Đặt" action="Lưu cài đặt" onAction={saveSettings}>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6">
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-4">
          <AdminField label="Tên cửa hàng"><input value={settings.storeName} onChange={event => updateSetting('storeName', event.target.value)} className={fieldInputClass} /></AdminField>
          <AdminField label="Hotline"><input value={settings.hotline} onChange={event => updateSetting('hotline', event.target.value)} className={fieldInputClass} /></AdminField>
          <AdminField label="Email hỗ trợ"><input value={settings.supportEmail} onChange={event => updateSetting('supportEmail', event.target.value)} className={fieldInputClass} /></AdminField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminField label="Phí giao hàng mặc định"><input type="number" value={settings.defaultShippingFee} onChange={event => updateSetting('defaultShippingFee', Number(event.target.value))} className={fieldInputClass} /></AdminField>
            <AdminField label="Ngưỡng miễn phí giao hàng"><input type="number" value={settings.freeShipThreshold} onChange={event => updateSetting('freeShipThreshold', Number(event.target.value))} className={fieldInputClass} /></AdminField>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.maintenanceMode} onChange={event => updateSetting('maintenanceMode', event.target.checked)} /> Bật chế độ bảo trì</label>
        </div>
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm h-fit">
          <h3 className="font-bold mb-3">Tóm tắt vận hành</h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex justify-between"><span>Cửa hàng</span><span className="font-semibold">{settings.storeName}</span></div>
            <div className="flex justify-between"><span>Phí ship</span><span className="font-semibold">{formatVND(settings.defaultShippingFee)}</span></div>
            <div className="flex justify-between"><span>Miễn phí từ</span><span className="font-semibold">{formatVND(settings.freeShipThreshold)}</span></div>
            <div className="flex justify-between"><span>Bảo trì</span><span className={settings.maintenanceMode ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>{settings.maintenanceMode ? 'Đang bật' : 'Đang tắt'}</span></div>
          </div>
        </div>
      </div>
    </AdminPageShell>
  )
}

AdminSettingsLegacyPage.displayName = 'AdminSettingsLegacyPage'

const settingTabs = [
  { key: 'general', label: 'Tổng quan', icon: Store },
  { key: 'shipping', label: 'Vận chuyển', icon: Truck },
  { key: 'appearance', label: 'Giao diện', icon: Palette },
  { key: 'notification', label: 'Thông báo', icon: Bell },
  { key: 'localization', label: 'Ngôn ngữ & tiền tệ', icon: Globe },
  { key: 'seo', label: 'SEO & Analytics', icon: Search },
  { key: 'loyalty', label: 'Điểm tích lũy', icon: Gift },
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

function AdminSettingsDatabasePage() {
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
      toast.error('Không tải được cài đặt')
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
      .catch(() => toast.error('Không tải được cài đặt'))
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await apiClient.put('/admin/settings', { settings })
      toast.success('Đã lưu cài đặt')
      await loadSettings()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi lưu cài đặt')
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
        <SettingInput label="Tên cửa hàng" value={settings['general.store_name']} onChange={value => updateSetting('general.store_name', value)} />
        <SettingInput label="Slogan" value={settings['general.store_tagline']} onChange={value => updateSetting('general.store_tagline', value)} />
        <SettingInput label="Hotline" value={settings['general.hotline']} onChange={value => updateSetting('general.hotline', value)} />
        <SettingInput label="Email hỗ trợ" value={settings['general.email']} onChange={value => updateSetting('general.email', value)} />
      </div>
      <SettingTextarea label="Mô tả cửa hàng" value={settings['general.store_description']} onChange={value => updateSetting('general.store_description', value)} />
      <SettingInput label="Địa chỉ" value={settings['general.address']} onChange={value => updateSetting('general.address', value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminImageInput label="Logo" value={settings['general.logo']} onChange={value => updateSetting('general.logo', value)} />
        <AdminImageInput label="Favicon" value={settings['general.favicon']} onChange={value => updateSetting('general.favicon', value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['facebook_url', 'instagram_url', 'youtube_url', 'tiktok_url', 'zalo_url', 'google_maps_key'].map(key => (
          <SettingInput key={key} label={key.replaceAll('_', ' ')} value={settings[`general.${key}`]} onChange={value => updateSetting(`general.${key}`, value)} />
        ))}
      </div>
      <SettingToggle label="Chế độ bảo trì" description="Frontend có thể đọc public settings để hiển thị thông báo bảo trì." checked={!!settings['general.maintenance_mode']} onChange={value => updateSetting('general.maintenance_mode', value)} />
      <SettingTextarea label="Thông báo bảo trì" value={settings['general.maintenance_message']} onChange={value => updateSetting('general.maintenance_message', value)} />
    </div>
  )

  const renderShipping = () => {
    const tiers = parseTiers()

    return (
      <div className="space-y-5">
        <SettingSelect label="Phương thức tính phí ship" value={settings['shipping.method'] || 'fixed'} onChange={value => updateSetting('shipping.method', value)} options={[{ value: 'fixed', label: 'Cố định' }, { value: 'distance', label: 'Theo khoảng cách' }, { value: 'free', label: 'Miễn phí tất cả' }]} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingInput label="Phí cơ bản" type="number" suffix="đ" value={settings['shipping.base_fee']} onChange={value => updateSetting('shipping.base_fee', value)} />
          <SettingInput label="Miễn phí từ đơn hàng" type="number" suffix="đ" value={settings['shipping.free_from_amount']} onChange={value => updateSetting('shipping.free_from_amount', value)} hint="Nhập 0 để không áp dụng" />
          <SettingInput label="Phí mỗi km" type="number" suffix="đ" value={settings['shipping.per_km_fee']} onChange={value => updateSetting('shipping.per_km_fee', value)} />
          <SettingInput label="Khoảng cách tối đa" type="number" suffix="km" value={settings['shipping.max_distance_km']} onChange={value => updateSetting('shipping.max_distance_km', value)} />
        </div>
        <SettingInput label="Địa chỉ cửa hàng chính" value={settings['shipping.store_address']} onChange={value => updateSetting('shipping.store_address', value)} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SettingInput label="Vĩ độ" type="number" value={settings['shipping.store_lat']} onChange={value => updateSetting('shipping.store_lat', value)} />
          <SettingInput label="Kinh độ" type="number" value={settings['shipping.store_lng']} onChange={value => updateSetting('shipping.store_lng', value)} />
          <SettingInput label="Thời gian dự kiến" value={settings['shipping.estimated_time']} onChange={value => updateSetting('shipping.estimated_time', value)} />
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Bảng giá theo khoảng cách</h3>
            <button type="button" onClick={() => updateTiers([...tiers, { max_km: 0, fee: 0 }])} className="text-sm font-semibold text-[#D62300]">+ Thêm mức</button>
          </div>
          <div className="space-y-2">
            {tiers.map((tier, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-3">
                <input type="number" value={tier.max_km} onChange={event => updateTiers(tiers.map((item, i) => i === index ? { ...item, max_km: Number(event.target.value) } : item))} className={fieldInputClass} placeholder="Đến km" />
                <input type="number" value={tier.fee} onChange={event => updateTiers(tiers.map((item, i) => i === index ? { ...item, fee: Number(event.target.value) } : item))} className={fieldInputClass} placeholder="Phí" />
                <button type="button" onClick={() => updateTiers(tiers.filter((_, i) => i !== index))} className="px-3 text-red-500 hover:bg-red-50 rounded-lg"><X size={16} /></button>
              </div>
            ))}
            {!tiers.length && <p className="text-sm text-gray-400">Chưa có mức phí theo khoảng cách.</p>}
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold mb-3">Test tính phí ship</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input type="number" value={testAddress.lat} onChange={event => setTestAddress(prev => ({ ...prev, lat: Number(event.target.value) }))} className={fieldInputClass} placeholder="Lat" />
            <input type="number" value={testAddress.lng} onChange={event => setTestAddress(prev => ({ ...prev, lng: Number(event.target.value) }))} className={fieldInputClass} placeholder="Lng" />
            <input type="number" value={testAddress.order_amount} onChange={event => setTestAddress(prev => ({ ...prev, order_amount: Number(event.target.value) }))} className={fieldInputClass} placeholder="Giá trị đơn" />
            <button type="button" onClick={calculateTestShipping} className="rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700">Tính phí</button>
          </div>
          {testResult && (
            <div className={`mt-3 rounded-xl p-3 text-sm ${testResult.out_of_range ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {testResult.out_of_range ? testResult.message : `Phí ship: ${testResult.is_free ? 'Miễn phí' : formatVND(testResult.fee || 0)}${testResult.distance_km ? ` - ${testResult.distance_km}km` : ''}`}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderAppearance = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SettingInput label="Màu chính" type="color" value={settings['appearance.primary_color']} onChange={value => updateSetting('appearance.primary_color', value)} />
        <SettingInput label="Màu phụ" type="color" value={settings['appearance.secondary_color']} onChange={value => updateSetting('appearance.secondary_color', value)} />
        <SettingSelect label="Font" value={settings['appearance.font_family']} onChange={value => updateSetting('appearance.font_family', value)} options={[{ value: 'DM Sans', label: 'DM Sans' }, { value: 'Inter', label: 'Inter' }, { value: 'Arial', label: 'Arial' }]} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminImageInput label="Hero image" value={settings['appearance.hero_image']} onChange={value => updateSetting('appearance.hero_image', value)} />
        <AdminImageInput label="Social share image" value={settings['appearance.og_image']} onChange={value => updateSetting('appearance.og_image', value)} />
      </div>
    </div>
  )

  const renderNotification = () => (
    <div className="space-y-5">
      <SettingToggle label="Email khi tạo đơn" checked={!!settings['notification.email_order_created']} onChange={value => updateSetting('notification.email_order_created', value)} />
      <SettingToggle label="Email khi đổi trạng thái đơn" checked={!!settings['notification.email_order_status']} onChange={value => updateSetting('notification.email_order_status', value)} />
      <SettingToggle label="Email khi có user mới" checked={!!settings['notification.email_new_user']} onChange={value => updateSetting('notification.email_new_user', value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput label="Admin email" value={settings['notification.admin_email']} onChange={value => updateSetting('notification.admin_email', value)} />
        <SettingSelect label="Email driver" value={settings['notification.email_driver']} onChange={value => updateSetting('notification.email_driver', value)} options={[{ value: 'smtp', label: 'SMTP' }, { value: 'mailgun', label: 'Mailgun' }, { value: 'ses', label: 'SES' }]} />
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
        <SettingSelect label="Ngôn ngữ mặc định" value={settings['localization.default_language']} onChange={value => updateSetting('localization.default_language', value)} options={[{ value: 'vi', label: 'Tiếng Việt' }, { value: 'en', label: 'English' }]} />
        <SettingSelect label="Múi giờ" value={settings['localization.timezone']} onChange={value => updateSetting('localization.timezone', value)} options={[{ value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho_Chi_Minh' }, { value: 'Asia/Bangkok', label: 'Asia/Bangkok' }, { value: 'UTC', label: 'UTC' }]} />
        <SettingSelect label="Tiền tệ" value={settings['localization.currency']} onChange={value => updateSetting('localization.currency', value)} options={[{ value: 'VND', label: 'VND' }, { value: 'USD', label: 'USD' }]} />
        <SettingInput label="Ký hiệu tiền tệ" value={settings['localization.currency_symbol']} onChange={value => updateSetting('localization.currency_symbol', value)} />
        <SettingSelect label="Vị trí ký hiệu" value={settings['localization.currency_position']} onChange={value => updateSetting('localization.currency_position', value)} options={[{ value: 'after', label: 'Sau số tiền' }, { value: 'before', label: 'Trước số tiền' }]} />
        <SettingSelect label="Định dạng số" value={settings['localization.number_format']} onChange={value => updateSetting('localization.number_format', value)} options={[{ value: 'dot', label: '1.000' }, { value: 'comma', label: '1,000' }]} />
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
      <SettingToggle label="Bật điểm tích lũy" checked={!!settings['loyalty.enabled']} onChange={value => updateSetting('loyalty.enabled', value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput label="VNĐ / 1 điểm tích" type="number" value={settings['loyalty.points_per_vnd']} onChange={value => updateSetting('loyalty.points_per_vnd', value)} />
        <SettingInput label="Giá trị 1 điểm" type="number" value={settings['loyalty.vnd_per_point']} onChange={value => updateSetting('loyalty.vnd_per_point', value)} />
        <SettingInput label="Điểm tối thiểu để đổi" type="number" value={settings['loyalty.min_redeem_points']} onChange={value => updateSetting('loyalty.min_redeem_points', value)} />
        <SettingInput label="Hết hạn sau" type="number" suffix="ngày" value={settings['loyalty.expiry_days']} onChange={value => updateSetting('loyalty.expiry_days', value)} />
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
      <AdminPageShell title="Cài Đặt">
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm"><TableSkeleton rows={7} cols={3} /></div>
      </AdminPageShell>
    )
  }

  return (
    <AdminPageShell title="Cài Đặt">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-300">Quản lý cài đặt toàn web, lưu trực tiếp vào database.</p>
        <button type="button" onClick={saveSettings} disabled={saving || !dirty} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${dirty ? 'bg-[#D62300] hover:bg-[#b51e00]' : 'bg-gray-300 cursor-not-allowed'}`}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {dirty ? 'Lưu thay đổi' : 'Đã lưu'}
        </button>
      </div>
      {dirty && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-500" />
          <p className="text-sm text-amber-700">Bạn có thay đổi chưa được lưu.</p>
        </div>
      )}
      <div className="grid grid-cols-1 xl:grid-cols-[250px_minmax(0,1fr)] gap-6">
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-2 shadow-sm h-fit">
          {settingTabs.map(tab => {
            const Icon = tab.icon
            return (
              <button type="button" key={tab.key} onClick={() => setActiveTab(tab.key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeTab === tab.key ? 'bg-red-50 dark:bg-red-500/10 text-[#D62300] font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">{settingTabs.find(tab => tab.key === activeTab)?.label}</h2>
          {tabContent[activeTab]?.()}
        </div>
      </div>
    </AdminPageShell>
  )
}

function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/notifications')
      setNotifications(Array.isArray(data) ? data : data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    apiClient.get('/notifications')
      .then(({ data }) => {
        if (!ignore) setNotifications(Array.isArray(data) ? data : data.data || [])
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const markRead = async id => {
    await apiClient.post(`/notifications/${id}/read`)
    toast.success('Đã đánh dấu đã đọc')
    await loadNotifications()
  }

  return (
    <AdminPageShell title="Thông Báo">
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm overflow-x-auto">
        {loading ? <TableSkeleton rows={6} cols={4} /> : (
          <table className="w-full text-left text-sm">
            <thead><tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700"><th className="py-3">Nội dung</th><th>Loại</th><th>Thời gian</th><th>Trạng thái</th><th className="text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map(item => <tr key={item.id}><td className="py-3 font-semibold">{item.title || item.message}</td><td>{item.type || '-'}</td><td>{formatDate(item.created_at)}</td><td>{item.read_at ? 'Đã đọc' : 'Chưa đọc'}</td><td className="text-right">{!item.read_at && <button onClick={() => markRead(item.id)} className="text-xs font-semibold text-[#D62300]">Đánh dấu đọc</button>}</td></tr>)}
              {!notifications.length && <EmptyTableRow colSpan={5} />}
            </tbody>
          </table>
        )}
      </div>
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

function GenericCrudPage({ title, endpoint, columns, fields, filters = [], defaults = {}, transformSubmit, products = [], categories = [], postCategories = [] }) {
  const crud = useCrud(endpoint)
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState({})
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [form, setForm] = useState(defaults)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState({ open: false })
  const [confirmLoading, setConfirmLoading] = useState(false)
  const debouncedSearch = useDebounce(search)

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

  const openCreate = () => {
    setSelectedItem(null)
    setForm(defaults)
    setModalOpen(true)
  }

  const openEdit = item => {
    setSelectedItem(item)
    setForm({ ...defaults, ...item })
    setModalOpen(true)
  }

  const updateField = (key, value) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'name' || key === 'title') {
        const slugField = fields.find(field => field.key === 'slug')
        if (slugField && !selectedItem) next.slug = slugify(value)
      }
      return next
    })
  }

  const submit = async event => {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = transformSubmit ? transformSubmit(form) : form
      if (selectedItem) await crud.update(selectedItem.id, payload)
      else await crud.create(payload)
      setModalOpen(false)
      await crud.fetchAll(fetchParams)
    } catch {
      toast.error('Không lưu được dữ liệu')
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = item => {
    setConfirm({
      open: true,
      title: 'Xoá dữ liệu?',
      message: `Bạn có chắc muốn xoá "${item.name || item.title || item.code}"?`,
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
      toast.success('Đã cập nhật trạng thái')
    } catch {
      crud.setData(current => current.map(row => row.id === item.id ? { ...row, [key]: item[key] } : row))
      toast.error('Lỗi cập nhật')
    }
  }

  const enhancedColumns = columns.map(column => {
    if (column.toggleKey) {
      return {
        ...column,
        render: item => <ToggleCell checked={!!item[column.toggleKey]} onToggle={() => patchItem(item, column.toggleKey)} />,
      }
    }
    return column
  })

  const renderField = field => {
    if (field.type === 'textarea') {
      return <textarea value={form[field.key] || ''} onChange={e => updateField(field.key, e.target.value)} rows={field.rows || 3} className={fieldInputClass} required={field.required} maxLength={field.maxLength} />
    }
    if (field.type === 'select') {
      const options = typeof field.options === 'function' ? field.options({ products }) : field.options
      return (
        <select value={form[field.key] || ''} onChange={e => updateField(field.key, e.target.value)} className={fieldInputClass} required={field.required}>
          <option value="">Chọn...</option>
          {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      )
    }
    if (field.type === 'checkbox') {
      return <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form[field.key]} onChange={e => updateField(field.key, e.target.checked)} /> {field.checkLabel || field.label}</label>
    }
    if (field.type === 'categoryMultiSelect') {
      const selected = Array.isArray(form[field.key]) ? form[field.key].map(Number) : []
      return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 mb-3">Không chọn danh mục nào = áp dụng cho tất cả sản phẩm.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {categories.map(category => {
              const id = Number(category.id)
              const checked = selected.includes(id)
              return (
                <label key={category.id} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm border transition ${checked ? 'border-[#D62300] bg-red-50 text-[#D62300]' : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={event => {
                      const next = event.target.checked
                        ? [...selected, id]
                        : selected.filter(value => value !== id)
                      updateField(field.key, next)
                    }}
                  />
                  {category.name}
                </label>
              )
            })}
          </div>
        </div>
      )
    }
    if (field.type === 'image') {
      return <AdminImageInput label={field.label} value={form[field.key] || ''} onChange={value => updateField(field.key, value)} />
    }
    if (field.type === 'comboItems') {
      const items = form.items || []
      return (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-[minmax(0,1fr)_80px_90px_40px] gap-2">
              <select value={item.product_id || ''} onChange={e => updateField('items', items.map((row, i) => i === index ? { ...row, product_id: e.target.value } : row))} className={fieldInputClass}>
                <option value="">Sản phẩm</option>
                {products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
              </select>
              <select value={item.size || 'S'} onChange={e => updateField('items', items.map((row, i) => i === index ? { ...row, size: e.target.value } : row))} className={fieldInputClass}>
                {['S', 'M', 'L', 'XL'].map(size => <option key={size} value={size}>{size}</option>)}
              </select>
              <input type="number" value={item.quantity || 1} onChange={e => updateField('items', items.map((row, i) => i === index ? { ...row, quantity: Number(e.target.value) } : row))} className={fieldInputClass} />
              <button type="button" onClick={() => updateField('items', items.filter((_, i) => i !== index))} className="text-red-500">X</button>
            </div>
          ))}
          <button type="button" onClick={() => updateField('items', [...items, { product_id: '', size: 'S', quantity: 1 }])} className="text-sm font-semibold text-[#D62300]">+ Thêm món</button>
        </div>
      )
    }
    return <input type={field.type || 'text'} value={form[field.key] || ''} onChange={e => updateField(field.key, e.target.value)} className={fieldInputClass} required={field.required} readOnly={field.readOnly} maxLength={field.maxLength} />
  }

  return (
    <AdminPageShell title={title} action="Thêm mới" onAction={openCreate}>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row gap-3">
          <AdminSearch value={search} onChange={value => { setSearch(value); setPage(1) }} placeholder={`Tìm ${title.toLowerCase()}...`} className="relative flex-1 min-w-[260px]" />
          {filters.map(filter => (
            <select key={filter.key} value={filterValues[filter.key] || ''} onChange={e => { setFilterValues(prev => ({ ...prev, [filter.key]: e.target.value })); setPage(1) }} className={`${fieldInputClass} flex-1 min-w-[220px]`}>
              <option value="">{filter.label}</option>
              {(typeof filter.options === 'function' ? filter.options({ categories, products, postCategories, data: crud.data }) : filter.options).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          ))}
          <button type="button" onClick={() => { setSearch(''); setFilterValues({}); setPage(1) }} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Reset</button>
        </div>
        {crud.error && <p className="text-sm text-red-500">{crud.error}</p>}
        <AdminTable columns={enhancedColumns} data={crud.data} loading={crud.loading} onEdit={openEdit} onDelete={deleteItem} />
        <div className="flex justify-end">
          <AdminPagination page={crud.meta?.current_page || page} totalPages={crud.meta?.last_page || 1} onChange={setPage} />
        </div>
      </div>
      <AdminModal open={modalOpen} title={selectedItem ? `Sửa ${title}` : `Thêm ${title}`} onClose={() => setModalOpen(false)} onSubmit={submit} loading={saving}>
        {fields.map(field => (
          field.type === 'image'
            ? <div key={field.key}>{renderField(field)}</div>
            : (
              <AdminField key={field.key} label={field.label}>
                {renderField(field)}
              </AdminField>
            )
        ))}
      </AdminModal>
      <ConfirmDialog open={confirm.open} title={confirm.title} message={confirm.message} onCancel={() => setConfirm({ open: false })} onConfirm={confirm.onConfirm} loading={confirmLoading} />
    </AdminPageShell>
  )
}

const toppingIcon = category => category === 'cheese' ? '🧀' : category === 'meat' ? '🥓' : category === 'veggie' ? '🧅' : '🏺'

const imageThumb = (src, size = 'w-12 h-12', fallback = null) => (
  src ? <img src={assetUrl(src)} alt="" className={`${size} object-cover rounded-lg bg-gray-100`} /> : <div className={`${size} rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg`}>{fallback}</div>
)

const crudPages = {
  categories: {
    title: 'Danh Mục',
    endpoint: '/admin/categories',
    defaults: { name: '', slug: '', description: '', image: '', sort_order: 0, is_active: true },
    columns: [
      { key: 'image', label: 'Ảnh', render: item => imageThumb(item.image, 'w-10 h-10') },
      { key: 'name', label: 'Tên danh mục' },
      { key: 'slug', label: 'Slug' },
      { key: 'products_count', label: 'Số sản phẩm' },
      { key: 'sort_order', label: 'Thứ tự' },
      { key: 'is_active', label: 'Trạng thái', toggleKey: 'is_active' },
    ],
    fields: [
      { key: 'name', label: 'Tên', required: true },
      { key: 'slug', label: 'Slug' },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
      { key: 'image', label: 'Ảnh', type: 'image' },
      { key: 'sort_order', label: 'Thứ tự sắp xếp', type: 'number' },
      { key: 'is_active', label: 'Kích hoạt', type: 'checkbox' },
    ],
  },
  combos: {
    title: 'Combo Sets',
    endpoint: '/admin/combos',
    defaults: { name: '', slug: '', description: '', image: '', price: '', is_active: true, items: [] },
    columns: [
      { key: 'image', label: 'Ảnh', render: item => imageThumb(item.image) },
      { key: 'name', label: 'Tên combo', render: item => <div><p className="font-semibold">{item.name}</p><p className="text-xs text-gray-400">{item.slug}</p></div> },
      { key: 'price', label: 'Giá combo', render: item => formatVND(item.price) },
      { key: 'items_count', label: 'Số món' },
      { key: 'is_active', label: 'Kích hoạt', toggleKey: 'is_active' },
    ],
    fields: [
      { key: 'name', label: 'Tên', required: true },
      { key: 'slug', label: 'Slug' },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
      { key: 'price', label: 'Giá', type: 'number', required: true },
      { key: 'image', label: 'Ảnh', type: 'image' },
      { key: 'items', label: 'Danh sách món trong combo', type: 'comboItems' },
      { key: 'is_active', label: 'Kích hoạt', type: 'checkbox' },
    ],
  },
  toppings: {
    title: 'Toppings',
    endpoint: '/admin/toppings',
    defaults: { name: '', category: 'sauce', category_ids: [], price: '', image: '', is_available: true },
    filters: [
      { key: 'category', label: 'Tất cả loại', options: [
        { value: 'sauce', label: 'Sốt' }, { value: 'cheese', label: 'Phô mai' }, { value: 'veggie', label: 'Rau củ' }, { value: 'meat', label: 'Thịt' },
      ] },
      { key: 'category_id', label: 'Tất cả danh mục áp dụng', options: ({ categories }) => categories.map(category => ({ value: category.id, label: category.name })) },
    ],
    columns: [
      { key: 'image', label: 'Ảnh', render: item => imageThumb(item.image, 'w-10 h-10', toppingIcon(item.category)) },
      { key: 'name', label: 'Tên topping' },
      { key: 'category', label: 'Loại', render: item => <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">{item.category}</span> },
      { key: 'category_ids', label: 'Áp dụng', render: item => item.category_ids?.length ? `${item.category_ids.length} danh mục` : 'Tất cả' },
      { key: 'price', label: 'Giá', render: item => formatVND(item.price) },
      { key: 'is_available', label: 'Còn bán', toggleKey: 'is_available' },
    ],
    fields: [
      { key: 'name', label: 'Tên', required: true },
      { key: 'category', label: 'Loại', type: 'select', required: true, options: [
        { value: 'sauce', label: 'Sốt' }, { value: 'cheese', label: 'Phô mai' }, { value: 'veggie', label: 'Rau củ' }, { value: 'meat', label: 'Thịt' },
      ] },
      { key: 'category_ids', label: 'Danh mục sản phẩm áp dụng', type: 'categoryMultiSelect' },
      { key: 'price', label: 'Giá', type: 'number', required: true },
      { key: 'image', label: 'Ảnh', type: 'image' },
      { key: 'is_available', label: 'Còn bán', type: 'checkbox' },
    ],
  },
  banners: {
    title: 'Banners',
    endpoint: '/admin/banners',
    defaults: { title: '', subtitle: '', image: '', link: '', position: 'hero', sort_order: 0, starts_at: '', expires_at: '', is_active: true },
    filters: [{ key: 'position', label: 'Tất cả vị trí', options: [{ value: 'hero', label: 'Hero' }, { value: 'popup', label: 'Popup' }, { value: 'sidebar', label: 'Sidebar' }] }],
    columns: [
      { key: 'image', label: 'Preview', render: item => imageThumb(item.image, 'w-20 h-12') },
      { key: 'title', label: 'Tiêu đề' },
      { key: 'position', label: 'Vị trí', render: item => <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs">{item.position}</span> },
      { key: 'sort_order', label: 'Thứ tự' },
      { key: 'expires_at', label: 'Hiệu lực', render: item => `${item.starts_at ? formatDate(item.starts_at) : '-'} - ${item.expires_at ? formatDate(item.expires_at) : '-'}` },
      { key: 'is_active', label: 'Kích hoạt', toggleKey: 'is_active' },
    ],
    fields: [
      { key: 'title', label: 'Tiêu đề', required: true },
      { key: 'subtitle', label: 'Phụ đề' },
      { key: 'image', label: 'Ảnh', type: 'image', required: true },
      { key: 'link', label: 'Link đích' },
      { key: 'position', label: 'Vị trí', type: 'select', required: true, options: [{ value: 'hero', label: 'Hero' }, { value: 'popup', label: 'Popup' }, { value: 'sidebar', label: 'Sidebar' }] },
      { key: 'sort_order', label: 'Thứ tự', type: 'number' },
      { key: 'starts_at', label: 'Ngày bắt đầu', type: 'date' },
      { key: 'expires_at', label: 'Ngày kết thúc', type: 'date' },
      { key: 'is_active', label: 'Kích hoạt', type: 'checkbox' },
    ],
  },
  branches: {
    title: 'Chi Nhánh',
    endpoint: '/admin/branches',
    defaults: { name: '', address: '', phone: '', open_time: '08:00', close_time: '22:00', lat: '', lng: '', is_active: true },
    columns: [
      { key: 'name', label: 'Tên chi nhánh' },
      { key: 'address', label: 'Địa chỉ' },
      { key: 'phone', label: 'SĐT' },
      { key: 'open_time', label: 'Giờ mở / đóng', render: item => `${item.open_time} - ${item.close_time}` },
      { key: 'is_active', label: 'Hoạt động', toggleKey: 'is_active' },
    ],
    fields: [
      { key: 'name', label: 'Tên', required: true },
      { key: 'address', label: 'Địa chỉ', required: true },
      { key: 'phone', label: 'SĐT', required: true },
      { key: 'open_time', label: 'Giờ mở cửa', type: 'time', required: true },
      { key: 'close_time', label: 'Giờ đóng cửa', type: 'time', required: true },
      { key: 'lat', label: 'Vĩ độ', type: 'number' },
      { key: 'lng', label: 'Kinh độ', type: 'number' },
      { key: 'is_active', label: 'Hoạt động', type: 'checkbox' },
    ],
  },
  posts: {
    title: 'Blog / Bài Viết',
    endpoint: '/admin/posts',
    defaults: { title: '', slug: '', excerpt: '', thumbnail: '', category: '', read_time: 5, video_url: '', content: '', is_published: true, published_at: '' },
    filters: [
      { key: 'status', label: 'Tất cả trạng thái', options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }] },
      {
        key: 'category',
        label: 'Tất cả danh mục',
        options: ({ postCategories }) => (postCategories || [])
          .map(category => ({ value: category, label: category })),
      },
    ],
    columns: [
      { key: 'thumbnail', label: 'Ảnh', render: item => imageThumb(item.thumbnail, 'w-16 h-10') },
      { key: 'title', label: 'Tiêu đề', render: item => <div><p className="font-semibold">{item.title}</p><p className="text-xs text-gray-400">{item.slug}</p></div> },
      { key: 'category', label: 'Danh mục blog' },
      { key: 'read_time', label: 'Đọc', render: item => `${item.read_time} phút` },
      { key: 'is_published', label: 'Trạng thái', render: item => <StatusBadge status={item.is_published ? 'published' : 'draft'} /> },
      { key: 'published_at', label: 'Ngày đăng', render: item => item.published_at ? formatDate(item.published_at) : '-' },
    ],
    fields: [
      { key: 'title', label: 'Tiêu đề', required: true },
      { key: 'slug', label: 'Slug' },
      { key: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 2, required: true, maxLength: 200 },
      { key: 'thumbnail', label: 'Ảnh thumbnail', type: 'image', required: true },
      { key: 'category', label: 'Danh mục', required: true },
      { key: 'read_time', label: 'Thời gian đọc', type: 'number' },
      { key: 'video_url', label: 'URL video YouTube' },
      { key: 'content', label: 'Nội dung', type: 'textarea', rows: 10, required: true },
      { key: 'is_published', label: 'Published', type: 'checkbox' },
      { key: 'published_at', label: 'Ngày đăng', type: 'date' },
    ],
  },
}

function AdminPanel() {
  const { user } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const editMatch = location.pathname.match(/^\/admin\/products\/(\d+)\/edit$/)

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
      } else if (path === '/admin/combos') {
        await fetchProducts({ search: '', categoryId: '', available: '', page: 1 })
      } else if (path === '/admin/toppings') {
        await fetchCategories()
      } else if (path === '/admin/posts') {
        await fetchPostCategories()
      } else if (path === '/admin/loyalty') {
        await fetchUsers()
      }
      if (!ignore) setLoading(false)
    }

    loadRouteData()
      .catch(error => {
        console.error(error)
        toast.error('Không tải được dữ liệu admin')
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, location.pathname])

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
    apiClient.get(`/admin/products/${id}`).then(res => setEditProduct(unwrap(res))).catch(() => toast.error('Không tìm thấy sản phẩm'))
  }, [editMatch, products])

  const updateOrderStatus = async (orderId, status) => {
    await apiClient.patch(`/admin/orders/${orderId}/status`, { status })
    toast.success('Đã cập nhật trạng thái đơn hàng')
    fetchOrders()
    fetchDashboard()
  }

  const toggleProductFlag = async (productId, key, current) => {
    setProducts(prev => prev.map(product => product.id === productId ? { ...product, [key]: !current } : product))
    try {
      await apiClient.patch(`/admin/products/${productId}`, { [key]: !current })
      toast.success('Đã cập nhật trạng thái')
    } catch {
      setProducts(prev => prev.map(product => product.id === productId ? { ...product, [key]: current } : product))
      toast.error('Lỗi cập nhật')
    }
  }

  const deleteProduct = product => {
    setConfirm({
      open: true,
      title: 'Xoá sản phẩm?',
      message: `Bạn có chắc muốn xoá "${product.name}"? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          await apiClient.delete(`/admin/products/${product.id}`)
          setProducts(prev => prev.filter(item => item.id !== product.id))
          toast.success('Đã xoá sản phẩm')
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
      toast.success('Đã cập nhật sản phẩm')
    } else {
      await apiClient.post('/admin/products', payload)
      toast.success('Đã thêm sản phẩm')
    }
    await fetchProducts()
  }

  const moderateReview = async (id, action) => {
    if (action === 'delete') await apiClient.delete(`/admin/reviews/${id}`)
    else await apiClient.patch(`/admin/reviews/${id}/${action}`)
    toast.success('Đã cập nhật đánh giá')
    const res = await apiClient.get('/admin/reviews')
    setReviews(unwrap(res))
  }

  const badges = useMemo(() => ({ pendingOrders: orderCounts.pending || stats?.metrics?.pending_orders || 0 }), [orderCounts, stats])

  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />

  if (loading) {
    return <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#161825] flex items-center justify-center"><Loader2 className="animate-spin text-[#D62300]" size={34} /></div>
  }

  let page = <AdminDashboard stats={stats} orders={orders} chartData={chartData} />
  if (location.pathname === '/admin/orders') page = <AdminOrdersPage orders={orders} counts={orderCounts} loading={tableLoading} meta={orderMeta} filters={orderFilters} setFilters={setOrderFilters} onStatusChange={updateOrderStatus} onPageChange={pageNum => { setOrderFilters(prev => ({ ...prev, page: pageNum })); fetchOrders({ ...orderFilters, page: pageNum }) }} />
  else if (location.pathname === '/admin/products') page = <AdminProductsPage products={products} categories={categories} loading={tableLoading} meta={productMeta} filters={productFilters} setFilters={setProductFilters} onToggleFlag={toggleProductFlag} onDelete={deleteProduct} onPageChange={pageNum => { setProductFilters(prev => ({ ...prev, page: pageNum })); fetchProducts({ ...productFilters, page: pageNum }) }} />
  else if (location.pathname === '/admin/products/create' || editMatch) page = <AdminProductFormPage key={editProduct?.id || 'create-product'} categories={categories} editProduct={editProduct} onSave={saveProduct} />
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
  else if (location.pathname === '/admin/settings') page = <AdminSettingsDatabasePage />
  else if (location.pathname === '/admin/notifications') page = <AdminNotificationsPage />
  else if (location.pathname !== '/admin') navigate('/admin')

  return (
    <AdminLayout badges={badges}>
      {page}
      <ConfirmDialog open={confirm.open} title={confirm.title} message={confirm.message} onCancel={() => setConfirm({ open: false })} onConfirm={confirm.onConfirm} loading={confirmLoading} />
    </AdminLayout>
  )
}

export default AdminPanel
