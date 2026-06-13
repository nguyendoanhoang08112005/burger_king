import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Eye, X, Search } from 'lucide-react'
import { formatDate, formatVND } from '../../utils/format'
import { useAdminText } from '../../utils/adminUtils'
import {
  AdminPageShell,
  EmptyTableRow,
  TableSkeleton,
  Pagination,
} from '../../components/layout/AdminLayout'

const statusTabs = [
  { key: '' },
  { key: 'pending' },
  { key: 'confirmed' },
  { key: 'preparing' },
  { key: 'delivering' },
  { key: 'completed' },
  { key: 'cancelled' },
]

const statusClasses = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300',
  preparing: 'bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300',
  delivering: 'bg-purple-100 text-purple-700 dark:bg-purple-400/15 dark:text-purple-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300',
}

const orderStatusFlow = ['pending', 'confirmed', 'preparing', 'delivering', 'completed']

const getAllowedOrderStatuses = status => {
  const transitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['delivering', 'cancelled'],
    delivering: ['completed'],
    completed: [],
    cancelled: [],
  }

  return transitions[status] || []
}

const orderStatusProgress = status => {
  if (status === 'cancelled') return -1
  return orderStatusFlow.indexOf(status)
}

export function OrderStatusBadge({ status }) {
  const tAdmin = useAdminText()
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusClasses[status] || statusClasses.pending}`}>
      {tAdmin(`status_${status}`)}
    </span>
  )
}

export function OrderStatusTimeline({ status }) {
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
        {status === 'completed' && <span className="text-xs text-gray-400">{tAdmin('order_completed_terminal')}</span>}
      </div>
    </div>
  )
}

export function OrderStatusControl({ order, onChange }) {
  const tAdmin = useAdminText()
  const allowedStatuses = getAllowedOrderStatuses(order.status)
  const terminal = allowedStatuses.length === 0

  if (terminal) {
    return (
      <div className="space-y-1.5">
        <OrderStatusBadge status={order.status} />
        <p className="text-[11px] text-gray-400">{order.status === 'completed' ? tAdmin('order_completed_terminal') : tAdmin('order_cancelled_terminal')}</p>
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
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${status === 'cancelled'
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

export function OrderDetailModal({ order, onClose, onStatusChange }) {
  const tAdmin = useAdminText()
  if (!order) return null
  const isPickup = order.delivery_type === 'pickup'

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
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-medium">
                {formatDate(order.created_at)}
              </span>
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
              <div className={`mb-3 rounded-xl border p-4 ${isPickup
                  ? 'border-amber-100 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10'
                  : 'border-blue-100 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10'
                }`}>
                <p className={`text-xs uppercase font-semibold ${isPickup ? 'text-amber-700 dark:text-amber-300' : 'text-blue-700 dark:text-blue-300'}`}>
                  {tAdmin('delivery_type')}
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {isPickup ? tAdmin('delivery_type_pickup') : tAdmin('delivery_type_delivery')}
                </p>
                {isPickup && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{tAdmin('pickup_admin_hint')}</p>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <p>{order.address?.recipient_name || order.address?.name || order.user?.name}</p>
                <p>{order.address?.phone || order.user?.phone || '-'}</p>
                {isPickup ? (
                  order.address ? (
                    <p className="font-semibold text-amber-700 dark:text-amber-300">
                      🏪 {order.address.province} - {order.address.district}
                    </p>
                  ) : (
                    <p>{tAdmin('pickup_branch_address')}</p>
                  )
                ) : (
                  <p>
                    {order.address
                      ? [order.address.street, order.address.ward, order.address.district, order.address.province].filter(Boolean).join(', ')
                      : (order.address?.full_address || order.address?.address || '-')
                    }
                  </p>
                )}
              </div>
            </div>
            {(order.scheduled_at || order.note) && (
              <div className="space-y-3">
                {order.scheduled_at && (
                  <div className="rounded-xl bg-gray-50 dark:bg-[#161825] p-4">
                    <p className="text-xs uppercase font-semibold text-gray-400">{tAdmin('scheduled_at')}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{formatDate(order.scheduled_at)}</p>
                  </div>
                )}
                {order.note && (
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-4">
                    <p className="text-xs uppercase font-semibold text-amber-700 dark:text-amber-300">{tAdmin('note')}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-100">{order.note}</p>
                  </div>
                )}
              </div>
            )}
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

export function OrdersTable({ orders, compact = false, onStatusChange, onView }) {
  const tAdmin = useAdminText()
  const deliveryTypeLabel = order => order.delivery_type === 'pickup' ? tAdmin('delivery_type_pickup') : tAdmin('delivery_type_delivery')

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
              <td className="py-3">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{order.order_code}</p>
                <p className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${order.delivery_type === 'pickup'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                  }`}>
                  {deliveryTypeLabel(order)}
                </p>
              </td>
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
                  <button type="button" onClick={() => onView?.(order)} className="inline-flex items-center gap-1 text-[#D62300] text-xs font-semibold hover:underline cursor-pointer">
                    <Eye size={14} />
                    {tAdmin('view')}
                  </button>
                </td>
              )}
            </tr>
          ))}
          {!orders.length && <EmptyTableRow colSpan={compact ? 5 : 6} message={tAdmin('no_orders')} />}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminOrders({ orders, counts, loading, meta, filters, setFilters, onStatusChange, onPageChange }) {
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
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${filters.status === tab.key ? 'bg-[#D62300] text-white' : 'bg-gray-50 dark:bg-[#161825] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
