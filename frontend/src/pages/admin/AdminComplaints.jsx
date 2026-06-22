import { useState } from 'react'
import toast from 'react-hot-toast'
import { Search, Eye, X } from 'lucide-react'
import apiClient from '../../api/axios'
import { useAdminText, fieldInputClass } from '../../utils/adminUtils'
import {
  AdminPageShell,
  TableSkeleton,
  EmptyTableRow,
  Pagination
} from '../../components/layout/AdminLayout'

export function AdminComplaintsPage({ complaints, loading, counts, meta, filters, setFilters, onPageChange, onRefresh }) {
  const tAdmin = useAdminText()
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [zoomImage, setZoomImage] = useState(null)

  const [status, setStatus] = useState('reviewing')
  const [resolutionType, setResolutionType] = useState('apology')
  const [adminNote, setAdminNote] = useState('')
  const [resolutionNote, setResolutionNote] = useState('')
  const [refundAmount, setRefundAmount] = useState(0)
  const [processing, setProcessing] = useState(false)

  const applyTemplate = (newStatus, newResolutionType, newRefundAmount) => {
    const lang = localStorage.getItem('hk_language') || 'vi'
    const isEn = lang === 'en'
    
    if (newStatus === 'rejected') {
      setResolutionNote(isEn 
        ? "After verifying the details and evidence, the store regrets to inform you that we cannot resolve this complaint due to insufficient grounds."
        : "Sau khi kiểm tra xác minh thông tin từ bộ phận vận hành và hình ảnh bằng chứng, cửa hàng xin phép từ chối giải quyết khiếu nại này do không đủ căn cứ."
      )
    } else if (newStatus === 'resolved') {
      if (newResolutionType === 'apology') {
        setResolutionNote(isEn
          ? "We are very sorry for this unsatisfactory experience. Hamburger King sincerely apologizes and will improve our service quality."
          : "Rất xin lỗi quý khách về sự cố trải nghiệm không tốt này. Hamburger King chân thành xin lỗi và sẽ cải thiện chất lượng dịch vụ tốt hơn."
        )
      } else if (newResolutionType === 'redeliver') {
        setResolutionNote(isEn
          ? "Hamburger King has confirmed the issue and will immediately prepare and deliver the faulty items to you free of charge."
          : "Hamburger King đã xác nhận sự cố và sẽ tiến hành chuẩn bị đơn giao lại miễn phí các món bị lỗi cho quý khách ngay lập tức."
        )
      } else if (newResolutionType === 'refund') {
        const amtStr = Number(newRefundAmount || 0).toLocaleString(isEn ? 'en-US' : 'vi-VN')
        setResolutionNote(isEn
          ? `The store agrees to refund ${amtStr} VND to your account. Please reply with your bank/Momo account details so we can complete the transfer.`
          : `Cửa hàng đồng ý hoàn tiền ${amtStr}đ vào tài khoản của bạn. Vui lòng phản hồi lại thông tin Số tài khoản ngân hàng hoặc Momo để cửa hàng thực hiện giao dịch hoàn tiền.`
        )
      } else if (newResolutionType === 'voucher') {
        setResolutionNote(isEn
          ? "Sincere apologies for the issue with your order. We would like to send you a compensation discount coupon for your next order."
          : "Thành thật xin lỗi quý khách về sự cố trên đơn hàng. Cửa hàng xin gửi tặng bạn một mã giảm giá bồi thường cho lần mua hàng tiếp theo."
        )
      }
    }
  }

  const formatCount = value => Number.parseInt(Number(value || 0), 10)

  const handleViewDetails = async (complaintId) => {
    try {
      const { data } = await apiClient.get(`/admin/complaints/${complaintId}`)
      setSelectedComplaint(data.data)
      setStatus(data.data.status === 'pending' ? 'reviewing' : data.data.status)
      setResolutionType(data.data.resolution_type || 'apology')
      setAdminNote(data.data.admin_note || '')
      setResolutionNote(data.data.resolution_note || '')
      setRefundAmount(data.data.refund_amount || 0)
    } catch (err) {
      console.error(err)
      toast.error(tAdmin('complaint_err_load'))
    }
  }

  const handleProcessSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)
    try {
      const payload = {
        status,
        resolution_type: status !== 'reviewing' ? resolutionType : undefined,
        resolution_note: status !== 'reviewing' ? resolutionNote : undefined,
        admin_note: adminNote,
        refund_amount: (status === 'resolved' && resolutionType === 'refund') ? Number(refundAmount) : undefined,
      }
      await apiClient.post(`/admin/complaints/${selectedComplaint.id}/process`, payload)
      toast.success(tAdmin('complaint_success_process'))
      setSelectedComplaint(null)
      onRefresh()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || tAdmin('complaint_err_process'))
    } finally {
      setProcessing(false)
    }
  }

  const statusLabels = {
    pending: tAdmin('status_pending_complaint'),
    reviewing: tAdmin('status_reviewing_complaint'),
    resolved: tAdmin('status_resolved_complaint'),
    rejected: tAdmin('status_rejected_complaint'),
  }

  const typeLabels = {
    wrong_item: tAdmin('issue_wrong_item'),
    missing_item: tAdmin('issue_missing_item'),
    bad_quality: tAdmin('issue_bad_quality'),
    late_delivery: tAdmin('issue_late_delivery'),
    shipper_attitude: tAdmin('issue_shipper_attitude'),
    other: tAdmin('issue_other'),
  }

  const desiredLabels = {
    redeliver: tAdmin('desired_redeliver'),
    refund_partial: tAdmin('desired_refund_partial'),
    refund_full: tAdmin('desired_refund_full'),
    feedback_only: tAdmin('desired_feedback_only'),
  }

  const issueLabels = {
    wrong: tAdmin('fault_wrong'),
    missing: tAdmin('fault_missing'),
    bad_quality: tAdmin('fault_bad_quality'),
    other: tAdmin('fault_other'),
  }

  return (
    <AdminPageShell title={tAdmin('complaints_management')}>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap gap-2">
          {[
            { key: '', label: tAdmin('all'), countKey: 'total' },
            { key: 'pending', label: tAdmin('status_pending_complaint'), countKey: 'pending' },
            { key: 'reviewing', label: tAdmin('status_reviewing_complaint'), countKey: 'reviewing' },
            { key: 'resolved', label: tAdmin('status_resolved_complaint'), countKey: 'resolved' },
            { key: 'rejected', label: tAdmin('status_rejected_complaint'), countKey: 'rejected' }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, status: tab.key, page: 1 }))}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filters.status === tab.key
                  ? 'bg-[#D62300] text-white'
                  : 'bg-gray-50 dark:bg-[#161825] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label} <span className="opacity-70">({formatCount(counts?.[tab.countKey])})</span>
            </button>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={filters.search || ''}
            onChange={event => setFilters(prev => ({ ...prev, search: event.target.value, page: 1 }))}
            placeholder={tAdmin('search_complaints')}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="py-3">{tAdmin('complaint_order_code')}</th>
                  <th className="py-3">{tAdmin('complaint_customer')}</th>
                  <th className="py-3">{tAdmin('complaint_issue_type')}</th>
                  <th className="py-3">{tAdmin('complaint_desired_resolution')}</th>
                  <th className="py-3">{tAdmin('complaint_sla')}</th>
                  <th className="py-3">{tAdmin('complaint_status')}</th>
                  <th className="py-3 text-right">{tAdmin('complaint_action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {complaints.map(item => {
                  let slaText = tAdmin('sla_resolved')
                  let slaClass = 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  if (['pending', 'reviewing'].includes(item.status)) {
                    if (item.is_overdue) {
                      slaText = tAdmin('sla_overdue')
                      slaClass = 'bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300 animate-pulse font-bold'
                    } else if (item.sla_hours_remaining <= 12) {
                      slaText = tAdmin('sla_urgent', { hours: item.sla_hours_remaining })
                      slaClass = 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300 font-bold'
                    } else {
                      slaText = tAdmin('sla_hours', { hours: item.sla_hours_remaining })
                      slaClass = 'bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300'
                    }
                  }

                  return (
                    <tr key={item.id} className="text-gray-700 dark:text-gray-200">
                      <td className="py-3 font-bold">{item.order?.order_code || `#${item.order_id}`}</td>
                      <td className="py-3">
                        <p className="font-semibold">{item.user?.name}</p>
                        <p className="text-[10px] text-gray-400">{item.user?.email}</p>
                      </td>
                      <td className="py-3 font-medium">{typeLabels[item.type] || item.type}</td>
                      <td className="py-3 font-medium">{desiredLabels[item.desired_resolution] || item.desired_resolution}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${slaClass}`}>
                          {slaText}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          item.status === 'reviewing' ? 'bg-blue-100 text-blue-700' :
                          item.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {statusLabels[item.status] || item.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(item.id)}
                          className="inline-flex items-center gap-1 text-[#D62300] text-xs font-semibold hover:underline cursor-pointer"
                        >
                          <Eye size={14} />
                          {tAdmin('view')}
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {!complaints.length && <EmptyTableRow colSpan={7} message={tAdmin('no_complaints')} />}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex justify-end">
            <Pagination page={meta.current_page} totalPages={meta.last_page} onChange={onPageChange} />
          </div>
        )}
      </div>

      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#1E2130] rounded-2xl shadow-xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 p-5">
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                {tAdmin('complaint_details_title', { code: selectedComplaint.order?.order_code })}
              </h3>
              <button 
                type="button"
                onClick={() => setSelectedComplaint(null)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6 text-xs text-gray-700 dark:text-gray-200 text-left">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-800 p-4 rounded-xl">
                <div>
                  <span className="text-gray-400 font-semibold block uppercase text-[10px]">{tAdmin('complaint_customer')}</span>
                  <span className="font-bold">{selectedComplaint.user?.name} ({selectedComplaint.user?.email})</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block uppercase text-[10px]">{tAdmin('complaint_issue_type')}</span>
                  <span className="font-bold">{typeLabels[selectedComplaint.type] || selectedComplaint.type}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block uppercase text-[10px]">{tAdmin('complaint_feedback')}</span>
                  <span className="font-bold whitespace-pre-wrap">{selectedComplaint.description}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block uppercase text-[10px]">{tAdmin('complaint_desired')}</span>
                  <span className="font-bold text-[#D62300]">{desiredLabels[selectedComplaint.desired_resolution]}</span>
                </div>
              </div>

              {selectedComplaint.items && selectedComplaint.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase text-gray-400">{tAdmin('complaint_faulty_items')}</h4>
                  <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-[#1E2130]">
                    {selectedComplaint.items.map(cItem => (
                      <div key={cItem.id} className="p-3 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold">{cItem.product_name}</p>
                          {cItem.note && <p className="text-[10px] text-gray-400 italic">"{tAdmin('complaint_item_note', { note: cItem.note })}"</p>}
                        </div>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-100 rounded text-[10px] font-bold uppercase">
                          {issueLabels[cItem.issue_type] || cItem.issue_type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase text-gray-400">{tAdmin('complaint_evidence_images')}</h4>
                  <div className="flex gap-2">
                    {selectedComplaint.images.map((img, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setZoomImage(img)}
                        className="w-20 h-20 rounded-xl border border-gray-100 overflow-hidden cursor-pointer bg-gray-50 focus:outline-none"
                      >
                        <img src={img} alt="Evidence" className="w-full h-full object-cover hover:scale-105 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleProcessSubmit} className="border-t border-gray-100 dark:border-gray-700 pt-5 space-y-4">
                <h4 className="font-bold text-xs uppercase text-gray-400">{tAdmin('complaint_process_title')}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="block">
                    <span className="text-gray-400 font-semibold block uppercase text-[10px] mb-2">{tAdmin('complaint_process_status')}</span>
                    <select
                      value={status}
                      onChange={e => {
                        const val = e.target.value
                        setStatus(val)
                        const nextType = val === 'rejected' ? 'rejected' : resolutionType
                        if (val === 'rejected') setResolutionType('rejected')
                        else if (resolutionType === 'rejected') {
                          setResolutionType('apology')
                          applyTemplate(val, 'apology', refundAmount)
                          return
                        }
                        applyTemplate(val, nextType, refundAmount)
                      }}
                      className={`${fieldInputClass} mt-1`}
                    >
                      <option value="reviewing">{tAdmin('status_reviewing_complaint')}</option>
                      <option value="resolved">{tAdmin('status_resolved_complaint')}</option>
                      <option value="rejected">{tAdmin('status_rejected_complaint')}</option>
                    </select>
                  </div>

                  {status === 'resolved' && (
                    <div className="block">
                      <span className="text-gray-400 font-semibold block uppercase text-[10px] mb-2">{tAdmin('complaint_process_resolution')}</span>
                      <select
                        value={resolutionType}
                        onChange={e => {
                          const val = e.target.value
                          setResolutionType(val)
                          applyTemplate(status, val, refundAmount)
                        }}
                        className={`${fieldInputClass} mt-1`}
                      >
                        <option value="redeliver">{tAdmin('resolution_redeliver')}</option>
                        <option value="refund">{tAdmin('resolution_refund')}</option>
                        <option value="voucher">{tAdmin('resolution_voucher')}</option>
                        <option value="apology">{tAdmin('resolution_apology')}</option>
                      </select>
                    </div>
                  )}

                  {status === 'rejected' && (
                    <div className="block">
                      <span className="text-gray-400 font-semibold block uppercase text-[10px] mb-2">{tAdmin('complaint_process_reject_reason')}</span>
                      <select
                        value={resolutionType}
                        onChange={e => setResolutionType(e.target.value)}
                        className={`${fieldInputClass} mt-1`}
                      >
                        <option value="rejected">{tAdmin('resolution_rejected')}</option>
                      </select>
                    </div>
                  )}
                </div>

                {status === 'resolved' && resolutionType === 'refund' && (
                  <div className="block animate-fade-in">
                    <span className="text-gray-400 font-semibold block uppercase text-[10px] mb-2">{tAdmin('complaint_process_refund_amount')}</span>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={e => {
                        const val = Number(e.target.value)
                        setRefundAmount(val)
                        applyTemplate(status, resolutionType, val)
                      }}
                      placeholder={tAdmin('complaint_process_refund_placeholder')}
                      className={fieldInputClass}
                      min="0"
                      required
                    />
                    <p className="text-[10px] text-gray-400 mt-1">{tAdmin('complaint_process_refund_hint')}</p>
                  </div>
                )}

                <div className="block">
                  <span className="text-gray-400 font-semibold block uppercase text-[10px] mb-2">{tAdmin('complaint_process_admin_note')}</span>
                  <textarea
                    rows={2}
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    placeholder={tAdmin('complaint_process_admin_note_placeholder')}
                    className={fieldInputClass}
                  />
                </div>

                {status !== 'reviewing' && (
                  <div className="block animate-fade-in">
                    <span className="text-gray-400 font-semibold block uppercase text-[10px] mb-2">{tAdmin('complaint_process_reply')}</span>
                    <textarea
                      rows={3}
                      value={resolutionNote}
                      onChange={e => setResolutionNote(e.target.value)}
                      placeholder={tAdmin('complaint_process_reply_placeholder')}
                      className={fieldInputClass}
                      required
                    />
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="border border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-gray-700 dark:text-gray-300 dark:hover:bg-slate-800 px-5 py-2.5 rounded-xl font-bold cursor-pointer"
                  >
                    {tAdmin('complaint_close')}
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="bg-[#D62300] hover:bg-[#b51e00] text-white px-6 py-2.5 rounded-xl font-bold transition shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {processing ? tAdmin('complaint_updating') : tAdmin('complaint_update_btn')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {zoomImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <button 
            type="button"
            onClick={() => setZoomImage(null)}
            className="absolute top-5 right-5 text-white hover:text-gray-300 bg-black/40 rounded-full p-2 z-10 cursor-pointer"
          >
            <X size={24} />
          </button>
          <img src={zoomImage} alt="Zoomed Evidence" className="max-w-full max-h-[90vh] object-contain rounded-lg animate-float-half shadow-2xl" />
        </div>
      )}
    </AdminPageShell>
  )
}
