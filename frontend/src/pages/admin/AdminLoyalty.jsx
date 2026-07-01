/**
 * AdminLoyalty.jsx - Loyalty points overview page
 */
import { useState } from 'react'
import { useAdminText } from '../../utils/adminUtils'
import { AdminPageShell, TableSkeleton, EmptyTableRow, Pagination } from '../../components/layout/AdminLayout'

export default function AdminLoyaltyPage({ users = [], loading = false }) {
  const tAdmin = useAdminText()
  const customers = users.filter(user => user.role === 'customer')
  const totalPoints = customers.reduce((sum, user) => sum + Number(user.loyalty_balance || 0), 0)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const topCustomers = [...customers].sort((a, b) => Number(b.loyalty_balance || 0) - Number(a.loyalty_balance || 0))
  const totalPages = Math.max(1, Math.ceil(topCustomers.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedCustomers = topCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="py-3">{tAdmin('customer')}</th>
                <th>{tAdmin('email')}</th>
                <th>{tAdmin('phone')}</th>
                <th>{tAdmin('orders_count')}</th>
                <th>{tAdmin('points')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paginatedCustomers.map(user => (
                <tr key={user.id}>
                  <td className="py-3 font-semibold">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td>{user.orders_count || 0}</td>
                  <td className="font-bold text-[#D62300]">{user.loyalty_balance || 0}</td>
                </tr>
              ))}
              {!topCustomers.length && <EmptyTableRow colSpan={5} />}
            </tbody>
          </table>
        )}
        <div className="mt-5 flex justify-end">
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </AdminPageShell>
  )
}
