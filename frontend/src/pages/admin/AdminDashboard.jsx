import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  Layers,
  Users,
  Star,
} from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import apiClient from '../../api/axios'
import { formatDate, formatVND } from '../../utils/format'
import { useAdminText } from '../../utils/adminUtils'
import { AdminPageShell, EmptyState, Pagination } from '../../components/layout/AdminLayout'
import { OrdersTable } from './AdminOrders'

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

export default function AdminDashboard({ stats, orders, chartData, activityLogs = [], activityMeta, onActivityPageChange }) {
  const tAdmin = useAdminText()
  const navigate = useNavigate()
  const cards = [
    { label: tAdmin('orders'), value: stats?.metrics?.total_orders ?? 0, icon: ShoppingBag, gradient: 'from-[#00C9A7] to-[#00A67C]', path: '/admin/orders' },
    { label: tAdmin('products'), value: stats?.metrics?.total_products ?? 0, icon: Layers, gradient: 'from-[#4E9FFF] to-[#2979FF]', path: '/admin/products' },
    { label: tAdmin('customers'), value: stats?.metrics?.active_customers ?? 0, icon: Users, gradient: 'from-[#FF6B9D] to-[#E91E8C]', path: '/admin/users' },
    { label: tAdmin('reviews'), value: stats?.metrics?.total_reviews ?? 0, icon: Star, gradient: 'from-[#FFB347] to-[#FF9500]', path: '/admin/reviews' },
  ]

  const activities = activityLogs.map(activity => ({
    ...activity,
    role: activity.role === 'admin' ? tAdmin('admin_role') : tAdmin('customer'),
    time: formatDate(activity.time),
  }))

  return (
    <AdminPageShell title={tAdmin('dashboard')}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => navigate(card.path)}
              className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-6 text-left text-white relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-200`}
            >
              <div className="absolute right-4 top-4 opacity-20"><Icon size={48} /></div>
              <p className="text-sm font-medium opacity-80">{card.label}</p>
              <p className="text-3xl font-bold mt-1">{card.value}</p>
              {card.badge && <span className="mt-3 inline-block text-xs bg-white/20 rounded-full px-3 py-1">{card.badge}</span>}
            </button>
          )
        })}
      </div>

      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800 dark:text-gray-100">{tAdmin('last_7_days_revenue')}</h3>
        </div>
        {chartData.length ? (
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
        ) : (
          <EmptyState message={tAdmin('no_chart_data')} className="h-[280px]" />
        )}
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
            {!activities.length && <EmptyState message={tAdmin('no_activity_logs')} className="h-[180px]" />}
          </div>
          <div className="mt-5 flex justify-end">
            <Pagination
              page={activityMeta?.current_page || 1}
              totalPages={activityMeta?.last_page || 1}
              onChange={onActivityPageChange}
            />
          </div>
        </div>
      </div>
    </AdminPageShell>
  )
}
