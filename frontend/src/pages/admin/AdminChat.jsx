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
  Code
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
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'sessions'

  // Overview stats & list states
  const [stats, setStats] = useState(null)
  const [topQuestions, setTopQuestions] = useState([])
  const [caches, setCaches] = useState([])
  const [cachesMeta, setCachesMeta] = useState({ current_page: 1, last_page: 1 })
  const [cachesPage, setCachesPage] = useState(1)
  const [loadingOverview, setLoadingOverview] = useState(false)

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
    } else {
      fetchSessionsData()
    }
  }, [activeTab, cachesPage, sessionsPage])

  const fetchOverviewData = async () => {
    setLoadingOverview(true)
    try {
      const [statsRes, topQRes, cachesRes] = await Promise.all([
        apiClient.get('/admin/chat/stats'),
        apiClient.get('/admin/chat/top-questions'),
        apiClient.get(`/admin/chat/caches?page=${cachesPage}`)
      ])
      setStats(statsRes.data)
      setTopQuestions(topQRes.data || [])
      setCaches(cachesRes.data?.data || [])
      setCachesMeta({
        current_page: cachesRes.data?.current_page || 1,
        last_page: cachesRes.data?.last_page || 1
      })
    } catch (err) {
      console.error(err)
      toast.error('Không thể tải dữ liệu thống kê Chatbot.')
    } finally {
      setLoadingOverview(false)
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
      toast.error('Không thể tải lịch sử các phiên chat.')
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
      toast.error('Không thể tải tin nhắn của phiên chat.')
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleDeleteCacheItem = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục cache này?')) return
    try {
      await apiClient.delete(`/admin/chat/caches/${id}`)
      toast.success('Đã xóa mục cache thành công.')
      fetchOverviewData()
    } catch (err) {
      console.error(err)
      toast.error('Xóa cache thất bại.')
    }
  }

  const handleClearAllCaches = async () => {
    if (!window.confirm('CẢNH BÁO: Hành động này sẽ xóa sạch toàn bộ các câu trả lời đã lưu trong bộ nhớ đệm (semantic cache) của Chatbot. Bạn có chắc chắn muốn tiếp tục?')) return
    try {
      await apiClient.post('/admin/chat/caches/clear')
      toast.success('Đã xóa toàn bộ bộ nhớ đệm thành công.')
      fetchOverviewData()
    } catch (err) {
      console.error(err)
      toast.error('Xóa toàn bộ cache thất bại.')
    }
  }

  const formatDateTime = (isoString) => {
    if (!isoString) return '-'
    try {
      const date = new Date(isoString)
      return date.toLocaleString('vi-VN', {
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

  return (
    <AdminPageShell title="Cấu hình & Thống kê AI Agent Chatbot">
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
          Tổng quan & Semantic Cache
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'sessions'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Lịch sử cuộc hội thoại
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
                  <span className="text-xs font-semibold uppercase">Phiên chat hôm nay</span>
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stats?.sessions_today ?? 0}</p>
                <p className="text-[10px] text-gray-400 mt-1">Tổng phiên: {stats?.total_sessions ?? 0}</p>
              </div>

              <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center text-gray-500 mb-1">
                  <span className="text-xs font-semibold uppercase">Tin nhắn hôm nay</span>
                  <Activity className="w-5 h-5 text-secondary" />
                </div>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stats?.messages_today ?? 0}</p>
                <p className="text-[10px] text-gray-400 mt-1">Tổng tin nhắn: {stats?.total_messages ?? 0}</p>
              </div>

              <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center text-gray-500 mb-1">
                  <span className="text-xs font-semibold uppercase">Lượt trúng Cache</span>
                  <Database className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stats?.cache_hits ?? 0}</p>
                <p className="text-[10px] text-gray-400 mt-1">Lưu trữ tối ưu hóa phản hồi nhanh</p>
              </div>

              <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center text-gray-500 mb-1">
                  <span className="text-xs font-semibold uppercase">Tỉ lệ trúng Cache</span>
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{(stats?.cache_hit_rate ?? 0.0)}%</p>
                <p className="text-[10px] text-gray-400 mt-1">Tiết kiệm phí API & giảm thời gian phản hồi</p>
              </div>
            </div>
          )}

          {/* Action to purge cache */}
          <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl">
            <div>
              <h4 className="font-bold text-red-900 dark:text-red-300 text-sm">Quản lý Semantic Cache</h4>
              <p className="text-xs text-red-700 dark:text-red-400/80 mt-0.5">Xóa cache sẽ buộc AI tạo câu trả lời mới từ đầu cho tất cả câu hỏi sau này.</p>
            </div>
            <button
              onClick={handleClearAllCaches}
              className="flex items-center gap-1.5 py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              <Trash2 className="w-4 h-4" />
              Làm trống Cache
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Cache hit Questions list */}
            <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 lg:col-span-1">
              <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Câu hỏi phổ biến nhất
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
                        {q.hit_count} hits
                      </span>
                    </div>
                  ))}
                  {!topQuestions.length && (
                    <div className="text-center py-6 text-xs text-gray-400 font-semibold">Chưa có câu hỏi cache phổ biến</div>
                  )}
                </div>
              )}
            </div>

            {/* General Caches Management */}
            <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 lg:col-span-2 overflow-x-auto">
              <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-primary" />
                Bộ nhớ đệm (Semantic Cache) chi tiết
              </h3>

              {loadingOverview ? <TableSkeleton rows={5} cols={5} /> : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-800">
                      <th className="py-3 px-2">Câu hỏi</th>
                      <th className="px-2">Trả lời</th>
                      <th className="px-2">Ngôn ngữ</th>
                      <th className="px-2">Lượt dùng</th>
                      <th className="px-2 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {caches.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                        <td className="py-3 px-2 font-bold max-w-[150px] truncate" title={item.question}>
                          {item.question}
                        </td>
                        <td className="px-2 font-medium max-w-[200px] truncate text-gray-500" title={item.answer}>
                          {item.answer}
                        </td>
                        <td className="px-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.language === 'vi' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                            {item.language === 'vi' ? 'Tiếng Việt' : 'English'}
                          </span>
                        </td>
                        <td className="px-2 font-extrabold text-[#D62300]">{item.hit_count}</td>
                        <td className="px-2 text-right">
                          <button
                            onClick={() => handleDeleteCacheItem(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            title="Xóa dòng Cache này"
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
              Danh sách phiên chat
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
                        {session.user ? session.user.name : 'Khách vãng lai'}
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
                      <span>{session.messages_count ?? 0} tin nhắn</span>
                    </div>
                  </button>
                ))}
                {!sessions.length && (
                  <div className="text-center py-8 text-xs text-gray-400 font-semibold">Chưa có phiên chat nào</div>
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
                      Cuộc hội thoại: {selectedSession.user ? selectedSession.user.name : 'Khách vãng lai'}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-medium">ID phiên: {selectedSession.session_id}</p>
                  </div>
                  <span className="text-xs text-gray-500 flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    Khởi tạo: {formatDateTime(selectedSession.created_at)}
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

                            {/* Render if assistant executed tool calling */}
                            {isBot && msg.tool_calls && (
                              <div className="mt-2.5 pt-2 border-t border-gray-300/20 dark:border-gray-700/50 flex flex-col gap-1.5 text-[10px]">
                                <div className="flex items-center gap-1 text-primary font-bold">
                                  <Code className="w-3.5 h-3.5" />
                                  <span>Công cụ sử dụng: {msg.tool_calls.name}</span>
                                </div>
                                <pre className="bg-gray-950 text-green-400 p-2 rounded-lg text-[9px] overflow-x-auto font-mono max-w-full">
                                  {JSON.stringify(msg.tool_calls.args, null, 2)}
                                </pre>
                              </div>
                            )}

                            {/* Render confirmation actions info if any */}
                            {isBot && msg.actions && (
                              <div className="mt-2 bg-primary/10 border border-primary/20 rounded-lg p-2 flex items-center gap-1.5 text-[10px] text-primary font-bold">
                                <ArrowRight className="w-3.5 h-3.5" />
                                <span>Hành động liên kết: {msg.actions.type} ({msg.actions.data?.confirm_type || 'direct'})</span>
                              </div>
                            )}
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
                <p className="text-xs font-bold">Vui lòng chọn một phiên chat để xem chi tiết tin nhắn.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminPageShell>
  )
}
