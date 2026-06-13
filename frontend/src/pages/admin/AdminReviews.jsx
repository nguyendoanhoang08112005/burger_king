import { useState } from 'react'
import toast from 'react-hot-toast'
import { Eye, Trash2, Loader2, X } from 'lucide-react'
import apiClient from '../../api/axios'
import { formatDate, formatVND } from '../../utils/format'
import { useAdminText, assetUrl } from '../../utils/adminUtils'
import {
  AdminPageShell,
  TableSkeleton,
  EmptyTableRow,
  Pagination
} from '../../components/layout/AdminLayout'

export function AdminReviewsPage({ reviews, loading, onModerate }) {
  const tAdmin = useAdminText()
  const [selectedReview, setSelectedReview] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(reviews.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedReviews = reviews.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const openReview = async (review) => {
    setDetailLoading(true)
    try {
      const res = await apiClient.get(`/admin/reviews/${review.id}`)
      setSelectedReview(res.data.data || res.data)
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('review_load_error'))
    } finally {
      setDetailLoading(false)
    }
  }

  const closeModal = () => {
    setSelectedReview(null)
  }

  const deleteReview = async (review) => {
    if (!window.confirm(tAdmin('delete_review_confirm'))) return
    await onModerate(review.id, 'delete')
    if (selectedReview?.id === review.id) closeModal()
  }

  const reviewImages = Array.isArray(selectedReview?.images) ? selectedReview.images : []
  const orderItems = Array.isArray(selectedReview?.order?.items) ? selectedReview.order.items : []

  return (
    <AdminPageShell title={tAdmin('reviews_title')}>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-5">
        {loading ? <TableSkeleton rows={6} cols={6} /> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead><tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700"><th className="py-3">{tAdmin('product')}</th><th>{tAdmin('customer')}</th><th>{tAdmin('rating')}</th><th>{tAdmin('content')}</th><th>{tAdmin('date')}</th><th className="text-right">{tAdmin('actions')}</th></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">{paginatedReviews.map(review => (
              <tr key={review.id} className="text-gray-700 dark:text-gray-200">
                <td className="py-3">
                  <p className="font-semibold">{review.product?.name || '-'}</p>
                  <p className="mt-1 text-xs text-gray-400">{tAdmin('sku')}: {review.product?.sku || '-'}</p>
                </td>
                <td>{review.user?.name || '-'}</td>
                <td className="text-yellow-500">{'★'.repeat(Number(review.rating || 0))}</td>
                <td className="max-w-xs truncate">{review.comment || '-'}</td>
                <td>{formatDate(review.created_at)}</td>
                <td className="text-right"><div className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => openReview(review)} className="rounded-lg p-2 text-[#D62300] hover:bg-[#D62300]/10 cursor-pointer" title={tAdmin('view_details')}><Eye size={15} /></button>
                  <button type="button" onClick={() => deleteReview(review)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer" title={tAdmin('delete')}><Trash2 size={15} /></button>
                </div></td>
              </tr>
            ))}
              {!reviews.length && <EmptyTableRow colSpan={6} />}
            </tbody>
          </table></div>
        )}
        <div className="flex justify-end">
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
      {(selectedReview || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-[#1E2130]">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-6 dark:border-gray-700">
              <div className="text-left">
                <p className="text-xs uppercase text-gray-400">{tAdmin('review_detail')}</p>
                <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{selectedReview?.product?.name || tAdmin('reviews_title')}</h3>
              </div>
              <button type="button" onClick={closeModal} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#161825]"><X size={18} /></button>
            </div>

            {detailLoading ? (
              <div className="flex h-64 items-center justify-center text-gray-400"><Loader2 className="mr-2 animate-spin" size={18} /> {tAdmin('loading')}</div>
            ) : (
              <div className="space-y-6 p-6 text-left">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-[#161825]"><p className="text-xs uppercase text-gray-400">{tAdmin('order_code')}</p><p className="mt-1 font-bold">{selectedReview?.order?.order_code || '-'}</p></div>
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-[#161825]"><p className="text-xs uppercase text-gray-400">{tAdmin('customer')}</p><p className="mt-1 font-bold">{selectedReview?.user?.name || '-'}</p></div>
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-[#161825]"><p className="text-xs uppercase text-gray-400">{tAdmin('rating')}</p><p className="mt-1 font-bold text-yellow-500">{'★'.repeat(Number(selectedReview?.rating || 0))}</p></div>
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-[#161825]"><p className="text-xs uppercase text-gray-400">{tAdmin('created_at')}</p><p className="mt-1 font-bold">{formatDate(selectedReview?.created_at)}</p></div>
                </div>
                <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700"><p className="text-xs uppercase text-gray-400">{tAdmin('content')}</p><p className="mt-2 whitespace-pre-line text-sm text-gray-700 dark:text-gray-200">{selectedReview?.comment || '-'}</p></div>
                <div>
                  <p className="mb-3 text-xs font-bold uppercase text-gray-400">{tAdmin('images')}</p>
                  {reviewImages.length ? <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{reviewImages.map((image, index) => <a key={`${image}-${index}`} href={assetUrl(image)} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-gray-100"><img src={assetUrl(image)} alt={`${tAdmin('review_image')} ${index + 1}`} className="h-32 w-full object-cover" /></a>)}</div> : <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-400 dark:bg-[#161825]">{tAdmin('no_images')}</p>}
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-[#161825]"><p className="text-xs uppercase text-gray-400">{tAdmin('email')}</p><p className="mt-1 font-semibold">{selectedReview?.user?.email || '-'}</p></div>
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-[#161825]"><p className="text-xs uppercase text-gray-400">{tAdmin('phone')}</p><p className="mt-1 font-semibold">{selectedReview?.user?.phone || '-'}</p></div>
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-[#161825]"><p className="text-xs uppercase text-gray-400">{tAdmin('order_status')}</p><p className="mt-1 font-semibold">{selectedReview?.order?.status || '-'}</p></div>
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-[#161825]"><p className="text-xs uppercase text-gray-400">{tAdmin('total_amount')}</p><p className="mt-1 font-semibold">{selectedReview?.order ? formatVND(selectedReview.order.total) : '-'}</p></div>
                </div>
                <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                  <p className="mb-3 text-xs font-bold uppercase text-gray-400">{tAdmin('order_items')}</p>
                  {orderItems.length ? orderItems.map(item => <div key={item.id || `${item.product_id}-${item.product_name}`} className="flex justify-between gap-4 border-b border-gray-100 py-2 last:border-0 dark:border-gray-700"><div><p className="font-semibold">{item.product_name || item.name || '-'}</p><p className="mt-1 text-xs text-gray-400">{tAdmin('sku')}: {item.product_sku || '-'}{item.size_sku ? ` / ${item.size_sku}` : ''}</p></div><span className="shrink-0 text-gray-500">x{item.quantity || 1}</span></div>) : <p className="text-sm text-gray-400">{tAdmin('no_order_items')}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminPageShell>
  )
}
