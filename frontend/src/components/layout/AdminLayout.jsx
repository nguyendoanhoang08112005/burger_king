import { useEffect, useState, useRef, useMemo } from 'react'
import { Link, NavLink, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
import apiClient from '../../api/axios'
import LanguageSwitcher from '../LanguageSwitcher'
import { formatDate } from '../../utils/format'
import { initDarkMode, toggleDarkMode } from '../../utils/darkMode'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  Search,
  ExternalLink,
  Info,
  Loader2,
  LayoutDashboard,
  BarChart2,
  Utensils,
  Layers,
  Gift,
  Tags,
  Package,
  AlertCircle,
  Percent,
  CreditCard,
  Users,
  Star,
  Target,
  FileText,
  Image,
  Building2,
  Settings,
  Globe,
  Mail,
  Bot,
  X,
  Menu,
} from 'lucide-react'
import {
  assetUrl,
  logoSizeValue,
  playNotificationSound,
  useAdminText,
  unwrapNotifications,
  notificationData,
  notificationTitle,
  notificationBody,
} from '../../utils/adminUtils'

export function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#161825] flex items-center justify-center"><Loader2 className="animate-spin text-[#D62300]" size={34} /></div>
  }

  if (!isAuthenticated || !user || !['admin', 'staff'].includes(user.role)) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

export const adminPermissionModules = [
  'dashboard', 'reports', 'orders', 'products', 'categories', 'combos', 'toppings',
  'coupons', 'payments', 'users', 'reviews', 'loyalty', 'complaints', 'posts', 'post-categories', 'post-tags', 'banners',
  'branches', 'settings', 'languages', 'notifications', 'chatbot', 'contacts',
]

export const adminPathModule = path => {
  const segment = path.split('/').filter(Boolean)[1] || 'dashboard'
  return segment === 'translations' ? 'languages' : segment
}

export const canAccessAdminModule = (user, module) => user?.role === 'admin' || user?.permissions?.includes(`access.${module}`)

export const menuGroups = [
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
      { icon: Mail, labelKey: 'contacts', path: '/admin/contacts' },
      { icon: AlertCircle, labelKey: 'complaints', path: '/admin/complaints', badgeKey: 'pendingComplaints' },
      { icon: Target, labelKey: 'loyalty', path: '/admin/loyalty' },
    ],
  },
  {
    labelKey: 'group_content',
    items: [
      { icon: FileText, labelKey: 'posts', path: '/admin/posts' },
      { icon: Layers, labelKey: 'post-categories', path: '/admin/post-categories' },
      { icon: Tags, labelKey: 'post-tags', path: '/admin/post-tags' },
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
      { icon: Bot, labelKey: 'chatbot_sidebar', path: '/admin/chat' },
    ],
  },
]

const formatBadgeCount = value => {
  const count = Number.parseInt(Number(value || 0), 10)
  if (!Number.isFinite(count) || count <= 0) return null
  return count > 99 ? '99+' : String(count)
}


