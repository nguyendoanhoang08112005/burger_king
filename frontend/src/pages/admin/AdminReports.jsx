/**
 * AdminReports.jsx - Reports and analytics page
 */
import { Download } from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useAdminText } from '../../utils/adminUtils'
import { AdminPageShell, EmptyState, EmptyTableRow } from '../../components/layout/AdminLayout'
import { formatVND } from '../../utils/format'

const STATUS_TABS = [
  { key: 'pending' },
  { key: 'confirmed' },
  { key: 'preparing' },
  { key: 'delivering' },
  { key: 'completed' },
  { key: 'cancelled' },
]

const COLORS = ['#D62300', '#2563EB', '#F59E0B', '#8B5CF6', '#10B981', '#EC4899', '#0891B2', '#84CC16', '#F97316', '#6366F1']

export default function AdminReportsPage({ stats, chartData = [], reportData = {} }) {
  const tAdmin = useAdminText()
  const topProducts = reportData.topProducts || stats?.top_products || []
  const topCustomers = reportData.topCustomers || []

  const statusData = STATUS_TABS
    .map(tab => ({ key: tab.key, name: tAdmin(`status_${tab.key}`), value: Number(reportData.counts?.[tab.key] || 0) }))
    .filter(item => item.value > 0)

  const completedOrdersInChart = chartData.reduce((sum, item) => sum + Number(item.orders || 0), 0)
  const delivered = Number(reportData.counts?.completed || 0)
  const total = Number(reportData.counts?.total ||
    STATUS_TABS.reduce((sum, tab) => tab.key ? sum + Number(reportData.counts?.[tab.key] || 0) : sum, 0))

  const summaryCards = [
    [tAdmin('total_revenue'), formatVND(reportData.total_revenue || 0)],
    [tAdmin('average_order_value'), formatVND(reportData.average_order_value || 0)],
    [tAdmin('completed_orders_30_days'), reportData.completed_orders_30_days ?? completedOrdersInChart],
    [tAdmin('completion_rate'), `${total ? Math.round((delivered / total) * 100) : 0}%`],
  ]

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
    <AdminPageShell
      title={tAdmin('reports')}
      action={<><Download size={15} /> {tAdmin('export_csv')}</>}
      onAction={exportCSV}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {summaryCards.map(([label, value]) => (
          <div key={label} className="bg-white dark:bg-[#1E2130] rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)] gap-6">
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">{tAdmin('report_revenue_30_days')}</h3>
          {chartData.length ? (
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
          ) : (
            <EmptyState message={tAdmin('no_chart_data')} className="h-[300px]" />
          )}
        </div>

        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 dark:text-gray-100">{tAdmin('orders_by_status')}</h3>
          <p className="text-xs text-gray-400 mt-1 mb-4">{tAdmin('orders_by_status_hint')}</p>
          {statusData.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={92} innerRadius={48} paddingAngle={3} label={({ value }) => value}>
                  {statusData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
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
        {topProducts.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" radius={[8, 8, 0, 0]}>
                {topProducts.map((product, index) => <Cell key={product.sku || product.name} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message={tAdmin('no_top_products')} className="h-[300px]" />
        )}
      </div>

      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm overflow-x-auto">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">{tAdmin('top_customers')}</h3>
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700">
              <th className="py-3">{tAdmin('customer')}</th>
              <th>{tAdmin('email')}</th>
              <th>{tAdmin('orders_count')}</th>
              <th>{tAdmin('total_spent')}</th>
            </tr>
          </thead>
          <tbody>
            {topCustomers.map(customer => (
              <tr key={customer.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-3 font-semibold">{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.orders_count}</td>
                <td>{formatVND(customer.total_spent)}</td>
              </tr>
            ))}
            {!topCustomers.length && <EmptyTableRow colSpan={4} message={tAdmin('no_top_customers')} />}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  )
}
