import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function AdminPagination({ page = 1, totalPages = 1, onChange }) {
  if (totalPages <= 1) return null

  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => start + index).filter(p => p <= totalPages)

  return (
    <div className="flex items-center gap-1">
      <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)} className="p-2 rounded-lg disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <ChevronLeft size={16} />
      </button>
      {pages.map(p => (
        <button key={p} type="button" onClick={() => onChange(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-[#D62300] text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
          {p}
        </button>
      ))}
      <button type="button" disabled={page === totalPages} onClick={() => onChange(page + 1)} className="p-2 rounded-lg disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
