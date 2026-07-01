import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Pencil, Trash2, Loader2, MoreVertical } from 'lucide-react'
import apiClient from '../../api/axios'
import { formatDate, formatVND } from '../../utils/format'
import { useAdminText } from '../../utils/adminUtils'
import {
  AdminPageShell,
  ConfirmDialog,
  TableSkeleton,
  EmptyTableRow,
  Pagination
} from '../../components/layout/AdminLayout'

export function AdminCouponsPage({ coupons, loading, onRefresh }) {
  const { i18n } = useTranslation()
  const isEn = i18n.language === 'en'
  const tAdmin = useAdminText()
  const emptyForm = { code: '', type: 'percent', value: '', min_order: 0, max_discount: '', usage_limit: '', starts_at: '', expires_at: '', is_active: true, show_at_checkout: false }
  const [form, setForm] = useState(emptyForm)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [confirm, setConfirm] = useState({ open: false })
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState(null)

  const filteredCoupons = coupons.filter(coupon => {
    const matchSearch = [coupon.code, coupon.type].join(' ').toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || (statusFilter === 'active' ? coupon.is_active : !coupon.is_active)
    return matchSearch && matchStatus
  })
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedCoupons = filteredCoupons.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
      show_at_checkout: coupon.show_at_checkout ?? false,
    })
  }

  const payload = () => ({
    ...form,
    code: form.code.trim().toUpperCase(),
    value: form.type === 'free_ship' ? 0 : Number(form.value || 0),
    min_order: Number(form.min_order || 0),
    max_discount: form.type === 'percent' && form.max_discount !== '' ? Number(form.max_discount) : null,
    usage_limit: form.usage_limit !== '' ? Number(form.usage_limit) : null,
    starts_at: form.starts_at || null,
    expires_at: form.expires_at || null,
    is_active: !!form.is_active,
    show_at_checkout: !!form.show_at_checkout,
  })

  const submit = async event => {
    event.preventDefault()
    setSaving(true)
    try {
      if (editingCoupon) {
        await apiClient.put(`/admin/coupons/${editingCoupon.id}`, payload())
        toast.success(tAdmin('coupon_updated'))
      } else {
        await apiClient.post('/admin/coupons', payload())
        toast.success(tAdmin('coupon_created'))
      }
      resetForm()
      await onRefresh()
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('coupon_save_error'))
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async coupon => {
    try {
      await apiClient.put(`/admin/coupons/${coupon.id}`, { ...coupon, is_active: !coupon.is_active })
      toast.success(coupon.is_active ? tAdmin('coupon_disabled') : tAdmin('coupon_enabled'))
      await onRefresh()
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('update_error'))
    }
  }

  const toggleShowCheckout = async coupon => {
    try {
      await apiClient.put(`/admin/coupons/${coupon.id}`, { ...coupon, show_at_checkout: !coupon.show_at_checkout })
      toast.success(coupon.show_at_checkout 
        ? tAdmin('coupon_hidden_checkout', { defaultValue: isEn ? 'Coupon hidden at checkout' : 'Đã ẩn ở checkout' }) 
        : tAdmin('coupon_shown_checkout', { defaultValue: isEn ? 'Coupon shown at checkout' : 'Đã hiện ở checkout' })
      )
      await onRefresh()
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('update_error'))
    }
  }

  const deleteCoupon = coupon => {
    setConfirm({
      open: true,
      title: tAdmin('delete_coupon_title'),
      message: tAdmin('delete_coupon_message', { code: coupon.code }),
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          await apiClient.delete(`/admin/coupons/${coupon.id}`)
          toast.success(tAdmin('coupon_deleted'))
          if (editingCoupon?.id === coupon.id) resetForm()
          setConfirm({ open: false })
          await onRefresh()
        } finally {
          setConfirmLoading(false)
        }
      },
    })
  }

  const inputClass = 'w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100'

  return (
    <AdminPageShell title={tAdmin('coupons_title')}>
      <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6">
        <form onSubmit={submit} className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-left">
            <h3 className="font-bold">{editingCoupon ? tAdmin('edit_coupon') : tAdmin('add_coupon')}</h3>
            {editingCoupon && <button type="button" onClick={resetForm} className="text-xs font-semibold text-gray-500 hover:text-[#D62300]">{tAdmin('cancel_edit')}</button>}
          </div>
          <div className="flex gap-2">
            <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CODE" className={inputClass} />
            <button type="button" onClick={generateCode} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-semibold">{tAdmin('random')}</button>
          </div>
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputClass}>
            <option value="percent">{tAdmin('percent')}</option>
            <option value="fixed">{tAdmin('fixed')}</option>
            <option value="free_ship">{tAdmin('free_ship')}</option>
          </select>
          {form.type !== 'free_ship' && (
            <input required type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder={tAdmin('value')} className={inputClass} />
          )}
          <input type="number" value={form.min_order} onChange={e => setForm({ ...form, min_order: e.target.value })} placeholder={tAdmin('min_order')} className={inputClass} />
          {form.type === 'percent' && <input type="number" value={form.max_discount} onChange={e => setForm({ ...form, max_discount: e.target.value })} placeholder={tAdmin('max_discount')} className={inputClass} />}
          <input type="number" value={form.usage_limit} onChange={e => setForm({ ...form, usage_limit: e.target.value })} placeholder={tAdmin('usage_limit')} className={inputClass} />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })} className={inputClass} />
            <input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} className={inputClass} />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> {tAdmin('active')}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.show_at_checkout} onChange={e => setForm({ ...form, show_at_checkout: e.target.checked })} /> {tAdmin('show_at_checkout', { defaultValue: isEn ? 'Show at checkout' : 'Hiện ở checkout' })}</label>
          <button disabled={saving} className="w-full bg-[#D62300] text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {editingCoupon ? tAdmin('update_coupon') : tAdmin('save_coupon')}
          </button>
        </form>
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm overflow-x-auto">
          <div className="flex flex-col md:flex-row gap-3 mb-5">
            <input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder={tAdmin('search_coupons')} className={inputClass} />
            <select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(1) }} className={inputClass}>
              <option value="">{tAdmin('all_statuses')}</option>
              <option value="active">{tAdmin('active')}</option>
              <option value="inactive">{tAdmin('inactive')}</option>
            </select>
          </div>
          {loading ? <TableSkeleton rows={6} cols={9} /> : (
            <table className="w-full min-w-[950px] text-left text-sm table-auto">
              <thead><tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="py-3 px-3 w-[13%]">Code</th>
                <th className="py-3 px-3 w-[14%]">{tAdmin('type')}</th>
                <th className="py-3 px-3 w-[9%]">{tAdmin('value')}</th>
                <th className="py-3 px-3 w-[11%]">{tAdmin('min_order')}</th>
                <th className="py-3 px-3 w-[9%]">{tAdmin('used_limit')}</th>
                <th className="py-3 px-3 w-[17%]">{tAdmin('expires')}</th>
                <th className="py-3 px-3 w-[11%]">{tAdmin('status')}</th>
                <th className="py-3 px-3 w-[12%]">{tAdmin('show_at_checkout_th', { defaultValue: isEn ? 'Show at checkout' : 'Hiện ở checkout' })}</th>
                <th className="py-3 px-3 w-[4%] text-right">{tAdmin('actions')}</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedCoupons.map(coupon => (
                  <tr key={coupon.id} className="text-gray-700 dark:text-gray-200">
                    <td className="py-3 px-3 font-bold text-[#D62300] break-all">{coupon.code}</td>
                    <td className="py-3 px-3">{tAdmin(coupon.type)}</td>
                    <td className="py-3 px-3">
                      {coupon.type === 'free_ship' 
                        ? (isEn ? '100% Off' : 'Miễn phí 100%') 
                        : (coupon.type === 'percent' ? `${Number(coupon.value).toFixed(2)}%` : formatVND(coupon.value))
                      }
                    </td>
                    <td className="py-3 px-3">{formatVND(coupon.min_order)}</td>
                    <td className="py-3 px-3">{coupon.used_count || 0}/{coupon.usage_limit || '∞'}</td>
                    <td className="py-3 px-3 text-xs">{coupon.expires_at ? formatDate(coupon.expires_at) : '-'}</td>
                    <td className="py-3 px-3">
                      <button type="button" onClick={() => toggleActive(coupon)} className={`text-xs px-2 py-1 rounded-full ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {coupon.is_active ? tAdmin('active') : tAdmin('inactive')}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <button type="button" onClick={() => toggleShowCheckout(coupon)} className={`text-xs px-2 py-1 rounded-full ${coupon.show_at_checkout ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                        {coupon.show_at_checkout ? tAdmin('yes', 'Có') : tAdmin('no', 'Không')}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuId(openMenuId === coupon.id ? null : coupon.id)
                        }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer"
                        aria-label={tAdmin('actions')}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenuId === coupon.id && (
                        <>
                          {/* Invisible backdrop to close the dropdown on click outside */}
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-[#1E2130] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-20 text-left">
                            <button
                              type="button"
                              onClick={() => {
                                editCoupon(coupon)
                                setOpenMenuId(null)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                            >
                              <Pencil size={13} className="text-gray-400" />
                              {tAdmin('edit', { defaultValue: 'Sửa' })}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteCoupon(coupon)
                                setOpenMenuId(null)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
                            >
                              <Trash2 size={13} className="text-red-500" />
                              {tAdmin('delete', { defaultValue: 'Xóa' })}
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {!filteredCoupons.length && <EmptyTableRow colSpan={9} />}
              </tbody>
            </table>
          )}
          <div className="mt-5 flex justify-end">
            <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>
      </div>
      <ConfirmDialog open={confirm.open} title={confirm.title} message={confirm.message} onCancel={() => setConfirm({ open: false })} onConfirm={confirm.onConfirm} loading={confirmLoading} />
    </AdminPageShell>
  )
}
