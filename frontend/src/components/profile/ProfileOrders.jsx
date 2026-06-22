import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import apiClient from '../../api/axios'
import { formatVND, formatDate } from '../../utils/format'

export default function ProfileOrders() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const loadOrders = useCallback(() => {
    setLoading(true)
    apiClient.get('/orders')
      .then(res => {
        setOrders(res.data.data || [])
      })
      .catch(err => {
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Pagination
  const pageSize = 4
  const totalPages = Math.ceil(orders.length / pageSize)
  const paginatedOrders = orders.slice((page - 1) * pageSize, page * pageSize)

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const goToPage = (nextPage) => {
      setPage(Math.min(Math.max(1, nextPage), totalPages))
    }
    const start = Math.max(1, Math.min(page - 2, totalPages - 4))
    const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => start + index).filter(pageNumber => pageNumber <= totalPages)

    return (
      <div className="flex justify-end border-t border-[#E8E8E8] pt-5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t('common.previous')}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pages.map(pageNumber => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => goToPage(pageNumber)}
              className={`h-8 w-8 rounded-lg text-sm font-semibold transition ${
                pageNumber === page
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-[#F5F5F5]'
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t('common.next')}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 text-left">
      <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">
        {t('profile.order_history')}
      </h2>
      {loading ? (
        <div className="text-center py-6 text-xs text-gray-500">{t('common.loading') || 'Loading...'}</div>
      ) : orders.length === 0 ? (
        <p className="text-xs text-gray-400">{t('order.empty')}</p>
      ) : (
        <>
          {paginatedOrders.map((o) => (
            <div
              key={o.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/orders/tracking/${o.order_code}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  navigate(`/orders/tracking/${o.order_code}`)
                }
              }}
              className="p-4 rounded-xl border border-[#E8E8E8] bg-white flex flex-col sm:flex-row justify-between gap-4 shadow-glass cursor-pointer transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-premium"
            >
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-[#1A1A1A]">{t('order.code_label', { code: o.order_code })}</h4>
                <p className="text-[10px] text-gray-500 mt-1">{t('order.date_label', { date: formatDate(o.created_at) })}</p>
                <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                  {t('order.items_label', { items: o.items?.map(i => i.product_name).join(', ') })}
                </p>
                {o.scheduled_at && (
                  <p className="text-[10px] text-gray-400 mt-1">{t('order.scheduled_at')}: {formatDate(o.scheduled_at)}</p>
                )}
                {o.note && (
                  <p className="text-[10px] text-amber-700 mt-1 line-clamp-2">{t('checkout.order_note')}: {o.note}</p>
                )}
              </div>
              <div className="flex flex-col sm:items-end justify-between">
                <span className="font-heading text-lg text-primary">{formatVND(o.total)}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    o.status === 'completed' ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary'
                  }`}>
                    {t(`order.${o.status?.toLowerCase()}`) || o.status}
                  </span>
                  <Link 
                    to={`/orders/tracking/${o.order_code}`}
                    onClick={(event) => event.stopPropagation()}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    {t('order.track')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {renderPagination()}
        </>
      )}
    </div>
  )
}
