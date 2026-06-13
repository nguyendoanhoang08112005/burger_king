import { useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Trash2, Unlock, Lock, X, Loader2 } from 'lucide-react'
import apiClient from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import { formatDate } from '../../utils/format'
import { useAdminText, fieldInputClass } from '../../utils/adminUtils'
import {
  AdminPageShell,
  ConfirmDialog,
  TableSkeleton,
  EmptyTableRow,
  Pagination,
  adminPermissionModules
} from '../../components/layout/AdminLayout'

export function UserFormModal({ user, onClose, onSaved }) {
  const tAdmin = useAdminText()
  const [saving, setSaving] = useState(false)
  const isCreate = !user
  const managesPermissions = isCreate || user.role === 'staff'
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    password_confirmation: '',
    permissions: (user?.permissions || []).map(permission => permission.name?.replace('access.', '') || permission.replace?.('access.', '')).filter(Boolean),
  })

  const togglePermission = module => setForm(prev => ({
    ...prev,
    permissions: prev.permissions.includes(module)
      ? prev.permissions.filter(item => item !== module)
      : [...prev.permissions, module],
  }))

  const save = async event => {
    event.preventDefault()
    setSaving(true)
    try {
      if (isCreate) {
        await apiClient.post('/admin/users/staff', form)
      } else if (user.role === 'staff') {
        await apiClient.put(`/admin/users/${user.id}/staff`, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          permissions: form.permissions,
        })
      } else {
        await apiClient.put(`/admin/users/${user.id}`, {
          name: form.name,
          email: form.email,
          phone: form.phone,
        })
      }
      toast.success(tAdmin(isCreate ? 'staff_created' : 'user_updated'))
      await onSaved()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('generic_error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={save} className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#1E2130] shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 p-5">
          <div className="text-left">
            <h3 className="text-lg font-bold">{tAdmin(isCreate ? 'add_staff' : 'edit_user')}</h3>
            <p className="text-xs text-gray-400 mt-1">{tAdmin(managesPermissions ? 'staff_permissions_hint' : 'user_edit_hint')}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-5 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={tAdmin('name')} className={fieldInputClass} />
            <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={tAdmin('email')} className={fieldInputClass} />
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder={tAdmin('phone')} className={fieldInputClass} />
            <div />
            {isCreate ? (
              <>
                <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={tAdmin('password')} className={fieldInputClass} />
                <input required type="password" value={form.password_confirmation} onChange={e => setForm({ ...form, password_confirmation: e.target.value })} placeholder={tAdmin('password_confirmation')} className={fieldInputClass} />
              </>
            ) : (
              <input disabled value="********" aria-label={tAdmin('password')} title={tAdmin('password_managed_separately')} className={`${fieldInputClass} bg-gray-50 text-gray-400 cursor-not-allowed`} />
            )}
          </div>
          {managesPermissions && <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold">{tAdmin('permissions')}</h4>
              <button type="button" onClick={() => setForm(prev => ({ ...prev, permissions: prev.permissions.length === adminPermissionModules.length ? [] : [...adminPermissionModules] }))} className="text-xs font-semibold text-[#D62300]">{tAdmin('select_all')}</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {adminPermissionModules.map(module => (
                <label key={module} className="flex items-center gap-2 rounded-xl border border-gray-100 dark:border-gray-700 p-3 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.permissions.includes(module)} onChange={() => togglePermission(module)} />
                  {tAdmin(module)}
                </label>
              ))}
            </div>
          </div>}
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 p-5">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 dark:text-gray-300 dark:border-gray-700">{tAdmin('cancel')}</button>
          <button disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D62300] text-white text-sm font-semibold disabled:opacity-50 hover:bg-[#b51e00] cursor-pointer">{saving && <Loader2 size={15} className="animate-spin" />}{tAdmin('save')}</button>
        </div>
      </form>
    </div>
  )
}

