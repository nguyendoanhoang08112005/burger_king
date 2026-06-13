/**
 * AdminNotifications.jsx - Admin notifications page
 */
import { useState, useCallback, useEffect } from 'react'
import { Eye, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAdminText } from '../../utils/adminUtils'
import {
  AdminPageShell, TableSkeleton, EmptyTableRow, Pagination,
} from '../../components/layout/AdminLayout'
import { formatDate, formatVND } from '../../utils/format'
import { notificationTitle, notificationBody, notificationData } from '../../utils/adminUtils'
import apiClient from '../../api/axios'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function unwrap(response) {
  const body = response.data
  return body?.success ? body.data : body
}

// ─── OrderStatusBadge (local) ─────────────────────────────────────────────────

const statusClasses = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  delivering: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

function OrderStatusBadge({ status }) {
  const tAdmin = useAdminText()
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusClasses[status] || 'bg-gray-100 text-gray-500'}`}>
      {tAdmin(status)}
    </span>
  )
}

// ─── NotificationDetailModal ──────────────────────────────────────────────────

function NotificationDetailModal({ notification, order, loading, onClose, onProcessOrder }) {
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
  const detailRows = [
    { label: tAdmin('rating'), value: data.rating ? `${data.rating} ★` : null },
    { label: tAdmin('order_code'), value: data.order_code },
    { label: tAdmin('customer'), value: data.customer_name },
    { label: tAdmin('phone'), value: data.customer_phone },
    { label: tAdmin('items_count'), value: data.items_count },
    { label: tAdmin('total_amount'), value: money(data.total) },
    { label: tAdmin('payment_method'), value: data.payment_method?.toUpperCase?.() || data.payment_method },
    { label: tAdmin('delivery_type'), value: data.delivery_type },
  ].filter(row => hasValue(row.value))

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 cursor-pointer">
      <div onClick={e => e.stopPropagation()} className="w-full max-w-lg bg-white dark:bg-[#1E2130] rounded-2xl shadow-xl overflow-hidden cursor-default">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-700 p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
              <span>{formatDate(notification.created_at)}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span>{notification.read_at ? tAdmin('read') : tAdmin('unread')}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
              {data.status && <OrderStatusBadge status={data.status} />}
            </div>
          </div>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={16} /> {tAdmin('close')}
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {body && (
            <div className="rounded-xl border border-red-100 bg-red-50/60 dark:border-red-500/20 dark:bg-red-500/10 p-4">
              <p className="text-sm leading-6 text-gray-700 dark:text-gray-200">{body}</p>
            </div>
          )}
          {!!detailRows.length && (
            <div className="grid grid-cols-2 gap-3">
              {detailRows.map(row => (
                <div key={row.label} className="rounded-xl bg-gray-50 dark:bg-[#161825] p-3">
                  <p className="text-[10px] uppercase font-semibold text-gray-400">{row.label}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">{row.value}</p>
                </div>
              ))}
            </div>
          )}
          {order?.items?.length > 0 && (
            <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-3">
              <p className="text-[10px] uppercase font-semibold text-gray-400">{tAdmin('products') || 'Sản phẩm'}</p>
              <div className="mt-2 divide-y divide-gray-50 dark:divide-gray-800">
                {order.items.map(item => (
                  <div key={item.id} className="py-2 flex justify-between text-xs">
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{item.product_name}</span>
                      <span className="text-gray-400 ml-1">x{item.quantity}</span>
                      {item.toppings?.length > 0 && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          + {item.toppings.map(t => t.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatVND(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.delivery_address && (
            <div className="rounded-xl bg-gray-50 dark:bg-[#161825] p-3">
              <p className="text-[10px] uppercase font-semibold text-gray-400">{tAdmin('delivery_address')}</p>
              <p className="mt-1 text-xs font-semibold text-gray-900 dark:text-gray-100">{data.delivery_address}</p>
            </div>
          )}
          {data.note && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 p-3">
              <p className="text-[10px] uppercase font-semibold text-amber-600">{tAdmin('note')}</p>
              <p className="mt-1 text-xs text-gray-800 dark:text-gray-100">{data.note}</p>
            </div>
          )}
          {loading && <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#D62300]" size={24} /></div>}
          {order && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onProcessOrder}
                className="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#D62300] hover:bg-[#B51E00] text-white transition-colors shadow-sm cursor-pointer"
              >
                <Eye size={16} /> {tAdmin('process_order') || 'Xử lý đơn hàng'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── AdminNotificationsPage ───────────────────────────────────────────────────

export default function AdminNotificationsPage({ notifications = [], loading = false, onMarkRead, onStatusChange }) {
  const tAdmin = useAdminText()
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isViewingFullOrder, setIsViewingFullOrder] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(notifications.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedNotifications = notifications.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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

  const handleStatusChange = async (orderId, status) => {
    if (!onStatusChange) return
    const updatedOrder = await onStatusChange(orderId, status)
    if (updatedOrder && selectedOrder?.id === orderId) {
      setSelectedOrder(updatedOrder)
    }
  }

  useEffect(() => {
    const notificationId = location.state?.notificationId
    if (!notificationId || loading) return

    const target = notifications.find(item => String(item.id) === String(notificationId))
    if (target) {
      navigate(location.pathname, { replace: true, state: null })
      setTimeout(() => openDetail(target), 0)
    }
  }, [location.state, loading, notifications, openDetail, navigate, location.pathname])

  return (
    <AdminPageShell title={tAdmin('notifications_title')}>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm overflow-x-auto">
        {loading ? <TableSkeleton rows={6} cols={4} /> : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="py-3">{tAdmin('notification_content')}</th>
                <th>{tAdmin('time')}</th>
                <th>{tAdmin('status')}</th>
                <th className="text-right">{tAdmin('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paginatedNotifications.map(item => {
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
                      <button type="button" onClick={() => openDetail(item)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#D62300] hover:underline cursor-pointer">
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
        <div className="mt-5 flex justify-end">
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
      <NotificationDetailModal
        notification={selectedNotification}
        order={selectedOrder}
        loading={detailLoading}
        onClose={() => {
          setSelectedNotification(null)
          setSelectedOrder(null)
        }}
        onProcessOrder={() => { setIsViewingFullOrder(true) }}
      />
    </AdminPageShell>
  )
}
