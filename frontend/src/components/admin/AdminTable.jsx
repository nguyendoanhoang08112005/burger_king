import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '../../store/uiStore'
import { renderFlag } from '../../utils/adminUtils'

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

export default function AdminTable({ columns, data = [], loading, onEdit, onDelete, renderActions, renderLanguageActions, emptyText }) {
  const { t } = useTranslation()
  const hasLanguageActions = typeof renderLanguageActions === 'function'
  const publicSettings = useUiStore(state => state.publicSettings)
  const dbLocales = publicSettings?.supported_locales
  const LOCALES = (dbLocales && dbLocales.length > 0) ? dbLocales : [
    { code: 'vi', flag: '🇻🇳', name: 'Tiếng Việt', is_default: true },
    { code: 'en', flag: '🇺🇸', name: 'English', is_default: false }
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700">
            {columns.map(column => (
              <th key={column.key} className="py-3 pr-4 whitespace-nowrap">{column.label}</th>
            ))}
            {hasLanguageActions && LOCALES.map(locale => (
              <th key={locale.code} className="py-3 text-center whitespace-nowrap w-[60px]">
                <span className="inline-flex items-center" title={locale.name}>
                  {renderFlag(locale.code, "h-3.5 w-5 rounded-sm object-cover shadow-sm")}
                </span>
              </th>
            ))}
            <th className="py-3 text-right whitespace-nowrap">{t('common.actions')}</th>
          </tr>
        </thead>
        {loading ? (
          <Skeleton cols={columns.length + (hasLanguageActions ? LOCALES.length : 0)} />
        ) : (
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.map(item => (
              <tr key={item.id} className="text-gray-700 dark:text-gray-200">
                {columns.map(column => (
                  <td key={column.key} className="py-3 pr-4 align-middle">
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
                {hasLanguageActions && renderLanguageActions(item, LOCALES)}
                <td className="py-3 text-right">
                  <div className="inline-flex items-center gap-2 justify-end">
                    {renderActions ? renderActions(item) : (
                      <>
                        {onEdit && (
                          <button type="button" onClick={() => onEdit(item)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500" aria-label={t('common.edit')}>
                            <Pencil size={15} />
                          </button>
                        )}
                        {onDelete && (
                          <button type="button" onClick={() => onDelete(item)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500" aria-label={t('common.delete')}>
                            <Trash2 size={15} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td colSpan={columns.length + (hasLanguageActions ? LOCALES.length + 1 : 1)} className="py-10 text-center text-gray-400">
                  {emptyText || t('common.no_result')}
                </td>
              </tr>
            )}
          </tbody>
        )}
      </table>
    </div>
  )
}