export function AdminUsersPage({ users, loading, onRefresh }) {
  const tAdmin = useAdminText()
  const { user: currentUser } = useAuthStore()
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [userModal, setUserModal] = useState(null)
  const [confirm, setConfirm] = useState({ open: false })
  const [confirmLoading, setConfirmLoading] = useState(false)
  const filtered = users.filter(user => (!role || user.role === role) && [user.name, user.email, user.phone].join(' ').toLowerCase().includes(search.toLowerCase()))
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedUsers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const runConfirmedAction = (title, message, action, successKey) => {
    setConfirm({
      open: true,
      title,
      message,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          await action()
          toast.success(tAdmin(successKey))
          await onRefresh()
          setConfirm({ open: false })
        } catch (error) {
          toast.error(error.response?.data?.message || tAdmin('generic_error'))
        } finally {
          setConfirmLoading(false)
        }
      },
    })
  }

  const toggleStatus = user => runConfirmedAction(
    tAdmin(user.deleted_at ? 'unlock_user' : 'lock_user'),
    tAdmin(user.deleted_at ? 'confirm_unlock_user' : 'confirm_lock_user', { name: user.name }),
    () => apiClient.patch(`/admin/users/${user.id}/toggle-status`),
    user.deleted_at ? 'user_unlocked' : 'user_locked'
  )

  const deleteUser = user => runConfirmedAction(
    tAdmin('delete_user'),
    tAdmin('confirm_delete_user', { name: user.name }),
    () => apiClient.delete(`/admin/users/${user.id}`),
    'user_deleted'
  )

  return (
    <AdminPageShell title={tAdmin('users_title')} action={currentUser?.role === 'admin' ? tAdmin('add_staff') : undefined} onAction={currentUser?.role === 'admin' ? () => setUserModal({ create: true }) : undefined}>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row gap-3">
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder={tAdmin('search_users')} className="border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100" />
          <select value={role} onChange={e => { setRole(e.target.value); setPage(1) }} className="border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100">
            <option value="">{tAdmin('all_roles')}</option><option value="customer">{tAdmin('customer')}</option><option value="admin">Admin</option><option value="staff">{tAdmin('staff')}</option>
          </select>
        </div>
        {loading ? <TableSkeleton rows={6} cols={10} /> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead><tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700"><th className="py-3">{tAdmin('avatar')}</th><th>{tAdmin('name')}</th><th>{tAdmin('email')}</th><th>{tAdmin('phone')}</th><th>{tAdmin('role')}</th><th>{tAdmin('status')}</th><th>{tAdmin('orders_count')}</th><th>{tAdmin('points')}</th><th>{tAdmin('created_at')}</th><th className="text-right">{tAdmin('actions')}</th></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">{paginatedUsers.map(user => (
              <tr key={user.id} className={`${user.deleted_at ? 'opacity-60' : ''} text-gray-700 dark:text-gray-200`}>
                <td className="py-3"><div className="w-9 h-9 rounded-full bg-[#D62300] text-white flex items-center justify-center font-bold">{user.name?.charAt(0)}</div></td>
                <td className="font-semibold">{user.name}</td><td>{user.email}</td><td>{user.phone || '-'}</td>
                <td><span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{user.role}</span></td>
                <td><span className={`text-xs px-2 py-1 rounded-full ${user.deleted_at ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{tAdmin(user.deleted_at ? 'locked' : 'active')}</span></td>
                <td>{user.orders_count || 0}</td><td>{user.loyalty_balance || 0}</td><td>{formatDate(user.created_at)}</td>
                <td className="text-right">
                  {currentUser?.role === 'admin' && <div className="flex items-center justify-end gap-1">
                    <button type="button" onClick={() => setUserModal(user)} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer" title={tAdmin('edit_user')}><Pencil size={15} /></button>
                    {user.role !== 'admin' && user.id !== currentUser.id && <>
                      <button type="button" onClick={() => toggleStatus(user)} className={`p-2 rounded-lg cursor-pointer ${user.deleted_at ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10' : 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10'}`} title={tAdmin(user.deleted_at ? 'unlock_user' : 'lock_user')}>{user.deleted_at ? <Unlock size={15} /> : <Lock size={15} />}</button>
                      <button type="button" onClick={() => deleteUser(user)} className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer" title={tAdmin('delete_user')}><Trash2 size={15} /></button>
                    </>}
                  </div>}
                </td>
              </tr>
            ))}
              {!filtered.length && <EmptyTableRow colSpan={10} />}
            </tbody>
          </table></div>
        )}
        <div className="flex justify-end">
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
      {userModal && <UserFormModal user={userModal.create ? null : userModal} onClose={() => setUserModal(null)} onSaved={onRefresh} />}
      <ConfirmDialog open={confirm.open} title={confirm.title} message={confirm.message} onCancel={() => setConfirm({ open: false })} onConfirm={confirm.onConfirm} loading={confirmLoading} />
    </AdminPageShell>
  )
}
