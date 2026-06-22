import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Loader2, ShieldAlert } from 'lucide-react'

// API & Store
import apiClient from '../api/axios'
import { useAuthStore } from '../store/authStore'

// Layout & Components
import {
  AdminLayout,
  ConfirmDialog,
  adminPermissionModules,
  adminPathModule,
  canAccessAdminModule,
} from '../components/layout/AdminLayout'

// Generic CRUD Page components
import { GenericCrudPage, GenericCrudFormPage, crudPages } from '../components/admin/GenericCrud'

// Helper Utilities from adminShared
import {
  unwrap,
  getMeta,
  unwrapNotifications,
  notificationData,
  notificationTitle,
  notificationBody,
  playNotificationSound,
  useAdminText,
} from '../utils/adminShared'

// Standalone Page Components
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminOrdersPage from '../pages/admin/AdminOrders'
import { AdminProductsPage, AdminProductFormPage } from '../pages/admin/AdminProducts'
import { AdminCouponsPage } from '../pages/admin/AdminCoupons'
import { AdminUsersPage } from '../pages/admin/AdminUsers'
import { AdminReviewsPage } from '../pages/admin/AdminReviews'
import { AdminComplaintsPage } from '../pages/admin/AdminComplaints'
import AdminReportsPage from '../pages/admin/AdminReports'
import AdminCategoriesPage from '../pages/admin/AdminCategories'
import AdminCombosPage from '../pages/admin/AdminCombos'
import AdminToppingsPage from '../pages/admin/AdminToppings'
import AdminPaymentsPage from '../pages/admin/AdminPayments'
import AdminLoyaltyPage from '../pages/admin/AdminLoyalty'
import AdminPostsPage from '../pages/admin/AdminPosts'
import AdminPostCategoriesPage from '../pages/admin/AdminPostCategories'
import AdminPostTagsPage from '../pages/admin/AdminPostTags'
import AdminBannersPage from '../pages/admin/AdminBanners'
import AdminBranchesPage from '../pages/admin/AdminBranches'
import AdminSettingsDatabasePage, { AdminLanguageLocalesPage } from '../pages/admin/AdminSettings'
import AdminTranslationEdit from '../pages/admin/AdminTranslationEdit'
import AdminNotificationsPage from '../pages/admin/AdminNotifications'
import AdminChatPage from '../pages/admin/AdminChat'

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay])

  return debounced
}

