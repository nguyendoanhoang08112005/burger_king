import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, Save, ArrowLeft, Search, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import apiClient from '../../api/axios'
import { AdminPageShell, TableSkeleton } from '../../components/layout/AdminLayout'
import { useAdminText } from '../../utils/adminUtils'

// Chuyển flat keys → nested object để ghi vào JSON file
export const buildNested = (flat) => {
  const result = {}
  Object.entries(flat).forEach(([key, value]) => {
    const keys = key.split('.')
    let current = result
    keys.forEach((k, i) => {
      if (i === keys.length - 1) {
        current[k] = value
      } else {
        current[k] = current[k] || {}
        current = current[k]
      }
    })
  })
  return result
}

export default function AdminTranslationEdit({ code: propCode }) {
  const { code: paramCode } = useParams()
  const code = propCode || paramCode || window.location.pathname.split('/').pop()
  const tAdmin = useAdminText()
  const [data, setData] = useState(null)
  const [edited, setEdited] = useState({})
  const [filter, setFilter] = useState('all') // all | translated | untranslated
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 25

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filter])

  const fetchTranslations = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await apiClient.get(`/admin/translations/${code}`)
      setData(res.data.data)
    } catch {
      toast.error(tAdmin('toast_load_error', 'Không thể tải dữ liệu dịch thuật.'))
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchTranslations()
  }, [code])

  const handleChange = (key, value) => {
    setEdited(prev => {
      // Nếu giá trị nhập vào trùng với giá trị ban đầu thì xóa khỏi edited
      const originalValue = data?.translations[key] ?? ''
      if (value === originalValue) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: value }
    })
  }

  const handleSave = async () => {
    const editKeysCount = Object.keys(edited).length
    if (editKeysCount === 0) return

    setSaving(true)
    try {
      // Gộp các thay đổi mới vào dữ liệu hiện có để gửi cấu trúc nested hoàn chỉnh lên server
      const updatedFlat = { ...data.translations, ...edited }
      
      await apiClient.put(`/admin/translations/${code}`, {
        translations: buildNested(updatedFlat)
      })

      toast.success(tAdmin('toast_save_success', 'Đã lưu bản dịch thành công!'))
      setEdited({})
      await fetchTranslations(true)
    } catch {
      toast.error(tAdmin('toast_save_error', 'Lỗi khi lưu bản dịch.'))
    } finally {
      setSaving(false)
    }
  }

  // Lấy giá trị hiện thời của một key
  const getCurrentValue = (key) => {
    if (edited[key] !== undefined) return edited[key]
    return data?.translations[key] ?? ''
  }

  // Lọc danh sách keys
  const filteredKeys = Object.keys(data?.source_translations ?? {}).filter(key => {
    const sourceValue = data.source_translations[key] ?? ''
    const currentVal = getCurrentValue(key)
    const isDirty = edited[key] !== undefined

    const matchSearch = search
      ? key.toLowerCase().includes(search.toLowerCase()) ||
        sourceValue.toLowerCase().includes(search.toLowerCase()) ||
        currentVal.toLowerCase().includes(search.toLowerCase())
      : true

    const matchFilter = isDirty || (
      filter === 'all' ? true :
      filter === 'translated' ? !!currentVal :
      !currentVal // untranslated
    )

    return matchSearch && matchFilter
  })

  const changesCount = Object.keys(edited).length

  const totalItems = filteredKeys.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const paginatedKeys = filteredKeys.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  if (loading) {
    return (
      <AdminPageShell title={tAdmin('translation_title', 'Dịch thuật')}>
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
          <TableSkeleton rows={8} cols={3} />
        </div>
      </AdminPageShell>
    )
  }

  return (
    <AdminPageShell
      title={
        <div className="flex items-center gap-3">
          <Link
            to="/admin/translations/locales"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors border border-gray-100 dark:border-gray-700"
            title={tAdmin('back_to_locales', 'Quay lại danh sách ngôn ngữ')}
          >
            <ArrowLeft size={16} className="text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {tAdmin('translation_title_with_code', 'Dịch thuật: {{code}}', { code: code.toUpperCase() })}
            </span>
            <div className="flex items-center gap-2.5 mt-1.5">
              <div className="w-28 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D62300] rounded-full transition-all duration-500"
                  style={{ width: `${data?.progress}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                {tAdmin('progress_completed_with_percent', '{{percent}}% hoàn thành', { percent: data?.progress })}
              </span>
            </div>
          </div>
        </div>
      }
      eyebrow={tAdmin('localization_breadcrumb', 'Cài đặt ngôn ngữ')}
    >
      {/* Khung bộ lọc và tìm kiếm */}
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['all', 'translated', 'untranslated'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                filter === f
                  ? 'bg-[#D62300] text-white border-transparent shadow-sm'
                  : 'bg-white dark:bg-[#1E2130] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {f === 'all' && tAdmin('all', 'Tất cả')}
              {f === 'translated' && tAdmin('translated', 'Đã dịch')}
              {f === 'untranslated' && tAdmin('untranslated', 'Chưa dịch')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={tAdmin('search_placeholder', 'Tìm key hoặc nội dung...')}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-red-300 bg-white dark:bg-[#161825] text-gray-800 dark:text-gray-100"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || changesCount === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer ${
              changesCount > 0
                ? 'bg-[#D62300] hover:bg-[#b51e00] shadow-md shadow-red-500/10'
                : 'bg-gray-300 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-transparent'
            }`}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{tAdmin('save_changes', 'Lưu thay đổi')}{changesCount > 0 && ` (${changesCount})`}</span>
          </button>
        </div>
      </div>

      {/* Bảng Key-Value dịch */}
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/70 dark:bg-[#161825]/50 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 w-[25%]">{tAdmin('key_column', 'Từ khóa')}</th>
                <th className="px-6 py-4 w-[35%]">
                  {data?.source_flag || '🇻🇳'} {data?.source_name || 'Tiếng Việt'}
                </th>
                <th className="px-6 py-4 w-[40%]">{tAdmin('translation_input', 'Bản dịch ngôn ngữ')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paginatedKeys.map(key => {
                const sourceValue = data.source_translations[key] ?? ''
                const currentValue = getCurrentValue(key)
                const isDirty = edited[key] !== undefined
                const isEmpty = !currentValue

                return (
                  <tr
                    key={key}
                    className={`transition-colors hover:bg-gray-50/30 dark:hover:bg-gray-800/10 ${
                      isDirty ? 'bg-blue-50/10 dark:bg-blue-900/5' : ''
                    }`}
                  >
                    {/* Key */}
                    <td className="px-6 py-4 align-top">
                      <code className="text-[10px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded break-all">
                        {key}
                      </code>
                    </td>
                    {/* Vi Source */}
                    <td className="px-6 py-4 align-top">
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                        {sourceValue}
                      </p>
                    </td>
                    {/* Translation Input */}
                    <td className="px-6 py-4 align-top">
                      <input
                        value={currentValue}
                        onChange={e => handleChange(key, e.target.value)}
                        placeholder={tAdmin('translate_placeholder', 'Dịch: "{{value}}"', { value: sourceValue })}
                        className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-400 dark:focus:border-red-500 transition-all bg-white dark:bg-[#161825] text-gray-800 dark:text-gray-100 ${
                          isEmpty
                            ? 'border-amber-200/80 bg-amber-50/5 dark:border-amber-900/30'
                            : isDirty
                            ? 'border-blue-400 bg-blue-50/10 dark:border-blue-800/30'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      />
                      {isEmpty && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1 font-semibold">
                          <AlertCircle size={10} /> {tAdmin('untranslated_hint', 'Chưa được dịch (sẽ tự động dùng mặc định)')}
                        </span>
                      )}
                      {isDirty && (
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1 font-semibold">
                          <CheckCircle size={10} /> {tAdmin('dirty_hint', 'Đã chỉnh sửa (chưa lưu)')}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filteredKeys.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
                    {tAdmin('not_found_keys', 'Không tìm thấy tệp từ khóa nào khớp với điều kiện lọc.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phân trang */}
      {totalItems > 0 && (
        <div className="mt-5 bg-white dark:bg-[#1E2130] rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {tAdmin('showing_from', 'Hiển thị từ')}{' '}
            <span className="font-semibold text-gray-800 dark:text-gray-200">{Math.min(totalItems, (currentPage - 1) * pageSize + 1)}</span>{' '}
            {tAdmin('showing_to', 'đến')}{' '}
            <span className="font-semibold text-gray-800 dark:text-gray-200">{Math.min(totalItems, currentPage * pageSize)}</span>{' '}
            {tAdmin('showing_total', 'trong tổng số')}{' '}
            <span className="font-semibold text-[#D62300]">{totalItems}</span>{' '}
            {tAdmin('showing_unit', 'từ khóa')}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
            >
              <ChevronLeft size={16} />
            </button>
            
            {(() => {
              const pages = []
              const maxVisible = 5
              let start = Math.max(1, currentPage - 2)
              let end = Math.min(totalPages, start + maxVisible - 1)
              
              if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1)
              }

              if (start > 1) {
                pages.push(
                  <button key={1} type="button" onClick={() => setCurrentPage(1)} className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border ${currentPage === 1 ? 'bg-[#D62300] text-white border-transparent' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-pointer'}`}>1</button>
                )
                if (start > 2) pages.push(<span key="dots-start" className="px-1 text-gray-400">...</span>)
              }

              for (let i = start; i <= end; i++) {
                pages.push(
                  <button
                    type="button"
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border ${
                      currentPage === i
                        ? 'bg-[#D62300] text-white border-transparent'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-pointer'
                    }`}
                  >
                    {i}
                  </button>
                )
              }

              if (end < totalPages) {
                if (end < totalPages - 1) pages.push(<span key="dots-end" className="px-1 text-gray-400">...</span>)
                pages.push(
                  <button key={totalPages} type="button" onClick={() => setCurrentPage(totalPages)} className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border ${currentPage === totalPages ? 'bg-[#D62300] text-white border-transparent' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-pointer'}`}>{totalPages}</button>
                )
              }

              return pages
            })()}

            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </AdminPageShell>
  )
}
