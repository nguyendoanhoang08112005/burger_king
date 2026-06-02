import { Pencil, Trash2 } from 'lucide-react'

const Skeleton = ({ cols }) => (
  <tbody className="animate-pulse divide-y divide-gray-100 dark:divide-gray-700">
    {Array.from({ length: 5 }).map((_, row) => (
      <tr key={row}>
        {Array.from({ length: cols + 1 }).map((__, col) => (
          <td key={col} className="py-3 pr-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
)

export default function AdminTable({ columns, data = [], loading, onEdit, onDelete, emptyText = 'Không tìm thấy dữ liệu phù hợp.' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700">
            {columns.map(column => (
              <th key={column.key} className="py-3 pr-4 whitespace-nowrap">{column.label}</th>
            ))}
            <th className="py-3 text-right whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        {loading ? (
          <Skeleton cols={columns.length} />
        ) : (
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.map(item => (
              <tr key={item.id} className="text-gray-700 dark:text-gray-200">
                {columns.map(column => (
                  <td key={column.key} className="py-3 pr-4 align-middle">
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
                <td className="py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    {onEdit && (
                      <button type="button" onClick={() => onEdit(item)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500" aria-label="Sửa">
                        <Pencil size={15} />
                      </button>
                    )}
                    {onDelete && (
                      <button type="button" onClick={() => onDelete(item)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500" aria-label="Xoá">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td colSpan={columns.length + 1} className="py-10 text-center text-gray-400">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        )}
      </table>
    </div>
  )
}