function AdminPanel() {
  const { user } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const tAdmin = useAdminText()
  const editMatch = location.pathname.match(/^\/admin\/products\/(\d+)\/edit$/)
  const genericEditMatch = location.pathname.match(/^\/admin\/(categories|combos|toppings|posts|banners|branches|post-categories|post-tags|contacts)\/([^/]+)\/edit$/)
  const genericCreateMatch = location.pathname.match(/^\/admin\/(categories|combos|toppings|posts|banners|branches|post-categories|post-tags)\/create$/)

  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [orders, setOrders] = useState([])
  const [orderCounts, setOrderCounts] = useState({})
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [coupons, setCoupons] = useState([])
  const [users, setUsers] = useState([])
  const [reviews, setReviews] = useState([])
  const [pendingComplaintsCount, setPendingComplaintsCount] = useState(0)
  const [complaintCounts, setComplaintCounts] = useState({})
  const [complaints, setComplaints] = useState([])
  const [complaintsMeta, setComplaintsMeta] = useState({ current_page: 1, last_page: 1 })
  const [complaintFilters, setComplaintFilters] = useState({ status: '', search: '', page: 1 })
  const [postCategories, setPostCategories] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [notifications, setNotifications] = useState([])
  const [notificationLoading, setNotificationLoading] = useState(false)
  const loadedIdsRef = useRef(new Set())
  const isInitializedRef = useRef(false)
  const [reportData, setReportData] = useState({ counts: {}, topProducts: [], topCustomers: [], newCustomers: 0, total_revenue: 0, total_orders: 0, completed_orders_30_days: 0, average_order_value: 0, total_customers: 0, total_products: 0, total_reviews: 0, average_rating: 0 })
  const [editProduct, setEditProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(false)
  const [confirm, setConfirm] = useState({ open: false })
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [orderFilters, setOrderFilters] = useState({ status: '', search: '', page: 1 })
  const [productFilters, setProductFilters] = useState({ search: '', categoryId: '', available: '', page: 1 })
  const [orderMeta, setOrderMeta] = useState({ current_page: 1, last_page: 1 })
  const [productMeta, setProductMeta] = useState({ current_page: 1, last_page: 1 })
  const [activityMeta, setActivityMeta] = useState({ current_page: 1, last_page: 1 })
  const debouncedOrderSearch = useDebounce(orderFilters.search)
  const debouncedProductSearch = useDebounce(productFilters.search)
  const debouncedComplaintSearch = useDebounce(complaintFilters.search)

  const fetchDashboard = async () => {
    const [statsRes, chartRes, countsRes, complaintsCountsRes] = await Promise.all([
      apiClient.get('/admin/dashboard/stats').catch(() => apiClient.get('/admin/dashboard')),
      apiClient.get('/admin/dashboard/revenue-chart', { params: { period: '7days' } }),
      apiClient.get('/admin/orders/counts'),
      apiClient.get('/admin/complaints/counts').catch(() => ({ data: { counts: { pending: 0 } } })),
    ])
    setStats(unwrap(statsRes))
    setChartData(unwrap(chartRes))
    setOrderCounts(unwrap(countsRes))
    setComplaintCounts(complaintsCountsRes?.data?.counts || {})
    setPendingComplaintsCount(complaintsCountsRes?.data?.counts?.pending || 0)
  }

  const fetchComplaintsCount = async () => {
    if (!['admin', 'staff'].includes(user?.role)) return
    try {
      const res = await apiClient.get('/admin/complaints/counts')
      setComplaintCounts(res.data.counts || {})
      setPendingComplaintsCount(res.data.counts?.pending || 0)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchComplaints = async (next = complaintFilters) => {
    setTableLoading(true)
    try {
      const res = await apiClient.get('/admin/complaints', { params: { status: next.status || undefined, search: debouncedComplaintSearch || undefined, page: next.page } })
      const data = unwrap(res)
      setComplaints(Array.isArray(data) ? data : data.data || [])
      setComplaintsMeta(getMeta(res) || { current_page: 1, last_page: 1 })
    } finally {
      setTableLoading(false)
    }
  }

  const fetchActivityLogs = async (page = 1) => {
    const res = await apiClient.get('/admin/dashboard/activity-log', { params: { page, per_page: 5 } })
    const data = unwrap(res)
    setActivityLogs(Array.isArray(data) ? data : data.data || [])
    setActivityMeta(getMeta(res) || { current_page: 1, last_page: 1 })
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
      const fetchedList = unwrapNotifications(data)

      if (!isInitializedRef.current) {
        fetchedList.forEach(item => {
          if (item?.id) {
            loadedIdsRef.current.add(item.id)
          }
        })
        isInitializedRef.current = true
        setNotifications(fetchedList)
      } else {
        let hasNewNotification = false
        let hasNewOrder = false
        let hasNewReview = false

        fetchedList.forEach(item => {
          if (item?.id && !loadedIdsRef.current.has(item.id)) {
            loadedIdsRef.current.add(item.id)
            if (!item.read_at) {
              hasNewNotification = true

              const nType = item.type || ''
              const nData = notificationData(item)

              if (nType.includes('NewOrder') || nData.order_id || nData.order_code) {
                hasNewOrder = true
              }
              if (nType.includes('NewReview') || nData.review_id || nData.rating) {
                hasNewReview = true
              }

              const title = notificationTitle(item) || tAdmin('notifications')
              const body = notificationBody(item)

              toast.custom((t) => (
                <div
                  onClick={() => {
                    toast.dismiss(t.id)
                    navigate('/admin/notifications', { state: { notificationId: item.id } })
                  }}
                  className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-red-600 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl p-4`}
                >
                  <div className="flex items-start w-full">
                    <div className="flex-shrink-0 pt-0.5">
                      <Loader2 className="h-6 w-6 text-red-600 animate-bounce" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {body}
                      </p>
                    </div>
                  </div>
                </div>
              ), { duration: 6000 })
            }
          }
        })

        if (hasNewNotification) {
          playNotificationSound()
        }

        if (hasNewOrder) {
          fetchOrders().catch(console.error)
          fetchDashboard().catch(console.error)
        }
        if (hasNewReview) {
          fetchReviews().catch(console.error)
        }

        setNotifications(fetchedList)
      }
    } finally {
      if (!silent) setNotificationLoading(false)
    }
  }

  const fetchReports = async () => {
    const [reportsRes, topProductsRes, topCustomersRes, chartRes] = await Promise.all([
      apiClient.get('/admin/reports/summary'),
      apiClient.get('/admin/reports/top-products'),
      apiClient.get('/admin/reports/top-customers'),
      apiClient.get('/admin/dashboard/revenue-chart', { params: { period: '30days' } }),
    ])
    setChartData(unwrap(chartRes))
    setReportData(prev => ({ ...prev, ...unwrap(reportsRes), topProducts: unwrap(topProductsRes), topCustomers: unwrap(topCustomersRes) }))
  }

  useEffect(() => {
    if (!['admin', 'staff'].includes(user?.role)) return
    let ignore = false
    const loadRouteData = async () => {
      setLoading(true)
      const path = location.pathname
      if (!canAccessAdminModule(user, adminPathModule(path))) {
        if (!ignore) setLoading(false)
        return
      }
      if (path === '/admin') {
        await fetchDashboard()
        await fetchOrders()
        await fetchActivityLogs()
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
        await fetchReports()
      } else if (path.startsWith('/admin/combos')) {
        await fetchProducts({ search: '', categoryId: '', available: '', page: 1 })
      } else if (path.startsWith('/admin/toppings')) {
        await fetchCategories()
      } else if (path.startsWith('/admin/posts') || path.startsWith('/admin/post-categories')) {
        await fetchPostCategories()
      } else if (path === '/admin/complaints') {
        await fetchComplaintsCount()
        await fetchComplaints()
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
    isInitializedRef.current = false
    loadedIdsRef.current.clear()

    if (!canAccessAdminModule(user, 'notifications')) return undefined

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications().catch(error => {
      console.error(error)
    })
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComplaintsCount().catch(error => {
      console.error(error)
    })

    const intervalId = window.setInterval(() => {
      fetchNotifications({ silent: true }).catch(error => {
        console.error(error)
      })
      fetchComplaintsCount().catch(error => {
        console.error(error)
      })
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [user?.id, user?.role])

  useEffect(() => {
    if (!user || loading || !canAccessAdminModule(user, 'complaints') || location.pathname !== '/admin/complaints') return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComplaints({ ...complaintFilters, page: 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedComplaintSearch, complaintFilters.status])

  useEffect(() => {
    if (!user || loading || !canAccessAdminModule(user, 'orders')) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders({ ...orderFilters, page: 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedOrderSearch, orderFilters.status])

  useEffect(() => {
    if (!user || loading || !canAccessAdminModule(user, 'products')) return
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
    if (action !== 'delete') return
    await apiClient.delete(`/admin/reviews/${id}`)
    toast.success(tAdmin('deleted'))
    const res = await apiClient.get('/admin/reviews')
    setReviews(unwrap(res))
  }

  const unreadNotifications = notifications.filter(item => !item.read_at).length
  const badges = useMemo(() => ({
    pendingOrders: orderCounts.pending || stats?.metrics?.pending_orders || 0,
    notificationsUnread: unreadNotifications,
    pendingComplaints: pendingComplaintsCount,
  }), [orderCounts, stats, unreadNotifications, pendingComplaintsCount])

  if (!user || !['admin', 'staff'].includes(user.role)) return <Navigate to="/login" replace />

  if (loading) {
    return <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#161825] flex items-center justify-center"><Loader2 className="animate-spin text-[#D62300]" size={34} /></div>
  }

  let page = (
    <AdminDashboard
      stats={stats}
      orders={orders}
      chartData={chartData}
      activityLogs={activityLogs}
      activityMeta={activityMeta}
      onActivityPageChange={fetchActivityLogs}
    />
  )
  if (location.pathname === '/admin/orders') page = <AdminOrdersPage orders={orders} counts={orderCounts} loading={tableLoading} meta={orderMeta} filters={orderFilters} setFilters={setOrderFilters} onStatusChange={updateOrderStatus} onPageChange={pageNum => { setOrderFilters(prev => ({ ...prev, page: pageNum })); fetchOrders({ ...orderFilters, page: pageNum }) }} />
  else if (location.pathname === '/admin/products') page = <AdminProductsPage products={products} categories={categories} loading={tableLoading} meta={productMeta} filters={productFilters} setFilters={setProductFilters} onToggleFlag={toggleProductFlag} onDelete={deleteProduct} onPageChange={pageNum => { setProductFilters(prev => ({ ...prev, page: pageNum })); fetchProducts({ ...productFilters, page: pageNum }) }} />
  else if (location.pathname === '/admin/products/create' || editMatch) page = <AdminProductFormPage key={editMatch ? `edit-product-${editMatch[1]}` : 'create-product'} categories={categories} itemId={editMatch?.[1]} editProduct={editProduct} onSave={saveProduct} />
  else if (location.pathname === '/admin/coupons') page = <AdminCouponsPage coupons={coupons} loading={tableLoading} onRefresh={fetchCoupons} />
  else if (location.pathname === '/admin/users') page = <AdminUsersPage users={users} loading={tableLoading} onRefresh={fetchUsers} />
  else if (location.pathname === '/admin/reviews') page = <AdminReviewsPage reviews={reviews} loading={tableLoading} onModerate={moderateReview} />
  else if (location.pathname === '/admin/contacts') page = <GenericCrudPage {...crudPages.contacts} />
  else if (location.pathname === '/admin/complaints') page = (
    <AdminComplaintsPage 
      complaints={complaints} 
      loading={tableLoading} 
      counts={complaintCounts}
      meta={complaintsMeta} 
      filters={complaintFilters} 
      setFilters={setComplaintFilters} 
      onPageChange={pageNum => {
        setComplaintFilters(prev => ({ ...prev, page: pageNum }))
        fetchComplaints({ ...complaintFilters, page: pageNum })
      }}
      onRefresh={() => {
        fetchComplaints()
        fetchComplaintsCount()
      }}
    />
  )
  else if (location.pathname === '/admin/reports') page = <AdminReportsPage stats={stats} chartData={chartData} reportData={reportData} />
  else if (location.pathname === '/admin/categories') page = <AdminCategoriesPage />
  else if (location.pathname === '/admin/combos') page = <AdminCombosPage products={products} />
  else if (location.pathname === '/admin/toppings') page = <AdminToppingsPage categories={categories} />
  else if (location.pathname === '/admin/payments') page = <AdminPaymentsPage />
  else if (location.pathname === '/admin/loyalty') page = <AdminLoyaltyPage users={users} loading={tableLoading} />
  else if (location.pathname === '/admin/posts') page = <AdminPostsPage postCategories={postCategories} />
  else if (location.pathname === '/admin/post-categories') page = <AdminPostCategoriesPage />
  else if (location.pathname === '/admin/post-tags') page = <AdminPostTagsPage />
  else if (location.pathname === '/admin/banners') page = <AdminBannersPage />
  else if (location.pathname === '/admin/branches') page = <AdminBranchesPage />
  else if (genericEditMatch) {
    const resource = genericEditMatch[1]
    const configKey = resource === 'post-categories' ? 'postCategories' : (resource === 'post-tags' ? 'postTags' : resource)
    const config = crudPages[configKey]
    page = <GenericCrudFormPage key={`edit-${resource}-${genericEditMatch[2]}`} config={config} itemId={genericEditMatch[2]} products={products} categories={categories} postCategories={postCategories} />
  } else if (genericCreateMatch) {
    const resource = genericCreateMatch[1]
    const configKey = resource === 'post-categories' ? 'postCategories' : (resource === 'post-tags' ? 'postTags' : resource)
    const config = crudPages[configKey]
    page = <GenericCrudFormPage key={`create-${resource}`} config={config} products={products} categories={categories} postCategories={postCategories} />
  }
  else if (location.pathname === '/admin/settings') page = <AdminSettingsDatabasePage />
  else if (location.pathname === '/admin/translations/locales') page = <AdminLanguageLocalesPage />
  else if (location.pathname.startsWith('/admin/translations/')) {
    const pathCode = location.pathname.split('/').pop()
    page = <AdminTranslationEdit code={pathCode} />
  }
  else if (location.pathname === '/admin/notifications') page = <AdminNotificationsPage notifications={notifications} loading={notificationLoading} onMarkRead={markNotificationRead} onStatusChange={updateOrderStatus} />
  else if (location.pathname === '/admin/chat') page = <AdminChatPage />
  else if (location.pathname !== '/admin' && !genericEditMatch && !genericCreateMatch) navigate('/admin')

  const currentModule = adminPathModule(location.pathname)
  const firstAllowed = adminPermissionModules.find(module => canAccessAdminModule(user, module))

  let content = page
  if (!canAccessAdminModule(user, currentModule)) {
    content = <AccessDeniedPage firstAllowed={firstAllowed} />
  }

  return (
    <AdminLayout badges={badges} notifications={notifications} unreadNotifications={unreadNotifications}>
      {content}
      <ConfirmDialog open={confirm.open} title={confirm.title} message={confirm.message} onCancel={() => setConfirm({ open: false })} onConfirm={confirm.onConfirm} loading={confirmLoading} />
    </AdminLayout>
  )
}

function AccessDeniedPage({ firstAllowed }) {
  const tAdmin = useAdminText()
  const navigate = useNavigate()

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-[#D62300] mb-5 shadow-glass animate-float-half">
        <ShieldAlert size={32} className="stroke-[1.5]" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-2">
        {tAdmin('access_denied_title')}
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-6">
        {tAdmin('access_denied_desc')}
      </p>
      <button
        type="button"
        onClick={() => navigate(firstAllowed && firstAllowed !== 'dashboard' ? `/admin/${firstAllowed === 'languages' ? 'translations/locales' : firstAllowed}` : '/admin')}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D62300] hover:bg-[#b51e00] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-md cursor-pointer"
      >
        {tAdmin('back_to_dashboard')}
      </button>
    </div>
  )
}

export default AdminPanel
