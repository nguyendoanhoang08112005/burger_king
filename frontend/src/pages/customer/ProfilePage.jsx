import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  User as UserIcon, 
  Package, 
  MapPin, 
  Gift, 
  Bell, 
  Heart, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Trash2 
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
import apiClient from '../../api/axios'
import { formatVND, formatDate } from '../../utils/format'
import VietnamAddressSelector from '../../components/VietnamAddressSelector'

export default function ProfilePage({ onSelectProduct }) {
  const { t, i18n } = useTranslation()
  const { user, updateUser, setLogout } = useAuthStore()
  const { showToast } = useUiStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const emptyAddress = useCallback(() => ({
    label: t('address.home_label'),
    recipient_name: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    street: '',
    is_default: false
  }), [t])

  const activeTab = searchParams.get('tab') || 'info'

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [addresses, setAddresses] = useState([])
  const [loyalty, setLoyalty] = useState({ balance: 0, transactions: [] })
  const [notifications, setNotifications] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [orders, setOrders] = useState([])
  const [profilePages, setProfilePages] = useState({})

  const profilePageSizes = {
    orders: 4,
    addresses: 4,
    loyalty: 4,
    notifications: 4,
    wishlist: 4,
  }

  const getProfilePage = (tabId, totalItems) => {
    const size = profilePageSizes[tabId] || 4
    const totalPages = Math.max(1, Math.ceil(totalItems / size))
    return Math.min(profilePages[tabId] || 1, totalPages)
  }

  const getProfilePageItems = (items, tabId) => {
    const size = profilePageSizes[tabId] || 4
    const page = getProfilePage(tabId, items.length)
    return items.slice((page - 1) * size, page * size)
  }

  const renderProfilePagination = (items, tabId) => {
    const size = profilePageSizes[tabId] || 4
    const totalPages = Math.ceil(items.length / size)
    if (totalPages <= 1) return null

    const page = getProfilePage(tabId, items.length)
    const goToPage = (nextPage) => {
      setProfilePages(current => ({
        ...current,
        [tabId]: Math.min(Math.max(1, nextPage), totalPages),
      }))
    }
    const start = Math.max(1, Math.min(page - 2, totalPages - 4))
    const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => start + index).filter(pageNumber => pageNumber <= totalPages)

    return (
      <div className="flex justify-end border-t border-[#E8E8E8] pt-5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t('common.previous')}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pages.map(pageNumber => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => goToPage(pageNumber)}
              className={`h-8 w-8 rounded-lg text-sm font-semibold transition ${
                pageNumber === page
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-[#F5F5F5]'
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t('common.next')}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  // Addresses Form fields
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [newAddress, setNewAddress] = useState(() => emptyAddress())

  const loadData = useCallback(() => {
    if (activeTab === 'addresses') {
      apiClient.get('/addresses').then(res => setAddresses(res.data))
    } else if (activeTab === 'loyalty') {
      apiClient.get('/loyalty-points').then(res => setLoyalty(res.data))
    } else if (activeTab === 'notifications') {
      apiClient.get('/notifications').then(res => setNotifications(res.data))
    } else if (activeTab === 'wishlist') {
      apiClient.get('/wishlist').then(res => setWishlist(res.data))
    } else if (activeTab === 'orders') {
      apiClient.get('/orders').then(res => setOrders(res.data.data || []))
    }
  }, [activeTab, i18n.language, emptyAddress])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpdateProfile = (e) => {
    e.preventDefault()
    setProfileSaving(true)

    apiClient.put('/profile', { name, phone })
      .then(res => {
        updateUser(res.data.user || { name, phone })
        showToast(res.data.message || t('profile.update_success'))
      })
      .catch(error => {
        showToast(error.response?.data?.message || t('profile.update_error'), 'error')
      })
      .finally(() => setProfileSaving(false))
  }

  const handleChangePassword = (e) => {
    e.preventDefault()

    if (passwordForm.password !== passwordForm.password_confirmation) {
      showToast(t('auth.password_confirmation_mismatch'), 'error')
      return
    }

    setPasswordSaving(true)
    apiClient.put('/profile/password', passwordForm)
      .then(res => {
        showToast(res.data.message || t('profile.password_changed'))
        setPasswordForm({
          current_password: '',
          password: '',
          password_confirmation: '',
        })
        setShowPasswordForm(false)
      })
      .catch(error => {
        const errors = error.response?.data?.errors
        const firstError = errors ? Object.values(errors).flat()[0] : null
        showToast(firstError || error.response?.data?.message || t('profile.password_change_error'), 'error')
      })
      .finally(() => setPasswordSaving(false))
  }

  const resetAddressForm = useCallback(() => {
    setEditingAddressId(null)
    setNewAddress(emptyAddress())
  }, [emptyAddress])

  useEffect(() => {
    setShowAddressForm(false)
    resetAddressForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, resetAddressForm])

  const openCreateAddressForm = () => {
    resetAddressForm()
    setShowAddressForm(true)
  }

  const openEditAddressForm = (address) => {
    setEditingAddressId(address.id)
    setNewAddress({
      label: address.label || '',
      recipient_name: address.recipient_name || '',
      phone: address.phone || '',
      province: address.province || '',
      district: address.district || '',
      ward: address.ward || '',
      street: address.street || '',
      is_default: Boolean(address.is_default)
    })
    setShowAddressForm(true)
  }

  const handleSaveAddress = (e) => {
    e.preventDefault()
    const request = editingAddressId
      ? apiClient.put(`/addresses/${editingAddressId}`, newAddress)
      : apiClient.post('/addresses', newAddress)

    request
      .then(res => {
        setAddresses(current => (
          editingAddressId
            ? current.map(address => address.id === editingAddressId ? res.data : { ...address, is_default: res.data.is_default ? false : address.is_default })
            : [res.data, ...current.map(address => ({ ...address, is_default: res.data.is_default ? false : address.is_default }))]
        ))
        setShowAddressForm(false)
        resetAddressForm()
        showToast(t(editingAddressId ? 'profile.address_updated' : 'profile.address_created'))
      }).catch(err => {
        console.error(err)
        showToast(t('profile.address_save_error'), 'error')
      })
  }

  const handleDeleteAddress = (event, id) => {
    event.stopPropagation()
    if (window.confirm(t('profile.address_delete_confirm'))) {
      apiClient.delete(`/addresses/${id}`)
        .then(() => {
          setAddresses(addresses.filter(a => a.id !== id))
          if (editingAddressId === id) {
            setShowAddressForm(false)
            resetAddressForm()
          }
          showToast(t('profile.address_deleted'))
        })
    }
  }

  const handleMarkNotificationRead = (id) => {
    apiClient.post(`/notifications/${id}/read`)
      .then(() => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date() } : n))
        showToast(t('profile.notification_marked_read'))
      })
  }

  const openNotification = (notification) => {
    if (!notification.read_at) {
      apiClient.post(`/notifications/${notification.id}/read`)
        .then(() => {
          setNotifications(current => current.map(item => (
            item.id === notification.id ? { ...item, read_at: new Date() } : item
          )))
        })
        .catch(() => {})
    }

    const data = notification.data || {}
    const target = data.action_url || data.url || (data.order_code ? `/orders/tracking/${data.order_code}` : null)
    if (target) {
      navigate(target)
    }
  }

  const handleRemoveWishlist = (event, wishlistItem) => {
    event.stopPropagation()
    const productId = wishlistItem.product?.id
    if (!productId) return

    apiClient.post('/wishlist', { product_id: productId })
      .then(res => {
        setWishlist(current => current.filter(item => item.id !== wishlistItem.id))
        showToast(res.data.message)
      })
      .catch(error => {
        showToast(error.response?.data?.message || t('common.error'), 'error')
      })
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 md:px-12 bg-[#FFFAF5] text-[#1A1A1A] flex flex-col md:flex-row gap-8">
      {/* Side Tabs */}
      <aside className="w-full md:w-64 md:self-start md:sticky md:top-28 shrink-0 p-6 rounded-2xl bg-white border border-[#E8E8E8] flex flex-col shadow-glass">
        <div className="space-y-2">
          {[
            { id: 'info', name: t('profile.personal_info'), icon: <UserIcon className="w-4 h-4" /> },
            { id: 'orders', name: t('profile.order_history'), icon: <Package className="w-4 h-4" /> },
            { id: 'addresses', name: t('profile.address_book'), icon: <MapPin className="w-4 h-4" /> },
            { id: 'loyalty', name: t('profile.loyalty_history'), icon: <Gift className="w-4 h-4" /> },
            { id: 'notifications', name: t('profile.notifications').toUpperCase(), icon: <Bell className="w-4 h-4" /> },
            { id: 'wishlist', name: t('profile.wishlist_title'), icon: <Heart className="w-4 h-4" /> },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => {
                setProfilePages(current => ({ ...current, [tab.id]: 1 }))
                setSearchParams({ tab: tab.id })
              }}
              className={`w-full text-left text-xs font-semibold px-4 py-3 rounded-[10px] border transition flex items-center gap-3 ${
                activeTab === tab.id 
                  ? 'bg-primary/10 border-primary text-primary font-bold' 
                  : 'bg-[#F8F8F8] border-[#E8E8E8] text-gray-500 hover:border-gray-400'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        <button 
          onClick={() => {
            setLogout()
            navigate('/')
          }}
          className="mt-8 w-full bg-primary/10 border border-primary/20 text-primary font-heading py-2.5 rounded-[8px] text-xs tracking-wider uppercase hover:bg-primary/20 transition"
        >
          {t('nav.logout').toUpperCase()}
        </button>
      </aside>

      {/* Tab Panels */}
      <main className="flex-1 p-6 rounded-2xl bg-white border border-[#E8E8E8] min-h-[50vh] shadow-glass">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">{t('profile.personal_info')}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('profile.customer_id')}</p>
                <p className="mt-2 text-sm font-bold text-[#1A1A1A]">#{user.id}</p>
              </div>
              <div className="rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('profile.account_role')}</p>
                <p className="mt-2 text-sm font-bold text-[#1A1A1A] capitalize">{user.role || t('profile.customer_role')}</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">{t('profile.account_status')}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                  <CheckCircle className="h-4 w-4" />
                  {t('profile.active_account')}
                </p>
              </div>
              <div className="rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('profile.member_since')}</p>
                <p className="mt-2 text-sm font-bold text-[#1A1A1A]">{user.created_at ? formatDate(user.created_at) : '-'}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="max-w-3xl space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('auth.name')}</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('profile.login_email')}</label>
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('auth.phone')}</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] uppercase">{t('auth.password')}</label>
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(current => !current)}
                      className="text-[10px] font-bold uppercase tracking-wider text-primary transition hover:opacity-70"
                    >
                      {showPasswordForm ? t('profile.cancel_password_change') : t('profile.change_password')}
                    </button>
                  </div>
                  <input
                    type="password"
                    value="********"
                    disabled
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="border-t border-[#E8E8E8] pt-5">
                <button 
                  type="submit"
                  disabled={profileSaving}
                  className="w-full sm:w-auto bg-primary hover:opacity-90 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-[8px] text-xs tracking-wider transition hover:-translate-y-[1px]"
                >
                  {(profileSaving ? t('profile.saving') : t('profile.update_info')).toUpperCase()}
                </button>
              </div>
            </form>

            {showPasswordForm && (
              <form onSubmit={handleChangePassword} className="max-w-3xl rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.3px] text-[#1A1A1A]">{t('profile.change_password')}</h3>
                  <p className="mt-1 text-xs text-gray-400">{t('profile.password_security')}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('profile.current_password')}</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.current_password}
                      onChange={event => setPasswordForm(current => ({ ...current, current_password: event.target.value }))}
                      className="w-full bg-white border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('profile.new_password')}</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordForm.password}
                      onChange={event => setPasswordForm(current => ({ ...current, password: event.target.value }))}
                      className="w-full bg-white border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('profile.confirm_new_password')}</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordForm.password_confirmation}
                      onChange={event => setPasswordForm(current => ({ ...current, password_confirmation: event.target.value }))}
                      className="w-full bg-white border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="bg-primary hover:opacity-90 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-[8px] text-xs tracking-wider transition"
                  >
                    {(passwordSaving ? t('profile.saving') : t('profile.save_password')).toUpperCase()}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="border border-[#E8E8E8] bg-white px-8 py-3 rounded-[8px] text-xs font-semibold tracking-wider text-gray-500 transition hover:border-gray-400"
                  >
                    {t('common.cancel').toUpperCase()}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">{t('profile.order_history')}</h2>
            {orders.length === 0 ? (
              <p className="text-xs text-gray-400">{t('order.empty')}</p>
            ) : (
              <>
                {getProfilePageItems(orders, 'orders').map((o) => (
                  <div
                    key={o.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/orders/tracking/${o.order_code}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        navigate(`/orders/tracking/${o.order_code}`)
                      }
                    }}
                    className="p-4 rounded-xl border border-[#E8E8E8] bg-white flex flex-col sm:flex-row justify-between gap-4 shadow-glass cursor-pointer transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-premium"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-[#1A1A1A]">{t('order.code_label', { code: o.order_code })}</h4>
                      <p className="text-[10px] text-gray-500 mt-1">{t('order.date_label', { date: formatDate(o.created_at) })}</p>
                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{t('order.items_label', { items: o.items?.map(i => i.product_name).join(', ') })}</p>
                      {o.scheduled_at && (
                        <p className="text-[10px] text-gray-400 mt-1">{t('order.scheduled_at')}: {formatDate(o.scheduled_at)}</p>
                      )}
                      {o.note && (
                        <p className="text-[10px] text-amber-700 mt-1 line-clamp-2">{t('checkout.order_note')}: {o.note}</p>
                      )}
                    </div>
                    <div className="flex flex-col sm:items-end justify-between">
                      <span className="font-heading text-lg text-primary">{formatVND(o.total)}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          o.status === 'completed' ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary'
                        }`}>{t(`order.${o.status?.toLowerCase()}`) || o.status}</span>
                        <Link 
                          to={`/orders/tracking/${o.order_code}`}
                          onClick={(event) => event.stopPropagation()}
                          className="text-xs text-primary font-bold hover:underline"
                        >
                          {t('order.track')}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {renderProfilePagination(orders, 'orders')}
              </>
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#E8E8E8] pb-3">
              <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px]">{t('profile.address_book')}</h2>
              <button 
                onClick={() => {
                  if (showAddressForm && !editingAddressId) {
                    setShowAddressForm(false)
                  } else {
                    openCreateAddressForm()
                  }
                }}
                className="bg-primary text-white font-semibold px-4 py-2 rounded-[8px] text-xs tracking-wider hover:opacity-90 transition hover:-translate-y-[1px]"
              >
                {t('profile.add_address').toUpperCase()}
              </button>
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <form onSubmit={handleSaveAddress} className="p-5 rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-[#1A1A1A]">
                    {editingAddressId ? t('profile.edit_address') : t('profile.add_address')}
                  </h3>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('address.label')}</label>
                  <input 
                    type="text" 
                    required
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('checkout.recipient_name')}</label>
                  <input 
                    type="text" 
                    required
                    value={newAddress.recipient_name}
                    onChange={(e) => setNewAddress({ ...newAddress, recipient_name: e.target.value })}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('address.delivery_phone')}</label>
                  <input 
                    type="tel" 
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>
                <VietnamAddressSelector
                  province={newAddress.province}
                  district={newAddress.district}
                  ward={newAddress.ward}
                  street={newAddress.street}
                  onChange={({ province, district, ward, street }) =>
                    setNewAddress({ ...newAddress, province, district, ward, street })
                  }
                  required={true}
                  theme="storefront"
                />

                <div className="sm:col-span-2 flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={newAddress.is_default}
                    onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary bg-white border-[#E8E8E8]"
                  />
                  <span className="text-xs text-gray-500">{t('address.set_default')}</span>
                </div>

                <div className="sm:col-span-2 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAddressForm(false)
                      resetAddressForm()
                    }}
                    className="bg-white hover:bg-[#F5F5F5] border border-[#E8E8E8] text-[#1A1A1A] font-semibold py-2.5 px-6 rounded-[8px] text-xs tracking-wider transition"
                  >
                    {t('common.cancel').toUpperCase()}
                  </button>
                  <button 
                    type="submit" 
                    className="bg-primary hover:opacity-90 text-white font-semibold py-2.5 px-6 rounded-[8px] text-xs tracking-wider transition hover:-translate-y-[1px]"
                  >
                    {t(editingAddressId ? 'profile.update_address' : 'profile.save_address').toUpperCase()}
                  </button>
                </div>
              </form>
            )}

            {/* List addresses */}
            {addresses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E8E8E8] bg-[#F8F8F8] px-5 py-8 text-center">
                <MapPin className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-3 text-xs font-semibold text-gray-500">{t('profile.no_addresses')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {getProfilePageItems(addresses, 'addresses').map((addr) => (
                  <div
                    key={addr.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openEditAddressForm(addr)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        openEditAddressForm(addr)
                      }
                    }}
                    className={`p-4 rounded-xl border bg-white flex flex-col justify-between shadow-glass cursor-pointer transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-premium ${
                      editingAddressId === addr.id ? 'border-primary/60 bg-primary/5' : 'border-[#E8E8E8]'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs uppercase tracking-wider text-primary">{addr.label}</span>
                        {addr.is_default && <span className="text-[10px] bg-[#FFC72C] text-[#1A1A1A] px-2 py-0.5 rounded-[8px] font-bold uppercase">{t('common.default')}</span>}
                      </div>
                      <p className="text-xs font-semibold text-[#1A1A1A] mt-3">{addr.recipient_name} - {addr.phone}</p>
                      <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                        {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E8E8E8] flex justify-end">
                      <button 
                        type="button"
                        onClick={(event) => handleDeleteAddress(event, addr.id)}
                        className="rounded-[8px] border border-primary/15 bg-primary/5 p-2 text-primary transition hover:bg-primary hover:text-white"
                        aria-label={t('profile.delete_address')}
                        title={t('profile.delete_address')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {renderProfilePagination(addresses, 'addresses')}
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="space-y-6">
            <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">{t('profile.loyalty_history')}</h2>
            
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row justify-between items-center gap-4 animate-float">
              <div>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{t('profile.loyalty_member_badge')}</span>
                <h3 className="font-bold text-2xl text-[#1A1A1A] uppercase tracking-[0.3px] mt-1">{t('profile.loyalty_reward_title')}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-4xl text-primary">{loyalty.balance}</span>
                <span className="text-xs text-primary font-semibold">{t('profile.available_points')}</span>
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <span className="text-[10px] text-gray-400 font-bold block mb-2 uppercase">{t('profile.transaction_history')}</span>
              {loyalty.transactions.length === 0 ? (
                <p className="text-xs text-gray-400">{t('profile.no_loyalty_transactions')}</p>
              ) : (
                getProfilePageItems(loyalty.transactions, 'loyalty').map((tr) => (
                  <div key={tr.id} className="p-4 rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-[#1A1A1A] leading-tight">{tr.description}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{formatDate(tr.created_at)}</p>
                    </div>
                    <span className="font-bold text-sm text-primary">
                      {tr.type === 'earn' ? '+' : '-'}{tr.points} {t('profile.points')}
                    </span>
                  </div>
                ))
              )}
              {renderProfilePagination(loyalty.transactions, 'loyalty')}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">{t('profile.notifications_title')}</h2>
            
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-400">{t('profile.no_notifications')}</p>
              ) : (
                getProfilePageItems(notifications, 'notifications').map((n) => {
                  const unread = !n.read_at
                  return (
                    <div 
                      key={n.id} 
                      role="button"
                      tabIndex={0}
                      onClick={() => openNotification(n)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          openNotification(n)
                        }
                      }}
                      className={`p-4 rounded-xl border flex justify-between items-start gap-4 transition cursor-pointer hover:-translate-y-0.5 hover:shadow-glass ${
                        unread ? 'bg-primary/5 border-primary/20' : 'bg-white border-[#E8E8E8] opacity-70'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-[#1A1A1A]">{n.data?.title}</h4>
                          {unread && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </div>
                        <p className="text-[10px] text-[#666666] leading-relaxed">{n.data?.body}</p>
                        <p className="text-[9px] text-gray-400">{formatDate(n.created_at)}</p>
                      </div>

                      {unread && (
                        <button 
                          onClick={(event) => {
                            event.stopPropagation()
                            handleMarkNotificationRead(n.id)
                          }}
                          className="text-[10px] text-primary hover:opacity-80 transition font-bold"
                        >
                          {t('profile.mark_read')}
                        </button>
                      )}
                    </div>
                  )
                })
              )}
              {renderProfilePagination(notifications, 'notifications')}
            </div>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">{t('profile.wishlist_title')}</h2>
            {wishlist.length === 0 ? (
              <p className="text-xs text-gray-400">{t('profile.wishlist_empty')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {getProfilePageItems(wishlist, 'wishlist').map((w) => (
                  <div
                    key={w.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => w.product && onSelectProduct?.(w.product)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        if (w.product) onSelectProduct?.(w.product)
                      }
                    }}
                    className="flex gap-4 p-3 rounded-xl border border-[#E8E8E8] bg-white shadow-glass cursor-pointer transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-premium"
                  >
                    <img 
                      src={w.product?.thumbnail} 
                      alt={w.product?.name} 
                      className="w-16 h-16 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-[#1A1A1A] truncate">{w.product?.name}</h4>
                        <span className="text-[10px] text-primary font-semibold mt-1 block">{formatVND(w.product?.base_price)}</span>
                      </div>
                      <Link 
                        to="/menu" 
                        onClick={(event) => event.stopPropagation()}
                        className="text-[10px] text-primary hover:underline font-bold"
                      >
                        {t('product.order_now').toUpperCase()}
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => handleRemoveWishlist(event, w)}
                      className="self-start rounded-[8px] border border-primary/15 bg-primary/5 p-2 text-primary transition hover:bg-primary hover:text-white"
                      aria-label={t('profile.remove_wishlist')}
                      title={t('profile.remove_wishlist')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {renderProfilePagination(wishlist, 'wishlist')}
          </div>
        )}
      </main>
    </div>
  )
}
