import React, { useState, useEffect } from 'react'
import {
  Bot,
  Trash2,
  Calendar,
  User,
  MessageSquare,
  Activity,
  RefreshCw,
  Search,
  Sparkles,
  CheckCircle,
  Database,
  ArrowRight,
  Code,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import apiClient from '../../api/axios'
import {
  AdminPageShell,
  TableSkeleton,
  EmptyTableRow,
  Pagination
} from '../../components/layout/AdminLayout'
import { useTranslation } from 'react-i18next'

export default function AdminChatPage() {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'sessions' | 'ai_mgmt'

  // Overview stats & list states
  const [stats, setStats] = useState(null)
  const [topQuestions, setTopQuestions] = useState([])
  const [topQuestionsMeta, setTopQuestionsMeta] = useState({ current_page: 1, last_page: 1 })
  const [topQuestionsPage, setTopQuestionsPage] = useState(1)
  const [caches, setCaches] = useState([])
  const [cachesMeta, setCachesMeta] = useState({ current_page: 1, last_page: 1 })
  const [cachesPage, setCachesPage] = useState(1)
  const [loadingOverview, setLoadingOverview] = useState(false)

  // AI Management states
  const [aiStatus, setAiStatus] = useState(null)
  const [loadingAi, setLoadingAi] = useState(false)

  // Cache detail modal states
  const [selectedCache, setSelectedCache] = useState(null)

  // Cache purge password modal states
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [purging, setPurging] = useState(false)

  // Sessions log states
  const [sessions, setSessions] = useState([])
  const [sessionsMeta, setSessionsMeta] = useState({ current_page: 1, last_page: 1 })
  const [sessionsPage, setSessionsPage] = useState(1)
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessionMessages, setSessionMessages] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverviewData()
    } else if (activeTab === 'sessions') {
      fetchSessionsData()
    } else if (activeTab === 'ai_mgmt') {
      fetchAiStatusData()
    }
  }, [activeTab, cachesPage, topQuestionsPage, sessionsPage])

  const fetchOverviewData = async () => {
    setLoadingOverview(true)
    try {
      const [statsRes, topQRes, cachesRes] = await Promise.all([
        apiClient.get('/admin/chat/stats'),
        apiClient.get(`/admin/chat/top-questions?page=${topQuestionsPage}`),
        apiClient.get(`/admin/chat/caches?page=${cachesPage}`)
      ])
      setStats(statsRes.data)
      setTopQuestions(topQRes.data?.data || [])
      setTopQuestionsMeta({
        current_page: topQRes.data?.current_page || 1,
        last_page: topQRes.data?.last_page || 1
      })
      setCaches(cachesRes.data?.data || [])
      setCachesMeta({
        current_page: cachesRes.data?.current_page || 1,
        last_page: cachesRes.data?.last_page || 1
      })
    } catch (err) {
      console.error(err)
      toast.error(t('adminPanel.chatbot.err_stats'))
    } finally {
      setLoadingOverview(false)
    }
  }

  const fetchAiStatusData = async () => {
    setLoadingAi(true)
    try {
      const res = await apiClient.get('/admin/chat/ai-status')
      setAiStatus(res.data)
    } catch (err) {
      console.error(err)
      toast.error('Không thể tải thông tin cấu hình AI')
    } finally {
      setLoadingAi(false)
    }
  }

  const fetchSessionsData = async () => {
    setLoadingSessions(true)
    try {
      const res = await apiClient.get(`/admin/chat/sessions?page=${sessionsPage}`)
      setSessions(res.data?.data || [])
      setSessionsMeta({
        current_page: res.data?.current_page || 1,
        last_page: res.data?.last_page || 1
      })
    } catch (err) {
      console.error(err)
      toast.error(t('adminPanel.chatbot.err_sessions'))
    } finally {
      setLoadingSessions(false)
    }
  }

  const handleSelectSession = async (session) => {
    setSelectedSession(session)
    setLoadingMessages(true)
    try {
      const res = await apiClient.get(`/admin/chat/sessions/${session.session_id}`)
      setSessionMessages(res.data || [])
    } catch (err) {
      console.error(err)
      toast.error(t('adminPanel.chatbot.err_messages'))
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleDeleteCacheItem = async (id) => {
    if (!window.confirm(t('adminPanel.chatbot.confirm_delete_cache_item'))) return
    try {
      await apiClient.delete(`/admin/chat/caches/${id}`)
      toast.success(t('adminPanel.chatbot.success_delete_cache_item'))
      fetchOverviewData()
    } catch (err) {
      console.error(err)
      toast.error(t('adminPanel.chatbot.err_delete_cache_item'))
    }
  }

  const handleClearAllCaches = () => {
    setShowPurgeConfirm(true)
  }

  const submitClearAllCaches = async () => {
    if (!adminPassword) return
    setPurging(true)
    try {
      await apiClient.post('/admin/chat/caches/clear', { password: adminPassword })
      toast.success(t('adminPanel.chatbot.success_clear_all_caches'))
      setShowPurgeConfirm(false)
      setAdminPassword('')
      fetchOverviewData()
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || t('adminPanel.chatbot.err_clear_all_caches')
      toast.error(msg)
    } finally {
      setPurging(false)
    }
  }

  const formatDateTime = (isoString) => {
    if (!isoString) return '-'
    try {
      const date = new Date(isoString)
      return date.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return isoString
    }
  }

  const renderToolCallBeautifully = (toolCall) => {
    if (!toolCall) return null
    const { name, args } = toolCall
    let description = ''
    switch (name) {
      case 'get_menu':
        description = `📋 Xem thực đơn` + (args.category ? ` (Danh mục: ${args.category})` : '')
        break
      case 'get_product_detail':
        description = `🔍 Xem chi tiết món: "${args.query || ''}"`
        break
      case 'get_combos':
        description = `📋 Xem các Value Combos`
        break
      case 'get_branches':
        description = `📍 Tra cứu hệ thống chi nhánh`
        break
      case 'get_active_coupons':
        description = `🎟️ Xem mã khuyến mãi hoạt động`
        break
      case 'get_order_status':
        description = `📦 Kiểm tra đơn hàng` + (args.order_code ? `: ${args.order_code}` : '')
        break
      case 'get_loyalty_points':
        description = `💎 Xem điểm tích lũy thành viên`
        break
      case 'add_to_cart':
        description = `🛒 Thêm vào giỏ hàng`
        break
      case 'cancel_order':
        description = `🚫 Yêu cầu hủy đơn hàng: ${args.order_code || ''}`
        break
      default:
        description = `⚙️ Gọi công cụ: ${name}`
    }
    return (
      <div className="mt-2 text-[10px] text-gray-500 dark:text-gray-400 font-bold bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-700/50 rounded-lg py-1 px-2.5 w-fit flex items-center gap-1.5 shadow-sm">
        <Code className="w-3.5 h-3.5 text-gray-400" />
        <span>{description}</span>
      </div>
    )
  }

  const renderActionBeautifully = (actions) => {
    if (!actions) return null
    const { type, sub_type, data } = actions

    if (type === 'product') {
      const prod = data?.product || data
      if (!prod) return null
      return (
        <div className="mt-2 bg-white dark:bg-[#161825] border border-gray-100 dark:border-gray-800 rounded-xl p-2 flex items-center gap-3 max-w-sm shadow-sm">
          {prod.thumbnail && (
            <img src={prod.thumbnail} alt={prod.name} className="w-11 h-11 object-cover rounded-lg bg-gray-50 flex-shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-gray-800 dark:text-gray-200 truncate">{prod.name}</p>
            <p className="text-[10px] text-primary font-bold">{prod.sale_price ? `${Number(prod.sale_price).toLocaleString()}đ` : `${Number(prod.base_price || 0).toLocaleString()}đ`}</p>
          </div>
        </div>
      )
    }

    if (type === 'confirm' && sub_type === 'add_to_cart' && data) {
      return (
        <div className="mt-2 bg-[#FFF5F5] dark:bg-red-950/10 border border-primary/5 rounded-xl p-2.5 text-primary flex items-start gap-3 max-w-sm shadow-sm">
          {data.product?.thumbnail && (
            <img src={data.product.thumbnail} alt={data.product.name} className="w-12 h-12 object-cover rounded-lg bg-white flex-shrink-0 border border-primary/5 shadow-sm" />
          )}
          <div className="min-w-0 flex-1 text-[10px]">
            <span className="font-extrabold text-primary">Thêm vào giỏ:</span> <span className="font-bold text-gray-800 dark:text-gray-200">{data.product?.name}</span>
            {data.size && <span className="ml-1 px-1 bg-primary/10 rounded font-semibold text-[9px]">{data.size}</span>}
            {data.toppings && data.toppings.length > 0 && (
              <div className="mt-0.5 text-[9px] text-gray-500">
                + Toppings: {data.toppings.map(t => t.name).join(', ')}
              </div>
            )}
            {data.quantity && <div className="mt-0.5 text-[9px] text-gray-500">Số lượng: {data.quantity}</div>}
          </div>
        </div>
      )
    }

    if (type === 'confirm' && sub_type === 'cancel_order' && data) {
      return (
        <div className="mt-2 bg-[#FFF5F5] dark:bg-red-950/10 border border-primary/5 rounded-xl p-2 text-primary text-[10px] max-w-sm font-bold flex items-center gap-1.5 shadow-sm">
          <ArrowRight className="w-3.5 h-3.5" />
          <span>Hủy đơn hàng: {data.order_code}</span>
        </div>
      )
    }

    return (
      <div className="mt-2 bg-primary/5 border border-primary/10 rounded-lg py-1 px-2.5 flex items-center gap-1.5 text-[10px] text-primary font-bold w-fit shadow-sm">
        <ArrowRight className="w-3.5 h-3.5" />
        <span>Hành động: {type === 'navigate' ? `Mở liên kết ${data?.url || ''}` : type}</span>
      </div>
    )
  }

  return (
    <AdminPageShell title={t('adminPanel.chatbot.title')}>
      {/* Tabs list */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-px mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {t('adminPanel.chatbot.tab_overview')}
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'sessions'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {t('adminPanel.chatbot.tab_sessions')}
        </button>
        <button
          onClick={() => setActiveTab('ai_mgmt')}
          className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'ai_mgmt'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {t('adminPanel.chatbot.tab_ai_mgmt')}
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats metrics widgets */}
          {loadingOverview && !stats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-[#1E2130] rounded-2xl p-5 shadow-sm animate-pulse h-24"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center text-gray-500 mb-1">
                  <span className="text-xs font-semibold uppercase">{t('adminPanel.chatbot.sessions_today')}</span>
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stats?.sessions_today ?? 0}</p>
                <p className="text-[10px] text-gray-400 mt-1">{t('adminPanel.chatbot.total_sessions', { count: stats?.total_sessions ?? 0 })}</p>
              </div>

              <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center text-gray-500 mb-1">
                  <span className="text-xs font-semibold uppercase">{t('adminPanel.chatbot.messages_today')}</span>
                  <Activity className="w-5 h-5 text-secondary" />
                </div>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stats?.messages_today ?? 0}</p>
                <p className="text-[10px] text-gray-400 mt-1">{t('adminPanel.chatbot.total_messages', { count: stats?.total_messages ?? 0 })}</p>
              </div>

              <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center text-gray-500 mb-1">
                  <span className="text-xs font-semibold uppercase">{t('adminPanel.chatbot.cache_hits')}</span>
                  <Database className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stats?.cache_hits ?? 0}</p>
                <p className="text-[10px] text-gray-400 mt-1">{t('adminPanel.chatbot.cache_hits_desc')}</p>
              </div>

              <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center text-gray-500 mb-1">
                  <span className="text-xs font-semibold uppercase">{t('adminPanel.chatbot.cache_hit_rate')}</span>
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{(stats?.cache_hit_rate ?? 0.0)}%</p>
                <p className="text-[10px] text-gray-400 mt-1">{t('adminPanel.chatbot.cache_hit_rate_desc')}</p>
              </div>
            </div>
          )}

          {/* Action to purge cache */}
          <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl">
            <div>
              <h4 className="font-bold text-red-900 dark:text-red-300 text-sm">{t('adminPanel.chatbot.cache_mgmt')}</h4>
              <p className="text-xs text-red-700 dark:text-red-400/80 mt-0.5">{t('adminPanel.chatbot.cache_mgmt_desc')}</p>
            </div>
            <button
              onClick={handleClearAllCaches}
              className="flex items-center gap-1.5 py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              <Trash2 className="w-4 h-4" />
              {t('adminPanel.chatbot.clear_cache')}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Cache hit Questions list */}
            <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 lg:col-span-1">
              <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {t('adminPanel.chatbot.top_questions')}
              </h3>
              {loadingOverview ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {topQuestions.map((q) => (
                    <div key={q.id} className="p-3 bg-[#FFFAF5] dark:bg-[#161825] rounded-xl flex justify-between items-start gap-2 border border-gray-100 dark:border-gray-800">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{q.question}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{q.answer}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 font-extrabold text-[10px] rounded-full">
                        {t('adminPanel.chatbot.hits_count', { count: q.hit_count })}
                      </span>
                    </div>
                  ))}
                  {!topQuestions.length && (
                    <div className="text-center py-6 text-xs text-gray-400 font-semibold">{t('adminPanel.chatbot.no_top_questions')}</div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <Pagination page={topQuestionsPage} totalPages={topQuestionsMeta.last_page} onChange={setTopQuestionsPage} />
                  </div>
                </div>
              )}
            </div>

            {/* General Caches Management */}
            <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 lg:col-span-2 overflow-x-auto">
              <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-primary" />
                {t('adminPanel.chatbot.semantic_cache_details')}
              </h3>

              {loadingOverview ? <TableSkeleton rows={5} cols={5} /> : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-800">
                      <th className="py-3 px-2">{t('adminPanel.chatbot.question')}</th>
                      <th className="px-2">{t('adminPanel.chatbot.answer')}</th>
                      <th className="px-2">{t('adminPanel.chatbot.language')}</th>
                      <th className="px-2">{t('adminPanel.chatbot.hits')}</th>
                      <th className="px-2 text-right">{t('adminPanel.chatbot.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {caches.map((item) => (
                      <tr 
                        key={item.id} 
                        onClick={() => setSelectedCache(item)}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 cursor-pointer transition-all"
                      >
                        <td className="py-3 px-2 font-bold max-w-[150px] truncate" title={item.question}>
                          {item.question}
                        </td>
                        <td className="px-2 font-medium max-w-[200px] truncate text-gray-500" title={item.answer}>
                          {item.answer}
                        </td>
                        <td className="px-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.language === 'vi' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                            {item.language === 'vi' ? t('adminPanel.chatbot.lang_vi') : t('adminPanel.chatbot.lang_en')}
                          </span>
                        </td>
                        <td className="px-2 font-extrabold text-[#D62300]">{item.hit_count}</td>
                        <td className="px-2 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteCacheItem(item.id)
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            title={t('adminPanel.chatbot.delete_cache_item')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!caches.length && <EmptyTableRow colSpan={5} />}
                  </tbody>
                </table>
              )}
              <div className="mt-4 flex justify-end">
                <Pagination page={cachesPage} totalPages={cachesMeta.last_page} onChange={setCachesPage} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Sessions sidebar list */}
          <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 lg:col-span-1">
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-primary" />
              {t('adminPanel.chatbot.sessions_list')}
            </h3>

            {loadingSessions ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleSelectSession(session)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                      selectedSession?.session_id === session.session_id
                        ? 'bg-[#FFF5F5] border-primary/20 dark:bg-red-950/20'
                        : 'bg-[#FFFAF5] dark:bg-[#161825] border-gray-100 dark:border-gray-800 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        {session.user ? session.user.name : t('adminPanel.chatbot.guest')}
                      </span>
                      <span className="text-[9px] font-bold uppercase px-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded">
                        {session.language}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 w-full font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateTime(session.created_at)}
                      </span>
                      <span>{t('adminPanel.chatbot.messages_count', { count: session.messages_count ?? 0 })}</span>
                    </div>
                  </button>
                ))}
                {!sessions.length && (
                  <div className="text-center py-8 text-xs text-gray-400 font-semibold">{t('adminPanel.chatbot.no_sessions')}</div>
                )}
                <div className="mt-4 flex justify-center">
                  <Pagination page={sessionsPage} totalPages={sessionsMeta.last_page} onChange={setSessionsPage} />
                </div>
              </div>
            )}
          </div>

          {/* Active messages log viewer */}
          <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 lg:col-span-2 min-h-[450px] flex flex-col">
            {selectedSession ? (
              <>
                <div className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                      {t('adminPanel.chatbot.conversation', { name: selectedSession.user ? selectedSession.user.name : t('adminPanel.chatbot.guest') })}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-medium">{t('adminPanel.chatbot.session_id', { id: selectedSession.session_id })}</p>
                  </div>
                  <span className="text-xs text-gray-500 flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    {t('adminPanel.chatbot.started_at', { time: formatDateTime(selectedSession.created_at) })}
                  </span>
                </div>

                {loadingMessages ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto max-h-[480px] space-y-4 pr-1">
                    {sessionMessages.map((msg) => {
                      const isBot = msg.role === 'assistant'
                      return (
                        <div key={msg.id} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
                          <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-premium text-xs leading-relaxed ${
                            isBot
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none'
                              : 'bg-primary text-white rounded-tr-none'
                          }`}>
                            <p className="whitespace-pre-wrap font-semibold">{msg.content}</p>

                            {/* Render if assistant executed tool calling beautifully */}
                            {isBot && msg.tool_calls && renderToolCallBeautifully(msg.tool_calls)}

                            {/* Render confirmation actions beautifully */}
                            {isBot && msg.actions && renderActionBeautifully(msg.actions)}
                          </div>
                          <span className="text-[9px] text-gray-400 mt-1 px-1">{formatDateTime(msg.created_at)}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                <Bot className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-xs font-bold">{t('adminPanel.chatbot.select_session')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ai_mgmt' && (
        <div className="space-y-6">
          {loadingAi && !aiStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm animate-pulse h-32"></div>
              ))}
            </div>
          ) : (
            <>
              {/* AI Config overview cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Model & Status */}
                <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center text-gray-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">{t('adminPanel.chatbot.ai_model')}</span>
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">{aiStatus?.model_name || 'gemini-2.5-flash'}</h3>
                  <p className="text-xs text-green-600 font-bold mt-1.5 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                    {aiStatus?.api_status === 'Active' ? t('adminPanel.chatbot.active') : t('adminPanel.chatbot.inactive')}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-2 font-medium">{aiStatus?.tier || 'Gemini API Free Tier'}</p>
                </div>

                {/* Card 2: RPM Rate limits */}
                <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center text-gray-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">{t('adminPanel.chatbot.rpm_limit')}</span>
                    <Activity className="w-5 h-5 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">{aiStatus?.limit_rpm || 15} RPM</h3>
                  <p className="text-xs text-gray-500 mt-1.5 font-medium">{t('adminPanel.chatbot.rpm_limit_desc')}</p>
                  <p className="text-[10px] text-gray-400 mt-2 font-medium">TPM Limit: {aiStatus?.limit_tpm?.toLocaleString() || '1,000,000'} tokens/phút</p>
                </div>

                {/* Card 3: Latency */}
                <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center text-gray-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">{t('adminPanel.chatbot.average_latency')}</span>
                    <RefreshCw className="w-5 h-5 text-secondary animate-spin-slow" />
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">~1.2 {t('adminPanel.chatbot.seconds_unit', 'giây')}</h3>
                  <p className="text-xs text-gray-500 mt-1.5 font-medium">{t('adminPanel.chatbot.latency_desc')}</p>
                  <p className="text-[10px] text-gray-400 mt-2 font-medium">{t('adminPanel.chatbot.sdk_connection')}</p>
                </div>
              </div>

              {/* Resource Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Requests Quota */}
                <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold text-sm text-gray-800 dark:text-gray-200">{t('adminPanel.chatbot.daily_requests_quota')}</h3>
                    <span className="text-xs font-extrabold text-[#D62300]">
                      {aiStatus?.requests_today} / {aiStatus?.limit_rpd} {t('adminPanel.chatbot.requests_unit')}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((aiStatus?.requests_today || 0) / (aiStatus?.limit_rpd || 1500)) * 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>{t('adminPanel.chatbot.used')}: {((aiStatus?.requests_today || 0) / (aiStatus?.limit_rpd || 1500) * 100).toFixed(1)}%</span>
                    <span className="text-green-600">{t('adminPanel.chatbot.remaining')}: {aiStatus?.remaining_requests_today} {t('adminPanel.chatbot.requests_unit')}</span>
                  </div>
                </div>

                {/* Tokens Quota */}
                <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold text-sm text-gray-800 dark:text-gray-200">{t('adminPanel.chatbot.estimated_tokens_today')}</h3>
                    <span className="text-xs font-extrabold text-purple-600">
                      {aiStatus?.estimated_tokens_today?.toLocaleString()} / {((aiStatus?.remaining_tokens_today || 0) + (aiStatus?.estimated_tokens_today || 0))?.toLocaleString()} {t('adminPanel.chatbot.tokens_unit')}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((aiStatus?.estimated_tokens_today || 0) / ((aiStatus?.remaining_tokens_today || 0) + (aiStatus?.estimated_tokens_today || 0) || 1)) * 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>{t('adminPanel.chatbot.used')}: {(((aiStatus?.estimated_tokens_today || 0) / ((aiStatus?.remaining_tokens_today || 0) + (aiStatus?.estimated_tokens_today || 0) || 1)) * 100).toFixed(2)}%</span>
                    <span className="text-purple-600">{t('adminPanel.chatbot.remaining')}: ~{aiStatus?.remaining_tokens_today?.toLocaleString()} {t('adminPanel.chatbot.tokens_unit')}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Cache Detail Modal */}
      {selectedCache && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1E2130] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-[#161825] border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-base flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                {t('adminPanel.chatbot.cache_detail_title')}
              </h3>
              <button 
                onClick={() => setSelectedCache(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Question */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {t('adminPanel.chatbot.full_question')}
                </h4>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl font-bold text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {selectedCache.question}
                </div>
              </div>

              {/* Answer */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {t('adminPanel.chatbot.full_answer')}
                </h4>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selectedCache.answer}
                </div>
              </div>

              {/* Action and Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Linked Action */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    {t('adminPanel.chatbot.linked_action')}
                  </h4>
                  {selectedCache.actions ? (
                    renderActionBeautifully(selectedCache.actions)
                  ) : (
                    <div className="text-xs font-semibold text-gray-400 italic py-1">
                      {t('adminPanel.chatbot.no_action_linked')}
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-500">{t('adminPanel.chatbot.language')}:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedCache.language === 'vi' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                      {selectedCache.language === 'vi' ? t('adminPanel.chatbot.lang_vi') : t('adminPanel.chatbot.lang_en')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-500">{t('adminPanel.chatbot.hits')}:</span>
                    <span className="font-extrabold text-primary">{selectedCache.hit_count} {t('adminPanel.chatbot.hits_count', { count: selectedCache.hit_count })}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-500">{t('adminPanel.chatbot.last_hit')}:</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      {selectedCache.last_hit_at ? formatDateTime(selectedCache.last_hit_at) : formatDateTime(selectedCache.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end px-6 py-4 bg-gray-50 dark:bg-[#161825] border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={() => setSelectedCache(null)}
                className="py-2 px-5 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                {t('adminPanel.chatbot.close', 'Đóng')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purge Cache Password Confirmation Modal */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1E2130] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-red-100 dark:border-red-950/20 transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-red-50 dark:bg-red-950/10 border-b border-red-100 dark:border-red-900/20">
              <h3 className="font-extrabold text-red-700 dark:text-red-400 text-base flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                {t('adminPanel.chatbot.purge_password_title')}
              </h3>
              <button 
                onClick={() => {
                  setShowPurgeConfirm(false)
                  setAdminPassword('')
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                disabled={purging}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-red-600 dark:text-red-400 font-bold leading-relaxed">
                {t('adminPanel.chatbot.purge_password_desc')}
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('adminPanel.chatbot.password_label')}
                </label>
                <input 
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder={t('adminPanel.chatbot.password_placeholder')}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
                  disabled={purging}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && adminPassword) {
                      submitClearAllCaches()
                    }
                  }}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-[#161825] border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={() => {
                  setShowPurgeConfirm(false)
                  setAdminPassword('')
                }}
                className="py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                disabled={purging}
              >
                {t('adminPanel.chatbot.cancel')}
              </button>
              <button 
                onClick={submitClearAllCaches}
                className="flex items-center gap-1.5 py-2 px-5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                disabled={!adminPassword || purging}
              >
                {purging ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                {t('adminPanel.chatbot.confirm_purge_btn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageShell>
  )
}
