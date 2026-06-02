const styles = {
  active: 'bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300',
  inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  published: 'bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300',
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300',
  hidden: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
}

const labels = {
  active: 'Active',
  inactive: 'Inactive',
  published: 'Published',
  draft: 'Draft',
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  hidden: 'Ẩn',
}

export default function StatusBadge({ status }) {
  const key = status || 'inactive'
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${styles[key] || styles.inactive}`}>
      {labels[key] || key}
    </span>
  )
}