export function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }) {
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

export function AdminSidebar({ collapsed, onToggle, badges, mobileOpen, onClose }) {
  const tAdmin = useAdminText()
  const { user } = useAuthStore()
  const logo = useUiStore(state => state.publicSettings['general.admin_logo'])
  const logoWidth = useUiStore(state => state.publicSettings['general.admin_logo_width'])
  const logoHeight = useUiStore(state => state.publicSettings['general.admin_logo_height'])
  const storeName = useUiStore(state => state.publicSettings['general.store_name'])

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white dark:bg-[#1E2130] border-r border-[#F0F0F0] dark:border-gray-700 shadow-[2px_0_8px_rgba(0,0,0,0.04)] transition-all duration-300 z-50 lg:z-40 ${mobileOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full lg:translate-x-0'} ${collapsed ? 'lg:w-[70px]' : 'lg:w-[260px]'}`}>
      <div className="h-[60px] flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        {(!collapsed || mobileOpen) && (
          <Link to="/admin" className="inline-flex h-10 w-[190px] min-w-0 items-center overflow-hidden text-[#D62300] font-bold text-lg tracking-wide">
            {logo ? (
              <img
                src={assetUrl(logo)}
                alt={storeName || 'Hamburger King'}
                style={{
                  width: logoSizeValue(logoWidth, '190px'),
                  height: logoSizeValue(logoHeight, '40px'),
                }}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <img
                src="/logo.svg"
                alt={storeName || 'Hamburger King'}
                style={{
                  width: logoSizeValue(logoWidth, '190px'),
                  height: logoSizeValue(logoHeight, '40px'),
                }}
                className="max-h-full max-w-full object-contain"
              />
            )}
          </Link>
        )}
        <button
          type="button"
          onClick={mobileOpen ? onClose : onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors ml-auto"
          aria-label={mobileOpen ? "Close menu" : "Toggle sidebar"}
        >
          {mobileOpen ? <X size={18} /> : collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="h-[calc(100vh-60px)] overflow-y-auto py-3">
        {menuGroups.filter(group => group.items.some(item => canAccessAdminModule(user, adminPathModule(item.path)))).map(group => (
          <div key={group.labelKey} className="mb-2">
            {!collapsed && (
              <p className="text-[10px] text-gray-400 uppercase tracking-[1px] px-5 pt-4 pb-1.5 font-semibold">
                {tAdmin(group.labelKey)}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.filter(item => canAccessAdminModule(user, adminPathModule(item.path))).map(item => {
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

export function AdminTopbar({ notifications = [], unreadCount = 0, onMenuToggle }) {
  const { user, setLogout } = useAuthStore()
  const navigate = useNavigate()
  const tAdmin = useAdminText()
  const [isDark, setIsDark] = useState(() => localStorage.getItem('adminDarkMode') === 'dark')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const searchInputRef = useRef(null)
  const searchContainerRef = useRef(null)
  const notificationMenuRef = useRef(null)

  useEffect(() => {
    setIsDark(initDarkMode())
  }, [])

  const handleLogout = () => {
    setLogout()
    navigate('/login')
  }

  const handleToggle = () => {
    setIsDark(toggleDarkMode())
  }

  const items = useMemo(() => {
    const list = []
    menuGroups.forEach(group => {
      group.items.forEach(item => {
        if (canAccessAdminModule(user, adminPathModule(item.path))) {
          list.push({
            label: tAdmin(item.labelKey),
            path: item.path,
            group: tAdmin(group.labelKey),
            icon: item.icon,
          })
        }
      })
    })
    return list
  }, [user, tAdmin])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return items.slice(0, 8)
    return items.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.group.toLowerCase().includes(q)
    )
  }, [items, searchQuery])

  useEffect(() => {
    setSelectedIndex(0)
  }, [filtered])

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

  useEffect(() => {
    const handlePointerDown = event => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    const handleKeyDown = event => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleInputKeyDown = event => {
    if (!searchOpen) {
      if (event.key === 'ArrowDown' || event.key === 'Enter') {
        setSearchOpen(true)
      }
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (filtered[selectedIndex]) {
        navigate(filtered[selectedIndex].path)
        setSearchOpen(false)
        searchInputRef.current?.blur()
      }
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setSearchOpen(false)
      searchInputRef.current?.blur()
    }
  }

  const recentNotifications = notifications.slice(0, 5)

  return (
    <header className="h-[60px] bg-white dark:bg-[#1E2130] border-b border-gray-100 dark:border-gray-700 flex items-center px-4 md:px-6 gap-3 md:gap-4 sticky top-0 z-30">
      {/* 3-gạch Hamburger menu toggle on mobile */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Brand logo only visible on mobile topbar */}
      <Link to="/admin" className="lg:hidden flex items-center h-8 flex-shrink-0 mr-1">
        <img
          src="/logo.svg"
          alt="Hamburger King"
          className="h-8 w-auto object-contain"
        />
      </Link>

      <div
        ref={searchContainerRef}
        className="hidden md:block relative flex-1 max-w-[140px] sm:max-w-sm"
      >
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value)
            setSearchOpen(true)
          }}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder={tAdmin('search')}
          className="w-full pl-9 pr-16 py-2 bg-gray-50 dark:bg-[#161825] rounded-xl text-sm border border-transparent focus:outline-none focus:border-red-200 dark:focus:border-red-500/50 focus:bg-white dark:focus:bg-[#1E2130] dark:text-gray-100 transition-all"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono select-none">
          Ctrl+K
        </kbd>

        {searchOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-[#1E2130] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-72 overflow-y-auto p-1.5 space-y-0.5">
            {filtered.map((item, index) => {
              const Icon = item.icon
              const isSelected = index === selectedIndex
              return (
                <button
                  key={item.path}
                  type="button"
                  onMouseDown={() => {
                    navigate(item.path)
                    setSearchOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-red-50 dark:bg-red-500/10 text-[#D62300] font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {Icon && <Icon size={14} className={isSelected ? 'text-[#D62300]' : 'text-gray-400'} />}
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-normal">{item.group}</span>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <div className="text-center py-4 text-xs text-gray-400">
                {tAdmin('no_result')}
              </div>
            )}
            <div className="bg-gray-50 dark:bg-[#161825] px-3 py-1.5 rounded-lg flex justify-between items-center text-[9px] text-gray-400 mt-1 select-none">
              <span>↑↓ {tAdmin('navigate', 'di chuyển')} &nbsp; ↵ {tAdmin('select', 'chọn')}</span>
              <span>Esc {tAdmin('close', 'đóng')}</span>
            </div>
          </div>
        )}
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
          {user?.avatar ? (
            <img
              src={assetUrl(user.avatar)}
              alt={user.name || 'Admin'}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#D62300] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
          )}
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

export function AdminLayout({ children, badges, notifications, unreadNotifications }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="admin-layout min-h-screen bg-[#F4F6F8] dark:bg-[#161825] text-gray-900 dark:text-gray-100">
      {/* Mobile sidebar backdrop click-outside overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity"
        />
      )}
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} badges={badges} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={`min-h-screen flex flex-col transition-all duration-300 ml-0 lg:ml-[260px] ${collapsed ? 'lg:ml-[70px]' : 'lg:ml-[260px]'}`}>
        <AdminTopbar notifications={notifications} unreadCount={unreadNotifications} onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main key={location.pathname} className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
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
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-[#D62300] text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
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
