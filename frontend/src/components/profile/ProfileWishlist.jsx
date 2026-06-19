import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import apiClient from '../../api/axios'
import { useUiStore } from '../../store/uiStore'
import { formatVND } from '../../utils/format'
import LazyImage from '../ui/LazyImage'

export default function ProfileWishlist({ onSelectProduct }) {
  const { t } = useTranslation()
  const { showToast } = useUiStore()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const loadWishlist = useCallback(() => {
    setLoading(true)
    apiClient.get('/wishlist')
      .then(res => {
        setWishlist(res.data)
      })
      .catch(err => {
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    loadWishlist()
  }, [loadWishlist])

  const handleRemoveWishlist = (event, wishlistItem) => {
    event.stopPropagation()
    const productId = wishlistItem.product?.id
    if (!productId) return

    apiClient.post('/wishlist', { product_id: productId })
      .then(res => {
        setWishlist(current => current.filter(item => item.id !== wishlistItem.id))
        showToast(res.data.message)
      })
      .catch(error => {
        showToast(error.response?.data?.message || t('common.error'), 'error')
      })
  }

  // Pagination
  const pageSize = 4
  const totalPages = Math.ceil(wishlist.length / pageSize)
  const paginatedWishlist = wishlist.slice((page - 1) * pageSize, page * pageSize)

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
        {t('profile.wishlist_title')}
      </h2>
      {loading ? (
        <div className="text-center py-6 text-xs text-gray-500">{t('common.loading') || 'Loading...'}</div>
      ) : wishlist.length === 0 ? (
        <p className="text-xs text-gray-400">{t('profile.wishlist_empty')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paginatedWishlist.map((w) => (
            <div
              key={w.id}
              role="button"
              tabIndex={0}
              onClick={() => w.product && onSelectProduct?.(w.product)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  if (w.product) onSelectProduct?.(w.product)
                }
              }}
              className="flex gap-4 p-3 rounded-xl border border-[#E8E8E8] bg-white shadow-glass cursor-pointer transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-premium"
            >
              <LazyImage 
                src={w.product?.thumbnail} 
                alt={w.product?.name} 
                className="w-16 h-16 object-cover rounded-lg shrink-0"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#1A1A1A] truncate">{w.product?.name}</h4>
                  <span className="text-[10px] text-primary font-semibold mt-1 block">{formatVND(w.product?.base_price)}</span>
                </div>
                <Link 
                  to="/menu" 
                  onClick={(event) => event.stopPropagation()}
                  className="text-[10px] text-primary hover:underline font-bold"
                >
                  {t('product.order_now').toUpperCase()}
                </Link>
              </div>
              <button
                type="button"
                onClick={(event) => handleRemoveWishlist(event, w)}
                className="self-start rounded-[8px] border border-primary/15 bg-primary/5 p-2 text-primary transition hover:bg-primary hover:text-white"
                aria-label={t('profile.remove_wishlist')}
                title={t('profile.remove_wishlist')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {renderPagination()}
    </div>
  )
}
