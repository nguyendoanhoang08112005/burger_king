import { Loader2 } from 'lucide-react'

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div onMouseDown={event => event.stopPropagation()} className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-300 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#161825] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
            Huỷ
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  )
}
