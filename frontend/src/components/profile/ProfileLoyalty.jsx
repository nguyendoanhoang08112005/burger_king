import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import apiClient from '../../api/axios'
import { formatDate } from '../../utils/format'

export default function ProfileLoyalty() {
  const { t } = useTranslation()
  const [loyalty, setLoyalty] = useState({ balance: 0, transactions: [] })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const loadLoyalty = useCallback(() => {
    setLoading(true)
    apiClient.get('/loyalty-points')
      .then(res => {
        setLoyalty(res.data)
      })
      .catch(err => {
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    loadLoyalty()
  }, [loadLoyalty])

  // Pagination
  const pageSize = 4
  const totalPages = Math.ceil((loyalty.transactions?.length || 0) / pageSize)
  const paginatedTransactions = (loyalty.transactions || []).slice((page - 1) * pageSize, page * pageSize)

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
    <div className="space-y-6 text-left">
      <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">
        {t('profile.loyalty_history')}
      </h2>
      
      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row justify-between items-center gap-4 animate-float">
        <div>
          <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{t('profile.loyalty_member_badge')}</span>
          <h3 className="font-bold text-2xl text-[#1A1A1A] uppercase tracking-[0.3px] mt-1">{t('profile.loyalty_reward_title')}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-heading text-4xl text-primary">{loyalty.balance}</span>
          <span className="text-xs text-primary font-semibold">{t('profile.available_points')}</span>
        </div>
      </div>

      <div className="space-y-2 mt-6">
        <span className="text-[10px] text-gray-400 font-bold block mb-2 uppercase">{t('profile.transaction_history')}</span>
        {loading ? (
          <div className="text-center py-4 text-xs text-gray-500">{t('common.loading') || 'Loading...'}</div>
        ) : !loyalty.transactions || loyalty.transactions.length === 0 ? (
          <p className="text-xs text-gray-400">{t('profile.no_loyalty_transactions')}</p>
        ) : (
          paginatedTransactions.map((tr) => (
            <div key={tr.id} className="p-4 rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-[#1A1A1A] leading-tight">{tr.description}</p>
                <p className="text-[10px] text-gray-500 mt-1">{formatDate(tr.created_at)}</p>
              </div>
              <span className="font-bold text-sm text-primary">
                {tr.type === 'earn' ? '+' : '-'}{tr.points} {t('profile.points')}
              </span>
            </div>
          ))
        )}
        {renderPagination()}
      </div>
    </div>
  )
}
