import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import apiClient from '../../api/axios'
import { useUiStore } from '../../store/uiStore'
import { formatDate } from '../../utils/format'

export default function ProfileNotifications() {
  const { t } = useTranslation()
  const { showToast } = useUiStore()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const loadNotifications = useCallback(() => {
    setLoading(true)
    apiClient.get('/notifications')
      .then(res => {
        setNotifications(res.data)
      })
      .catch(err => {
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const handleMarkNotificationRead = (id) => {
    apiClient.post(`/notifications/${id}/read`)
      .then(() => {
        setNotifications(current => current.map(n => n.id === id ? { ...n, read_at: new Date() } : n))
        showToast(t('profile.notification_marked_read'))
      })
  }

  const openNotification = (notification) => {
    if (!notification.read_at) {
      apiClient.post(`/notifications/${notification.id}/read`)
        .then(() => {
          setNotifications(current => current.map(item => (
            item.id === notification.id ? { ...item, read_at: new Date() } : item
          )))
        })
        .catch(() => {})
    }

    const data = notification.data || {}
    const target = data.action_url || data.url || (data.order_code ? `/orders/tracking/${data.order_code}` : null)
    if (target) {
      navigate(target)
    }
  }

  // Pagination
  const pageSize = 4
  const totalPages = Math.ceil(notifications.length / pageSize)
  const paginatedNotifications = notifications.slice((page - 1) * pageSize, page * pageSize)

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
        {t('profile.notifications_title')}
      </h2>
      
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-6 text-xs text-gray-500">{t('common.loading') || 'Loading...'}</div>
        ) : notifications.length === 0 ? (
          <p className="text-xs text-gray-400">{t('profile.no_notifications')}</p>
        ) : (
          paginatedNotifications.map((n) => {
            const unread = !n.read_at
            return (
              <div 
                key={n.id} 
                role="button"
                tabIndex={0}
                onClick={() => openNotification(n)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openNotification(n)
                  }
                }}
                className={`p-4 rounded-xl border flex justify-between items-start gap-4 transition cursor-pointer hover:-translate-y-0.5 hover:shadow-glass ${
                  unread ? 'bg-primary/5 border-primary/20' : 'bg-white border-[#E8E8E8] opacity-70'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-[#1A1A1A]">{n.data?.title}</h4>
                    {unread && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                  <p className="text-[10px] text-[#666666] leading-relaxed">{n.data?.body}</p>
                  <p className="text-[9px] text-gray-400">{formatDate(n.created_at)}</p>
                </div>

                {unread && (
                  <button 
                    onClick={(event) => {
                      event.stopPropagation()
                      handleMarkNotificationRead(n.id)
                    }}
                    className="text-[10px] text-primary hover:opacity-80 transition font-bold"
                  >
                    {t('profile.mark_read')}
                  </button>
                )}
              </div>
            )
          })
        )}
        {renderPagination()}
      </div>
    </div>
  )
}
